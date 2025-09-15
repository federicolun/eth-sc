import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import QRCode from "react-qr-code";
import { initWC, connectWallet, sendFee } from "./wallet";

const PROJECT_ID = "9406f4c2efc3adf0d9ebd9ca5673464a"; // 🔥 Reemplaza con tu WalletConnect Project ID
const API_URL = "https://eth-sc.vercel.app/api/charge";

function App() {
    const [address, setAddress] = useState(null);
    const [status, setStatus] = useState("");
    const [wcUri, setWcUri] = useState("");

    const handleConnect = async () => {
        try {
            await initWC(PROJECT_ID);
            const { address } = await connectWallet(setWcUri);
            setAddress(address);
            setStatus(`✅ Conectado: ${address}`);
        } catch (err) {
            setStatus("Error al conectar: " + err.message);
        }
    };

    const handlePayFee = async () => {
        try {
            setStatus("Consultando fee...");
            const resp = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amountEth: 0.1,
                    fee: { type: "percent", value: 0.65 }
                })
            });
            const data = await resp.json();
            if (!data.ok) throw new Error("API error: " + JSON.stringify(data));

            setStatus(`Firmando transacción de ${data.tx.amountEth} ETH...`);
            const txHash = await sendFee(data.tx);
            setStatus(`✅ Transacción enviada: ${txHash}`);
        } catch (err) {
            setStatus("Error al pagar fee: " + err.message);
        }
    };

    return (
        <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
            <h1>ETH Fee App</h1>

            {!address && (
                <>
                    <button onClick={handleConnect}>Conectar Wallet</button>
                    {wcUri && (
                        <div style={{ marginTop: "20px" }}>
                            <p>Escanea este QR en tu app de wallet:</p>
                            <QRCode value={wcUri} style={{ height: "256px", width: "256px" }} />
                        </div>
                    )}
                </>
            )}

            {address && (
                <>
                    <p>{status}</p>
                    <button onClick={handlePayFee}>Pagar Fee</button>
                </>
            )}

            {!status && <p>Conecta tu wallet para comenzar</p>}
            {status && <p>{status}</p>}
        </div>
    );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
