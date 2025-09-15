const EXCHANGES = ["ripio", "buenbit", "letsbit", "lemoncash", "binancep2p"];
const VOLUMEN = 0.1; // ETH a cotizar

async function priceFromCriptoYa(exchange, timeoutMs) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeoutMs || 3000);
  try {
    const url = `https://criptoya.com/api/${exchange}/ETH/ARS/${VOLUMEN}`;
    const r = await fetch(url, { headers: { "accept": "application/json" }, signal: ctrl.signal });
    if (!r.ok) throw new Error(`${exchange} ${r.status}`);
    const j = await r.json();
    if (typeof j.ask !== "number") throw new Error(`${exchange} bad payload`);
    return j.ask;
  } finally {
    clearTimeout(id);
  }
}

export async function getEthArs(env) {
  const timeout = Number(env.CRYPTOYA_TIMEOUT_MS || "3000");
  const promises = EXCHANGES.map((ex) => priceFromCriptoYa(ex, timeout).then(v => ({ ex, v })).catch(() => null));
  const results = (await Promise.all(promises)).filter(Boolean);
  const values = results.map(r => r.v).filter((v) => Number.isFinite(v));

  if (!values.length) throw new Error("No sources");
  values.sort((a,b)=>a-b);
  const median = values[Math.floor(values.length/2)];
  return { priceArs: median, sources: results.map(r => r.ex) };
}