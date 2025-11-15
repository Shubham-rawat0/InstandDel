import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({
    path: path.resolve(__dirname, "../../.env"),
});
if (!process.env.NODEMAILER_EMAIL && !process.env.NODEMAILER_PASS) {
    throw new Error("no email and password for nodemailer");
}
const transporter = nodemailer.createTransport({
    service: "gmail",
    port: 465,
    secure: true,
    auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASS,
    },
});
export const sendOtpMAil = async (to, otp) => {
    const info = await transporter.sendMail({
        from: process.env.NODEMAILER_EMAIL,
        to,
        subject: "Reset your otp",
        html: `<p>Your otp for password reset is <b>${otp}</b>. It expires in 5 minutes.</p>`,
    });
    console.log("Message sent:", info.messageId);
};
export const sendWelcomeMail = async (to) => {
    const info = await transporter.sendMail({
        from: `"Instant Del 🍽️" <${process.env.NODEMAILER_EMAIL}>`,
        to,
        subject: "Welcome to Instant Del – Your Food, Delivered Instantly!",
        html: `
      <div style="font-family: Arial, sans-serif; background-color: #f8f9fa; padding: 30px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
          <div style="background-color: #ff5722; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Instant Del</h1>
            <p style="color: white; margin-top: 5px; font-size: 16px;">Your favorite meals, delivered faster than ever.</p>
          </div>

          <div style="padding: 25px;">
            <h2 style="color: #333;">Welcome to Instant Del! 🎉</h2>
            <p style="color: #555; font-size: 15px; line-height: 1.6;">
              Hi there 👋,<br><br>
              We're thrilled to have you join <strong>Instant Del</strong> – the fastest way to order your favorite food from top restaurants in your city.
            </p>

            <p style="color: #555; font-size: 15px; line-height: 1.6;">
              With Instant Del, you can:
              <ul style="margin: 10px 0 20px 20px; color: #555;">
                <li>Track your order live 🕒</li>
                <li>Get exclusive discounts 💸</li>
                <li>Enjoy lightning-fast deliveries 🚀</li>
              </ul>
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="https://instantdel.app" 
                 style="background-color: #ff5722; color: white; text-decoration: none; padding: 12px 25px; border-radius: 8px; font-weight: bold;">
                Explore Now
              </a>
            </div>

            <p style="color: #777; font-size: 13px; text-align: center;">
              Thank you for choosing Instant Del. We can’t wait to serve you deliciousness on demand! 🍔🍕
            </p>
          </div>

          <div style="background-color: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #999;">
            © ${new Date().getFullYear()} Instant Del. All rights reserved.
          </div>
        </div>
      </div>
    `,
    });
    console.log("Welcome email sent:", info.messageId);
};
export const deliveryOtpMAil = async (to, otp) => {
    const info = await transporter.sendMail({
        from: process.env.NODEMAILER_EMAIL,
        to,
        subject: "Delivery OTP",
        html: `<p>Your OTP for delivery is <b>${otp}</b>. It expires in 5 minutes.</p>`,
    });
    console.log("Message sent:", info.messageId);
};
