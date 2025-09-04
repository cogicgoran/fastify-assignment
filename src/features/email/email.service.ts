import { config } from "dotenv";
import Mailjet from "node-mailjet";
config(); // TODO: not sure why this file gets executed before main???
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.GMAIL_EMAIL,
//     pass: process.env.GMAIL_APP_KEY,
//   },
// });
const mailjet = new Mailjet({
  apiKey: process.env.MJ_APIKEY_PUBLIC,
  apiSecret: process.env.MJ_APIKEY_PRIVATE,
});

export const sendMail = async (
  to: string,
  subject: string,
  text: string,
  html: string
) => {
  try {
    await mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: process.env.MJ_SENDER_EMAIL,
            Name: "Aragok",
          },
          To: [
            {
              Email: to,
              Name: subject,
            },
          ],
          Subject: subject,
          TextPart: text,
          HTMLPart: html,
        },
      ],
    });
  } catch (error) {
    console.log(error);
  }
};
