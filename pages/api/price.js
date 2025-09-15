import { getEthArs } from "../lib/price-sources.js";
import { normalize } from "../lib/fx.js";
import { cors } from "../lib/cors.js";

export default async function handler(req, res) {
  cors(res, process.env.CORS_ORIGIN);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { priceArs, sources } = await getEthArs(process.env);
    return res.status(200).json({ priceArs: normalize(priceArs), sources, ts: Date.now() });
  } catch (e) {
    return res.status(502).json({ error: "pricing_failed", detail: String(e) });
  }
}