import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables (both local and deployed)

const TELEGRAM_BOT_TOKEN = '7886338022:AAGr8qXX6llwvEi0HDRQtOCZDl7Qp8QoFxo';
const TELEGRAM_CHAT_ID = '7144326560'

export async function sendTelegramMessage(message) {

    // Check if the bot token and chat ID are set
    // If not, log a warning and skip sending the message
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
        console.warn('Telegram bot token or chat ID is missing. Skipping message send.');
        return;
    }

    // url to with tone to send message
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    try {
        // make a request to send message to chat id
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
            }),
        });

        // wait for response
        const data = await res.json();

        // if data is not come or false then throw error
        if (!data.ok) {
            throw new Error(data.description);
        }

    } catch (error) {
        console.error('❌ Error sending Telegram message:', error.message);
    }
}