import 'dotenv/config.js';

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const API_VERSION = 'v22.0';

const sendTestMessage = async () => {
    try {
        const response = await fetch(`https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: '919159039389',
                type: 'template',
                template: {
                    name: 'hello_world',
                    language: {
                        code: 'en_US'
                    }
                }
            })
        });

        const data = await response.json();
        console.log('STATUS:', response.status);
        console.log('RESPONSE:', data);
    } catch (error) {
        console.error('ERROR:', error);
    }
};

sendTestMessage();
