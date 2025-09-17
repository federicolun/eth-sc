import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import QRCode from "react-qr-code";
import { initWC, connectWallet, sendFee, signMessage } from "./wallet";

const PROJECT_ID = "9406f4c2efc3adf0d9ebd9ca5673464a"; // tu ID real
const API_URL = "https://eth-sc.vercel.app/api/charge";

function App() {
    const [address, setAddress] = useState(null);
    const [status, setStatus] = useState("");
    const [wcUri, setWcUri] = useState("");
    const [txInfo, setTxInfo] = useState(null);
    const [txHash, setTxHash] = useState(null);
    const [signature, setSignature] = useState(null);

    const handleConnect = async () => {
        try {
            setStatus("Conectando...");
            await initWC(PROJECT_ID);
            const { address } = await connectWallet(setWcUri);
            setAddress(address);
            setStatus(`✅ Conectado con: ${address}`);
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
                    amountUsd: 1,
                    fee: { type: "percent", value: 0.25 },
                }),
            });

            const data = await resp.json();
            if (!data.ok) throw new Error("Error API: " + JSON.stringify(data));
            setTxInfo(data.tx);
            setStatus(
                `Fee calculado: ${data.tx.amountMatic} MATIC (~$${data.tx.feeUsd})`
            );
        } catch (err) {
            setStatus("Error al consultar fee: " + err.message);
        }
    };

    const handlePayFee = async () => {
        try {
            if (!txInfo) throw new Error("No hay datos de fee");
            setStatus("Firmando transacción...");
            const hash = await sendFee({
                to: txInfo.to,
                chain: txInfo.chain,
                amountEth: txInfo.amountMatic,
            });
            setTxHash(hash);
            setStatus("✅ Transacción enviada");
        } catch (err) {
            setStatus("Error al pagar fee: " + err.message);
        }
    };

    const handleSign = async () => {
        try {
            setStatus("Solicitando firma...");
            const result = await signMessage(
                "Soy Federico y acepto los términos - " + Date.now()
            );
            setSignature(result);
            setStatus(`✅ Firma validada por ${result.address}`);
        } catch (err) {
            setStatus("Error al firmar: " + err.message);
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
                            <QRCode
                                value={wcUri}
                                style={{ height: "256px", width: "256px" }}
                            />
                        </div>
                    )}
                </>
            )}

            {address && (
                <>
                    <p><b>{status}</b></p>

                    {!txInfo && (
                        <>
                            <button onClick={fetchFee}>Consultar Fee</button>
                            <button onClick={handleSign}>Validar Firma</button>
                        </>
                    )}

                    {txInfo && (
                        <>
                            <p>
                                Monto Fee: <b>{txInfo.amountMatic} MATIC</b> (~$
                                {txInfo.feeUsd})
                            </p>
                            <button onClick={handlePayFee}>Pagar Fee</button>
                        </>
                    )}

                    {txHash && (
                        <p>
                            ✅ Hash de la TX:{" "}
                            <a
                                href={`https://polygonscan.com/tx/${txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {txHash}
                            </a>
                        </p>
                    )}

                    {signature && (
                        <p>
                            ✅ Firma generada: <br />
                            <small>{signature.signature}</small>
                        </p>
                    )}
                </>
            )}

            {!status && <p>Conectá tu wallet para comenzar</p>}
        </div>
    );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
