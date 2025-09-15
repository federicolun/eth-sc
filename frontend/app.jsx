import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import QRCode from "react-qr-code";
import { initWC, connectWallet, sendFee } from "./wallet";

const PROJECT_ID = "9406f4c2efc3adf0d9ebd9ca5673464a"; // 🔥 Pon tu ID real
const API_URL = "https://eth-sc.vercel.app/api/charge";

function App() {
    const [address, setAddress] = useState(null);
    const [status, setStatus] = useState("");
    const [wcUri, setWcUri] = useState("");
    const [txInfo, setTxInfo] = useState(null);

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

    const fetchFee = async () => {
        try {
            setStatus("Consultando fee...");
            const resp = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amountUsd: 100, // Monto base en USD, ajusta aquí
                    fee: { type: "percent", value: 4.5 }
                })
            });
            const data = await resp.json();
            if (!data.ok) throw new Error("Error API: " + JSON.stringify(data));
            setTxInfo(data.tx);
            setStatus(`Fee: ${data.tx.amountMatic} MATIC (~$${data.tx.feeUsd})`);
        } catch (err) {
            setStatus("Error al consultar fee: " + err.message);
        }
    };

    const handlePayFee = async () => {
        try {
            if (!txInfo) throw new Error("No hay datos de fee");
            setStatus("Firmando transacción...");
            const txHash = await sendFee({
                to: txInfo.to,
                chain: txInfo.chain,
                amountEth: txInfo.amountMatic // usamos este valor directamente
            });
            setStatus(`✅ Transacción enviada: ${txHash}`);
        } catch (err) {
            setStatus("Error al pagar fee: " + err.message);
        }
    };

    return (
        <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
            <h1>ETH/MATIC Fee App</h1>

            {!address && (
                <>
                    <button onClick={handleConnect}>Conectar Wallet</button>
                    {wcUri && (
                        <div style={{ marginTop: "20px" }}>
                            <p>Escaneá este QR en tu app de wallet:</p>
                            <QRCode value={wcUri} style={{ height: "256px", width: "256px" }} />
                        </div>
                    )}
                </>
            )}

            {address && (
                <>
                    <p>{status}</p>
                    {!txInfo && (
                        <button onClick={fetchFee}>Consultar Fee</button>
                    )}
                    {txInfo && (
                        <>
                            <p>
                                Monto Fee: <b>{txInfo.amountMatic} MATIC</b> (~${txInfo.feeUsd})
                            </p>
                            <button onClick={handlePayFee}>Pagar Fee</button>
                        </>
                    )}
                </>
            )}

            {!status && <p>Conecta tu wallet para comenzar</p>}
        </div>
    );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
