import { cors } from "../lib/cors.js";
import { EthereumProvider } from "@walletconnect/ethereum-provider";

let provider;

export default async function handler(req, res) {
    cors(res, process.env.CORS_ORIGIN);
    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        if (!provider) {
            provider = await EthereumProvider.init({
                projectId: process.env.WC_PROJECT_ID,
                chains: [137], // Polygon
                showQrModal: false,
                methods: ["eth_sendTransaction", "personal_sign"],
                events: ["chainChanged", "accountsChanged"],
                metadata: {
                    name: "ETH-SC Backend",
                    description: "E2E Test con WalletConnect",
                    url: "https://eth-sc.vercel.app",
                    icons: ["https://walletconnect.com/walletconnect-logo.png"],
                },
            });
        }

        // Crear sesión → devuelve URI
        const wcUri = await provider.connect();

        return res.status(200).json({
            ok: true,
            wcUri,
        });
    } catch (err) {
        console.error("Error en /api/session:", err);
        return res
            .status(500)
            .json({ error: "internal_error", detail: String(err.message) });
    }
}
