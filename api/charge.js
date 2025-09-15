import { cors } from "../lib/cors.js";
import fetch from "node-fetch";

const DEST_WALLET = process.env.FEE_WALLET || "0xTuWalletDestino";

export default async function handler(req, res) {
    cors(res, process.env.CORS_ORIGIN);
    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "POST")
        return res.status(405).json({ error: "Method not allowed" });

    try {
        const {
            amountEth = 0.1,
            fee = { type: "percent", value: 0.65 }
        } = req.body || {};

        // Obtener precio ETH en ARS
        let priceArs = 7000000; // Fallback
        try {
            const priceRes = await fetch("https://criptoya.com/api/eth/ars/0.1");
            const priceData = await priceRes.json();
            if (priceData?.ask) priceArs = priceData.ask;
        } catch (err) {
            console.error("No se pudo obtener precio ETH:", err);
        }

        // Calcular fee en ETH
        const subtotalArs = amountEth * priceArs;
        const feeArs =
            fee.type === "percent"
                ? subtotalArs * (fee.value / 100)
                : fee.value;
        const feeEth = feeArs / priceArs;

        return res.status(200).json({
            ok: true,
            tx: {
                to: DEST_WALLET,
                chain: "eip155:1",
                amountEth: feeEth.toFixed(6)
            }
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "internal_error", detail: String(err) });
    }
}
