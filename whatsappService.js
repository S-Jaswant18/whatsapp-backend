import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const BASE_URL = `https://graph.facebook.com/v22.0/${process.env.PHONE_NUMBER_ID}/messages`;

export const sendTextMessage = async (phone, message) => {
  try {
    const res = await axios.post(
      BASE_URL,
      {
        messaging_product: "whatsapp",
        to: String(phone).replace(/\D/g, ""),
        type: "text",
        text: { body: message }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};
