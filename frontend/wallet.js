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
      icons: ["https://eth-sc.vercel.app/icon.png"]
    }
  });
  return client;
}

export async function connectWallet(setWcUri) {
  if (!client) throw new Error("WalletConnect no inicializado");

  const { uri, approval } = await client.connect({
    requiredNamespaces: {
      eip155: {
        methods: ["eth_sendTransaction"],
        chains: ["eip155:1"],
        events: ["accountsChanged"]
      }
    }
  });

  if (uri) {
    setWcUri(uri); // Mostrar QR en el front
  }

  session = await approval();
  const address = session.namespaces.eip155.accounts[0].split(":")[2];
  return { uri, address };
}

export async function sendFee(txData) {
  if (!client || !session) throw new Error("No hay sesión activa");

  const address = session.namespaces.eip155.accounts[0].split(":")[2];

  const tx = {
    from: address,
    to: txData.to,
    value: ethers.parseEther(txData.amountEth).toString(),
    gas: "0x5208" // 21000 gas
  };

  const result = await client.request({
    topic: session.topic,
    chainId: txData.chain,
    request: { method: "eth_sendTransaction", params: [tx] }
  });

  return result;
}
