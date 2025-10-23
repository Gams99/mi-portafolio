// /api/enviar.js
const nodemailer = require("nodemailer");

module.exports = async function handler(req, res) {
  // CORS opcional (comentado; actívalo si llamas desde otro dominio)
  // res.setHeader('Access-Control-Allow-Origin', '*');
  // res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  // res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === "OPTIONS") return res.status(200).end();

  const env = process.env.VERCEL_ENV || "unknown"; // production | preview | development
  const SMTP_USER = (process.env.SMTP_USER || "").trim();
  const SMTP_PASS = (process.env.SMTP_PASS || "").trim();

  if (req.method === "GET") {
    // Modo diagnóstico: NO revela credenciales, solo si existen
    return res.status(200).json({
      ok: true,
      info: "Diagnóstico ENV",
      vercelEnv: env,
      smtpUserSet: Boolean(SMTP_USER),
      smtpPassSet: Boolean(SMTP_PASS),
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Método no permitido" });
  }

  try {
    const { telefono, email, mensaje, _gotcha } = req.body || {};
    if (_gotcha) return res.status(200).json({ ok: true }); // honeypot

    if (!telefono || !email || !mensaje) {
      return res.status(400).json({ ok: false, error: "Faltan campos requeridos" });
    }

    if (!SMTP_USER || !SMTP_PASS) {
      return res.status(500).json({
        ok: false,
        error: `SMTP no configurado (ENV vacías). Ambiente: ${env}`,
      });
    }

    const transporter = nodemailer.createTransport({
      // Puedes usar la forma 'service' o 'host/port'
      service: "gmail",
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    await transporter.verify(); // si falla, devuelve error claro

    const html = `
      <h2>Nuevo contacto desde el Portafolio</h2>
      <p><strong>Teléfono:</strong> ${telefono}</p>
      <p><strong>Correo:</strong> ${email}</p>
      <p><strong>Descripción del proyecto:</strong></p>
      <pre style="white-space:pre-wrap;font-family:inherit;">${mensaje}</pre>
    `;

    await transporter.sendMail({
      from: `"Portafolio Web" <${SMTP_USER}>`,
      to: "gabrielmunozsepulveda@gmail.com",
      subject: "Nuevo contacto desde el Portafolio",
      replyTo: email,
      text: `Teléfono: ${telefono}\nCorreo: ${email}\n\nProyecto:\n${mensaje}`,
      html,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    // Devolvemos el mensaje de error para verlo en el frontend/Network
    return res.status(500).json({
      ok: false,
      error: err && err.message ? err.message : "Error interno",
      code: err && err.code ? err.code : undefined,
    });
  }
};
