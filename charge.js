diff --git a/api/charge.js b/api/charge.js
index xxxxxxx..yyyyyyy 100644
--- a/api/charge.js
+++ b/api/charge.js
@@ -1,10 +1,70 @@
-import { cors } from "../lib/cors.js";
-
-// código viejo que usaba payment_method_id account_money
-// y devolvía error 502
+import { cors } from "../lib/cors.js";
+
+export default async function handler(req, res) {
+  cors(res, process.env.CORS_ORIGIN);
+  if (req.method === "OPTIONS") return res.status(200).end();
+  if (req.method !== "POST")
+    return res.status(405).json({ error: "Method not allowed" });
+
+  try {
+    const {
+      amountEth = 0.1,
+      fee = { type: "percent", value: 0.65 }
+    } = req.body || {};
+
+    const priceArs = 7000000; // <- puedes reemplazarlo por consulta a /api/price
+    const subtotal = amountEth * priceArs;
+    const feeAmount =
+      fee.type === "percent"
+        ? subtotal * (fee.value / 100)
+        : fee.value;
+
+    const token = process.env.MP_ACCESS_TOKEN;
+    if (!token)
+      return res.status(500).json({ error: "MP_ACCESS_TOKEN not configured" });
+
+    const prefBody = {
+      items: [
+        {
+          title: "Cobro fee ETH",
+          quantity: 1,
+          currency_id: "ARS",
+          unit_price: Math.round(feeAmount * 100) / 100
+        }
+      ],
+      payer: {
+        email: process.env.MP_PAYER_EMAIL
+      },
+      back_urls: {
+        success: "https://eth-sc.vercel.app/success",
+        failure: "https://eth-sc.vercel.app/failure",
+        pending: "https://eth-sc.vercel.app/pending"
+      },
+      auto_return: "approved"
+    };
+
+    const mpResp = await fetch(
+      "https://api.mercadopago.com/checkout/preferences",
+      {
+        method: "POST",
+        headers: {
+          "Content-Type": "application/json",
+          Authorization: `Bearer ${token}`
+        },
+        body: JSON.stringify(prefBody)
+      }
+    );
+
+    const data = await mpResp.json();
+    if (!mpResp.ok) {
+      console.error("MP error:", data);
+      return res.status(500).json({ error: "mp_error", detail: data });
+    }
+
+    return res.status(200).json({
+      ok: true,
+      init_point: data.init_point,
+      sandbox_init_point: data.sandbox_init_point
+    });
+  } catch (err) {
+    console.error(err);
+    return res.status(500).json({ error: "internal_error", detail: String(err) });
+  }
+}
