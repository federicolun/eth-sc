import { cors } from "../lib/cors.js";

const DEST_WALLET = process.env.FEE_WALLET || "0xTuWalletDestino";

export default async function handler(req, res) {
    cors(res, process.env.CORS_ORIGIN);
    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "POST")
        return res.status(405).json({ error: "Method not allowed" });

    try {
        const {
            amountUsd = 100, // monto base en USD
            fee = { type: "percent", value: 0.25 }
        } = req.body || {};

        // 🔥 Obtener precio MATIC/USD de CoinGecko
        const priceRes = await fetch(
            "https://api.coingecko.com/api/v3/simple/price?ids=matic-network&vs_currencies=usd"
        );
        const priceData = await priceRes.json();
        const maticPriceUsd = priceData?.["matic-network"]?.usd;

        if (!maticPriceUsd) {
            throw new Error("No se pudo obtener precio de MATIC");
        }

        // 🔥 Calcular fee
        const subtotalUsd = amountUsd;
        const feeUsd =
            fee.type === "percent"
                ? subtotalUsd * (fee.value / 100)
                : fee.value;
        const feeMatic = feeUsd / maticPriceUsd;

        return res.status(200).json({
            ok: true,
            tx: {
                to: DEST_WALLET,
                chain: "eip155:137", // Polygon
                amountMatic: feeMatic.toFixed(6),
                feeUsd: feeUsd.toFixed(2),
                maticPriceUsd: maticPriceUsd.toFixed(3)
            }
        });
    } catch (err) {
        console.error("Error en /api/charge:", err);
        return res.status(500).json({
            error: "internal_error",
            detail: String(err.message)
        });
    }
}
