import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

export async function sendDiscordMessage(message) {
    try {
        const res = await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: message }),
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Failed to send message: ${res.status} ${errorText}`);
        }

        // console.log('✅ Message sent to Discord');
    } catch (error) {
        console.error('❌ Discord webhook error:', error.message);
    }
}