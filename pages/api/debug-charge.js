import { cors } from "../lib/cors.js";

export default async function handler(req, res) {
    cors(res, process.env.CORS_ORIGIN);
    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    try {
        const { amountEth = 0.1, fee = { type: "percent", value: 0.65 }, feeReceiver = { type: "bank" } } = req.body || {};

        const token = process.env.MP_ACCESS_TOKEN || null;
        const email = process.env.MP_PAYER_EMAIL || null;

        const body = {
            transaction_amount: 100, // valor fijo de prueba
            description: "DEBUG charge",
            payment_method_id: "account_money",
            payer: { email }
        };

        // Intentar llamar a MP si hay token
        let mpResponse = null;
        if (token) {
            try {
                const resp = await fetch("https://api.mercadopago.com/v1/payments", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                    body: JSON.stringify(body)
                });
                mpResponse = await resp.json();
            } catch (e) {
                mpResponse = { error: String(e) };
            }
        }

        return res.status(200).json({
            ok: true,
            env: {
                hasToken: !!token,
                hasEmail: !!email
            },
            requestBody: body,
            mpResponse
        });
    } catch (err) {
        return res.status(500).json({ error: "debug_failed", detail: String(err) });
    }
}
