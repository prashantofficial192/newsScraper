import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables (both local and deployed)

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export async function sendTelegramMessage(message) {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
        console.warn('Telegram bot token or chat ID is missing. Skipping message send.');
        return;
    }

    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
            }),
        });

        const data = await res.json();

        if (!data.ok) {
            throw new Error(data.description);
        }

        console.log('✅ Telegram message sent:', data.result.text);
    } catch (error) {
        console.error('❌ Error sending Telegram message:', error.message);
    }
}