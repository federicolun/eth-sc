import fetch from "node-fetch";
import QRCode from "qrcode-terminal";

const API_URL = "https://eth-sc.vercel.app/api/session";

async function main() {
  try {
    console.log("🔄 Solicitando nueva sesión a", API_URL);

    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    if (!data.ok || !data.wcUri) {
      console.error("❌ Error en la respuesta:", data);
      return;
    }

    console.log("✅ URI recibido, generando QR...");
    console.log("URI:", data.wcUri);

    // Generar QR en consola
    QRCode.generate(data.wcUri, { small: true });

    console.log("\n📱 Escaneá el QR con MetaMask Mobile -> Conectar Wallet");
  } catch (err) {
    console.error("❌ Error ejecutando testSession:", err.message);
  }
}

main();
