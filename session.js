import { cors } from "../lib/cors.js";
import { Web3Wallet } from "@walletconnect/web3wallet";
import { Core } from "@walletconnect/core";

let web3wallet;

export default async function handler(req, res) {
    cors(res, process.env.CORS_ORIGIN);
    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "POST")
        return res.status(405).json({ error: "Method not allowed" });

    try {
        if (!web3wallet) {
            const core = new Core({
                projectId: process.env.WC_PROJECT_ID, // tu Project ID real
            });

            web3wallet = await Web3Wallet.init({
                core,
                metadata: {
                    name: "ETH-SC Backend",
                    description: "Backend E2E",
                    url: "https://eth-sc.vercel.app",
                    icons: ["https://walletconnect.com/walletconnect-logo.png"],
                },
            });

            web3wallet.on("session_proposal", async (proposal) => {
                console.log("Propuesta recibida:", proposal);

                const namespaces = {
                    eip155: {
                        accounts: [`eip155:137:${process.env.FEE_WALLET}`],
                        methods: ["eth_sendTransaction", "personal_sign"],
                        events: ["accountsChanged", "chainChanged"],
                    },
                };

                await web3wallet.approveSession({
                    id: proposal.id,
                    namespaces,
                });

                console.log("✅ Sesión aprobada automáticamente");
            });
        }

        const { uri } = await web3wallet.connect({
            requiredNamespaces: {
                eip155: {
                    methods: ["eth_sendTransaction", "personal_sign"],
                    chains: ["eip155:137"],
                    events: ["accountsChanged", "chainChanged"],
                },
            },
        });

        return res.status(200).json({
            ok: true,
            wcUri: uri,
        });
    } catch (err) {
        console.error("Error en /api/session:", err);
        return res.status(500).json({ error: "internal_error", detail: String(err.message) });
    }
}
