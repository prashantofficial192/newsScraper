import fetch from 'node-fetch';

const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1400513044106313748/7rjJoazWaMFstQ6P_ZM_O9vtx4b9S5ymbdxqyw__rp7rTCR3I4ue2wfpYDS6OxCqn5wO';

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

        console.log('✅ Message sent to Discord');
    } catch (error) {
        console.error('❌ Discord webhook error:', error.message);
    }
}