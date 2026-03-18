import { sendInteractiveMessage } from './services/whatsappService.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const testInteractive = async () => {
    const listInteractiveObject = {
        type: "list",
        header: {
            type: "text",
            text: "System Upgrade Verification",
        },
        body: {
            text: "Your backend has successfully sent an interactive list message!",
        },
        footer: {
            text: "Thank you for using our Bulk Messaging System.",
        },
        action: {
            button: "Acknowledge",
            sections: [
                {
                    title: "Status Options",
                    rows: [
                        {
                            id: "1",
                            title: "Looks Good!",
                            description: "I received this perfectly.",
                        },
                        {
                            id: "2",
                            title: "Needs Work",
                            description: "I need to change something.",
                        },
                    ],
                },
            ],
        },
    };

    try {
        const response = await sendInteractiveMessage("919159039389", listInteractiveObject);
        console.log("SUCCESS:", response);
    } catch (error) {
        console.log("ERROR:", error);
    }
};

testInteractive();
