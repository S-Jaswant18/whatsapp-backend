
const axios = require('axios');
require('dotenv').config();

async function checkWhatsAppConfig() {
    console.log('--- WhatsApp Configuration Check ---');
    console.log(`- VERSION: ${process.env.VERSION}`);
    console.log(`- PHONE_NUMBER_ID: ${process.env.PHONE_NUMBER_ID}`);
    console.log(`- ACCESS_TOKEN: ${process.env.ACCESS_TOKEN ? 'Present' : 'MISSING'}`);
    
    if (!process.env.ACCESS_TOKEN) {
        console.error('ERROR: ACCESS_TOKEN is missing in .env');
        return;
    }

    const testUrl = `https://graph.facebook.com/${process.env.VERSION}/${process.env.PHONE_NUMBER_ID}`;
    
    try {
        const response = await axios.get(testUrl, {
            params: { access_token: process.env.ACCESS_TOKEN }
        });
        console.log('SUCCESS: Connection to Meta Graph API established!');
        console.log('Details:', response.data);
        console.log('\nYou are ready to send messages!');
    } catch (error) {
        console.error('\nFAILURE: Could not connect to Meta Graph API');
        if (error.response) {
            console.error(`- Status: ${error.response.status}`);
            console.error(`- Error Code: ${error.response.data.error.code}`);
            console.error(`- Message: ${error.response.data.error.message}`);
            
            if (error.response.data.error.code === 190) {
                console.error('TIP: Your ACCESS_TOKEN has expired or is invalid. Please generate a new one from the Meta Developer Portal.');
            }
        } else {
            console.error(`- Error: ${error.message}`);
        }
    }
}

checkWhatsAppConfig();
