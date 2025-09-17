import SignClient from "@walletconnect/sign-client";
import { ethers } from "ethers";

let client;
let session;

export async function initWC(projectId) {
    client = await SignClient.init({
        projectId,
        metadata: {
            name: "ETH Fee App",
            description: "Cobro fee ETH estilo Lemon",
            url: "https://eth-sc.vercel.app",
            icons: ["https://eth-sc.vercel.app/icon.png"],
        },
    });

    // 🔥 Eventos reales soportados en SignClient v2
    client.on("session_proposal", (proposal) => {
        console.log("📡 Propuesta de sesión:", proposal);
    });

    client.on("session_update", ({ topic, params }) => {
        console.log("🔄 Sesión actualizada:", topic, params);
    });

    client.on("session_delete", ({ topic }) => {
        console.log("❌ Sesión eliminada:", topic);
        session = null;
    });

    client.on("session_event", ({ topic, params }) => {
        console.log("⚡ Evento de sesión:", topic, params);
    });

    return client;
}

export async function connectWallet(setWcUri) {
    if (!client) throw new Error("WalletConnect no inicializado");

    const { uri, approval } = await client.connect({
        requiredNamespaces: {
            eip155: {
                methods: ["eth_sendTransaction", "personal_sign"],
                chains: ["eip155:137"], // Polygon
                events: ["accountsChanged", "chainChanged"],
            },
        },
    });

    if (uri) {
        setWcUri(uri); // Mostrar QR en el front
    }

    session = await approval();
    const address = session.namespaces.eip155.accounts[0].split(":")[2];
    console.log("✅ Sesión activa con:", address);

    return { uri, address };
}

export async function sendFee(txData) {
    if (!client || !session) throw new Error("No hay sesión activa");

    const address = session.namespaces.eip155.accounts[0].split(":")[2];

    const tx = {
        from: address,
        to: txData.to,
        value: ethers.parseEther(txData.amountEth).toString(),
        gas: "0x5208",
    };

    console.log("🚀 Enviando TX:", tx);

    const result = await client.request({
        topic: session.topic,
        chainId: txData.chain, // "eip155:137"
        request: {
            method: "eth_sendTransaction",
            params: [tx],
        },
    });

    console.log("✅ TX enviada, hash:", result);
    return result;
}
