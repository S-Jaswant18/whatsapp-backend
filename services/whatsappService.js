import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const API_VERSION = 'v22.0';

console.log('\x1b[36m%s\x1b[0m', '--- WhatsApp Service Diagnostics ---');
console.log('API Version:', API_VERSION);
console.log('Phone Number ID:', PHONE_NUMBER_ID);
console.log('Token Start:', WHATSAPP_TOKEN ? `${WHATSAPP_TOKEN.substring(0, 15)}...` : 'MISSING');
console.log('Token End:', WHATSAPP_TOKEN ? `...${WHATSAPP_TOKEN.substring(WHATSAPP_TOKEN.length - 15)}` : 'MISSING');
console.log('\x1b[36m%s\x1b[0m', '------------------------------------');

// Note: Using Temporary access tokens restricts GET operations on the Phone node,
// so verifying permissions via GET will result in a false-alarm 100 error.
// The POST /messages endpoint will still work perfectly for sending.

const sanitizePhone = (phone) => {
  if (!phone) return '';
  return phone.replace(/\D/g, ''); // Remove all non-digits
};

const whatsappApi = axios.create({
  baseURL: `https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}`,
  headers: {
    Authorization: `Bearer ${WHATSAPP_TOKEN}`,
    'Content-Type': 'application/json',
  },
});

console.log(`[WhatsApp Service] API Base URL: https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/messages`);

export const sendTemplateMessage = async (to, templateName, languageCode = 'en_US') => {
  try {
    const sanitizedPhone = sanitizePhone(to);
    console.log(`[WhatsApp API] Sending Template: "${templateName}" to ${sanitizedPhone}`);
    const response = await whatsappApi.post('/messages', {
      messaging_product: 'whatsapp',
      to: sanitizedPhone,
      type: 'template',
      template: {
        name: templateName,
        language: { code: languageCode },
      },
    });
    return response.data;
  } catch (error) {
    console.error('WhatsApp API Error:', error.response?.data || error.message);
    throw error;
  }
};

export const sendTextMessage = async (to, text) => {
  try {
    const sanitizedPhone = sanitizePhone(to);
    console.log(`[WhatsApp API] Sending Text to ${sanitizedPhone}: "${text.substring(0, 20)}..."`);
    const response = await whatsappApi.post('/messages', {
      messaging_product: 'whatsapp',
      to: sanitizedPhone,
      type: 'text',
      text: { body: text },
    });
    return response.data;
  } catch (error) {
    console.error('WhatsApp API Error:', error.response?.data || error.message);

    // Fallback logic for test numbers (24-hour rule or unregistered rule)
    const errData = error.response?.data?.error;
    if (errData && (errData.code === 131047 || errData.code === 131026 || errData.code === 100)) {
      console.log(`[WhatsApp API] Message failed due to test number limitations. Attempting 'hello_world'...`);
      try {
        return await sendTemplateMessage(to, 'hello_world');
      } catch (tErr) {
        console.error('Fallback Error:', tErr.response?.data || tErr.message);
      }
    }

    throw error;
  }
};

export const sendInteractiveMessage = async (to, interactiveObject) => {
  try {
    const sanitizedPhone = sanitizePhone(to);
    console.log(`[WhatsApp API] Sending Interactive Message to ${sanitizedPhone}`);
    const response = await whatsappApi.post('/messages', {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: sanitizedPhone,
      type: 'interactive',
      interactive: interactiveObject,
    });
    return response.data;
  } catch (error) {
    console.error('WhatsApp API Error (Interactive):', error.response?.data || error.message);
    throw error;
  }
};

export const markAsRead = async (messageId) => {
  try {
    const response = await whatsappApi.post('/messages', {
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: messageId,
    });
    return response.data;
  } catch (error) {
    console.error('WhatsApp API Error:', error.response?.data || error.message);
    throw error;
  }
};
