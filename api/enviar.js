// /api/enviar.js
const nodemailer = require("nodemailer");

module.exports = async function handler(req, res) {
  // (Opcional) CORS si lo necesitas en otro dominio:
  // res.setHeader('Access-Control-Allow-Origin', 'https://mi-portafolio-nine-lac.vercel.app');
  // res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  // res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  // if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Método no permitido" });
  }

  try {
    const { telefono, email, mensaje, _gotcha } = req.body || {};

    if (_gotcha) return res.status(200).json({ ok: true }); // honeypot

    if (!telefono || !email || !mensaje) {
      return res.status(400).json({ ok: false, error: "Faltan campos" });
    }

    const SMTP_USER = process.env.SMTP_USER;
    const SMTP_PASS = process.env.SMTP_PASS;
    if (!SMTP_USER || !SMTP_PASS) {
      return res.status(500).json({ ok: false, error: "SMTP no configurado (env)" });
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user: SMTP_USER, pass: SMTP_PASS }
    });

    // Verifica credenciales (si falla, verás el motivo en logs de Vercel)
    await transporter.verify();

    const html = `
      <h2>Nuevo contacto desde el Portafolio</h2>
      <p><strong>Teléfono:</strong> ${telefono}</p>
      <p><strong>Correo:</strong> ${email}</p>
      <p><strong>Proyecto:</strong></p>
      <pre style="white-space:pre-wrap; font-family:inherit;">${mensaje}</pre>
    `;

    await transporter.sendMail({
      from: `"Portafolio" <${SMTP_USER}>`,
      to: "gabrielmunozsepulveda@gmail.com",
      subject: "Nuevo contacto desde el Portafolio",
      replyTo: email,
      text: `Teléfono: ${telefono}\nCorreo: ${email}\n\nProyecto:\n${mensaje}`,
      html
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("ENVIAR_ERROR:", err);
    return res.status(500).json({ ok: false, error: err.message || "No se pudo enviar" });
  }
};
