// /api/enviar.js
import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Método no permitido" });
  }

  try {
    const { telefono, email, mensaje, _gotcha } = req.body || {};

    // Honeypot anti-spam
    if (_gotcha) {
      return res.status(200).json({ ok: true }); // Ignora bots silenciosamente
    }

    // Validaciones mínimas
    if (!telefono || !email || !mensaje) {
      return res.status(400).json({ ok: false, error: "Faltan campos" });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ ok: false, error: "Email inválido" });
    }

    // Transport con Gmail SMTP (App Password)
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER, // tu Gmail
        pass: process.env.SMTP_PASS, // App Password (16 caracteres)
      },
    });

    const html = `
      <h2>Nuevo contacto desde el Portafolio</h2>
      <p><strong>Teléfono:</strong> ${telefono}</p>
      <p><strong>Correo:</strong> ${email}</p>
      <p><strong>Proyecto:</strong></p>
      <pre style="white-space:pre-wrap; font-family:inherit;">${mensaje}</pre>
    `;

    await transporter.sendMail({
      from: `"Portafolio" <${process.env.SMTP_USER}>`,
      to: "gabrielmunozsepulveda@gmail.com",
      subject: "Nuevo contacto desde el Portafolio",
      replyTo: email, // para que puedas responder directo al cliente
      text: `Teléfono: ${telefono}\nCorreo: ${email}\n\nProyecto:\n${mensaje}`,
      html,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: "No se pudo enviar" });
  }
}
