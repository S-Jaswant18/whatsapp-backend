
const axios = require('axios');
require('dotenv').config();

async function testToken() {
    const url = `https://graph.facebook.com/${process.env.VERSION}/${process.env.PHONE_NUMBER_ID}`;
    try {
        const response = await axios.get(url, {
            params: {
                access_token: process.env.ACCESS_TOKEN
            }
        });
        console.log('Token is VALID!');
        console.log(response.data);
    } catch (error) {
        console.error('Token is INVALID or EXPIRED:');
        if (error.response) {
            console.error(error.response.data);
        } else {
            console.error(error.message);
        }
    }
}

testToken();
