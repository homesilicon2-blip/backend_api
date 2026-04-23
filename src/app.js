const express = require("express")
const nodemailer = require("nodemailer")
const cors = require("cors")
const rateLimit = require("express-rate-limit");

const app = express()
app.use(express.json())
app.use(cors())



const emailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 5,
  message: {
    message: "Too many requests, please try again after 15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const transport = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth:{
        user:process.env.USER,
        pass:process.env.PASS,
    }
})

// ✅ CAPTCHA verify (fetch version)
async function verifyCaptcha(token) {
  const params = new URLSearchParams({
    secret: process.env.RECAPTCHA_SECRET,
    response: token,
  });

  const res = await fetch(
    "https://www.google.com/recaptcha/api/siteverify",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    }
  );

  const data = await res.json();
  return data.success;
}

app.post("/send/email", emailLimiter , async (req, res) => {
  try {
      if (req.body.website) {
          return res.status(400).json({ message: "Bot detected" });
      }
      
    const { name, to , mes, captchaToken } = req.body;

    // ✅ 1. captcha check
    if (!captchaToken) {
      return res.status(400).json({ message: "Captcha missing" });
    }

    const valid = await verifyCaptcha(captchaToken);
    if (!valid) {
      return res.status(403).json({ message: "Captcha failed" });
    }

    // ✅ 2. validation
    if (!name || !to || !mes) {
      return res.status(400).json({ message: "All fields required" });
    }
      
    if (!to.includes("@")) {
        return res.status(400).json({ message: "Invalid email" });
    }
      if (mes.length > 200) {
          return res.status(400).json({ message: "Message too long" });
      }

    // ✅ 3. fixed receiver (IMPORTANT)
    const htmlTemplate = `
      <div style="font-family: Arial; background:#0f172a; padding:20px;">
        <div style="max-width:600px; margin:auto; background:#111827; padding:30px;">
          <h2 style="color:#3b82f6;">📩 New Message</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${to}</p>
          <p>${mes}</p>
        </div>
      </div>
    `;

    await transport.sendMail({
      from: `"Portfolio Contact" <${process.env.EMAILSIL}>`,
      to: process.env.EMAIL, // 👈 FIXED
      replyTo: to, // 👈 user ko reply kar paoge
      subject: `Contact from ${name}`,
      html: htmlTemplate,
    });

    res.json({ message: "Email sent successfully" });

  } catch (err) {
    res.status(500).json({
      message: "Error occurred",
      error: err.message,
    });
  }
});
module.exports = app



