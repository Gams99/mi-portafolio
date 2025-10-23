// /api/info.js  (CommonJS)
module.exports = async function handler(req, res) {
  const env = process.env.VERCEL_ENV || "unknown"; // production | preview | development
  const smtpUserSet = Boolean((process.env.SMTP_USER || "").trim());
  const smtpPassSet = Boolean((process.env.SMTP_PASS || "").trim());

  return res.status(200).json({
    ok: true,
    endpoint: "/api/info",
    vercelEnv: env,
    smtpUserSet,
    smtpPassSet,
    time: new Date().toISOString()
  });
};
