const express = require("express")
const nodemailer = require("nodemailer")
const cors = require("cors")


const app = express()
app.use(express.json())
app.use(cors())

const transport = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth:{
        user:process.env.USER,
        pass:process.env.PASS,
    }
})
app.post("/send/email", async (req, res) => {
  const { name, to, mes } = req.body;

  try {
    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; background:#0f172a; padding:20px;">
        <div style="max-width:600px; margin:auto; background:#111827; border-radius:12px; padding:30px; border:1px solid #3b82f6;">
          
          <h2 style="color:#3b82f6; text-align:center; margin-bottom:20px;">
            📩 New Message Received
          </h2>

          <div style="color:#e5e7eb; font-size:14px; line-height:1.6;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${to}</p>
            
            <div style="margin-top:20px; padding:15px; background:#1f2937; border-radius:8px;">
              <p style="margin:0; color:#d1d5db;">
                ${mes}
              </p>
            </div>
          </div>

          <div style="margin-top:30px; text-align:center;">
            <p style="font-size:12px; color:#6b7280;">
              Sent from your portfolio website 🚀
            </p>
          </div>

        </div>
      </div>
    `;

    await transport.sendMail({
      from: `"Portfolio Contact" <homesilicon2@gmail.com>`,
      to: to,
      subject: "📨 New Contact Message, from portfolio",
      html: htmlTemplate,
    });

    res.status(200).json({
      message: "Email sent successfully",
    });

  } catch (err) {
    res.status(500).json({
      message: "Error occurred",
      error: err.message,
    });
  }
});


module.exports = app