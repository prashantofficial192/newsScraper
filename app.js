import { getMoneyControlStockNews } from './services/money-control/stock/stockNews.js';
import { getMoneyControlOptionsNews } from './services/money-control/options/optionsNews.js';
import { sendTelegramMessage } from './services/telegram/telegram.js';
import { getMoneyControlMarketNews } from './services/money-control/market/marketNews.js';
// import { getTechnicalAnalysisNews } from './services/money-control/technical-analysis/technicalAnalysisNews.js';
import { getEconomyNews } from './services/money-control/economy/economyNews.js';
import { getIpoNews } from './services/money-control/ipo/ipoNews.js';
import { getCommoditiesNews } from './services/money-control/commodities/commoditiesNews.js';
import { getMutualFundsNews } from './services/money-control/mutual-funds/mutualFundsNews.js';
import { getPersonalFinanceNews } from './services/money-control/personal-finance/personalFinanceNews.js';
import { sendDiscordMessage } from './services/discord/discordNotifier.js';

(async () => {
    try {
        // ✅ 1. Start alert
        const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        await sendDiscordMessage(`@everyone 🕖 Scheduled scraping started at ${now}`);

        // ✅ 2. Run all scrapers individually (so failure in one doesn’t stop others)
        const scrapers = [
            getMoneyControlOptionsNews,
            getMoneyControlStockNews,
            getMoneyControlMarketNews,
            getEconomyNews,
            getIpoNews,
            getMutualFundsNews,
            getCommoditiesNews,
            getPersonalFinanceNews,
        ];

        for (const scraper of scrapers) {
            try {
                await scraper();
            } catch (err) {
                console.error(`❌ Error in ${scraper.name}:`, err.message);
                await sendTelegramMessage(`❌ Error in ${scraper.name}`);
            }
        }

        // ✅ 3. Final success alert
        const end = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        await sendDiscordMessage(`@everyone ✅ Scheduled scraping completed at ${end}`);
    } catch (err) {
        await sendTelegramMessage('❌ Scraper failed with fatal error');
        process.exit(1);
    }

    process.exit(0);
})();