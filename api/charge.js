import { cors } from "../lib/cors.js";

const DEST_WALLET = process.env.FEE_WALLET || "0xTuWalletDestino";

export default async function handler(req, res) {
    cors(res, process.env.CORS_ORIGIN);
    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "POST")
        return res.status(405).json({ error: "Method not allowed" });

    try {
        // 🔥 Fee fijo MUY bajo para pruebas
        const feeEth = 0.0; // 0.00001 ETH (~US$0.02)

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
