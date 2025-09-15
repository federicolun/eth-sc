import { cors } from "../lib/cors.js";

const DEST_WALLET = process.env.FEE_WALLET || "0xTuWalletDestino";

export default async function handler(req, res) {
    cors(res, process.env.CORS_ORIGIN);
    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "POST")
        return res.status(405).json({ error: "Method not allowed" });

    try {
        const {
            amountEth = 0.00001,
            fee = { type: "percent", value: 0.25 }
        } = req.body || {};

        // 🔥 Fee dinámico en ETH (basado en porcentaje)
        // Para simplificar, asumimos 1 ETH ≈ precio actual (sin consultar API externa aquí).
        const priceEth = 0.0001; // ETH como unidad base
        const subtotalEth = amountEth * priceEth;
        const feeEth =
            fee.type === "percent"
                ? subtotalEth * (fee.value / 100)
                : fee.value;

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
        return res.status(500).json({
            error: "internal_error",
            detail: String(err)
        });
    }
}
