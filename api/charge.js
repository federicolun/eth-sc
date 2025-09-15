import { getEthArs } from "../lib/price-sources.js";
import { computeFee } from "../lib/fee.js";
import { normalize } from "../lib/fx.js";
import { cors } from "../lib/cors.js";

export default async function handler(req, res) {
  cors(res, process.env.CORS_ORIGIN);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { amountEth, fee, feeReceiver } = req.body || {};
    if (typeof amountEth !== "number") return res.status(400).json({ error: "amountEth requerido" });
    if (!fee || !fee.type) return res.status(400).json({ error: "fee requerido" });
    if (!feeReceiver || !feeReceiver.type) return res.status(400).json({ error: "feeReceiver requerido" });

    const { priceArs } = await getEthArs(process.env);
    const subtotal = amountEth * priceArs;
    const feeArs = computeFee(subtotal, fee);

    let transferId = null;

    if (feeReceiver.type === "bank") {
      const token = process.env.MP_ACCESS_TOKEN;
      if (!token) return res.status(500).json({ error: "MP_ACCESS_TOKEN missing" });
      const payerEmail = process.env.MP_PAYER_EMAIL || feeReceiver.payerEmail || null;

      const body = {
        transaction_amount: Number(feeArs.toFixed(2)),
        description: "ETH quote fee",
        payment_method_id: "account_money",
        ...(payerEmail ? { payer: { email: payerEmail } } : {})
      };

      const mp = await fetch("https://api.mercadopago.com/v1/payments", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "authorization": `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      const mpRes = await mp.json();
      if (!mp.ok) return res.status(502).json({ error: "mp_error", detail: mpRes });
      transferId = `mp_${mpRes.id}`;
    } else if (feeReceiver.type === "wallet") {
      transferId = `wallet_pending_${crypto.randomUUID()}`;
    } else {
      return res.status(400).json({ error: "feeReceiver.type inválido" });
    }

    return res.status(200).json({
      ok: true,
      feeArs: normalize(feeArs),
      subtotalArs: normalize(subtotal),
      transferId,
    });
  } catch (e) {
    return res.status(500).json({ error: "charge_failed", detail: String(e) });
  }
}