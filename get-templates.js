import 'dotenv/config.js';

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const WABA_ID = process.env.WABA_ID;
const API_VERSION = 'v22.0';

const getTemplates = async () => {
    try {
        const response = await fetch(`https://graph.facebook.com/${API_VERSION}/${WABA_ID}/message_templates`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${WHATSAPP_TOKEN}`
            }
        });

        const data = await response.json();
        console.log('STATUS:', response.status);
        console.log('TEMPLATES:', JSON.stringify(data.data?.map(t => ({ name: t.name, status: t.status, language: t.language })), null, 2));
        if (data.error) console.error('ERROR:', data.error);
    } catch (error) {
        console.error('FETCH ERROR:', error);
    }
};

getTemplates();
