import express from 'express';
import dotenv from 'dotenv';
import cron from 'node-cron';
import connectToDatabase from './config/newsDb.js';
import { scrapeStockNews } from './services/scrapperService.js';
import { scrapeEconomicTimesNews } from './services/economicTimes.js';
import { scrapeMarketNews } from './services/scrapeMarketNews.js';
import { getMoneyControlNews } from './services/money-control/moneyControl.js';
import { getMoneyControlStockNews } from './services/money-control/stock/stockNews.js';
import { getMoneyControlOptionsNews } from './services/money-control/options/optionsNews.js';
import { sendTelegramMessage } from './services/telegram/telegram.js';
import { getMoneyControlMarketNews } from './services/money-control/market/marketNews.js';
import { getTechnicalAnalysisNews } from './services/money-control/technical-analysis/technicalAnalysisNews.js';
import { getEconomyNews } from './services/money-control/economy/economyNews.js';
import { getIpoNews } from './services/money-control/ipo/ipoNews.js';
import { getCommoditiesNews } from './services/money-control/commodities/commoditiesNews.js';
import { getMutualFundsNews } from './services/money-control/mutual-funds/mutualFundsNews.js';
import { getPersonalFinanceNews } from './services/money-control/personal-finance/personalFinanceNews.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


// ✅ Run it immediately once when the server starts
(async () => {
    console.log(`\n🚀 Running initial scraping on server start...\n`);
    // await getMoneyControlNews();
    await getMoneyControlStockNews();
    // await getMoneyControlOptionsNews();
    // await getMoneyControlMarketNews();
    // await getTechnicalAnalysisNews();
    // await getEconomyNews();
    // await getIpoNews();
    // await getCommoditiesNews();
    // await getMutualFundsNews();
    // await getPersonalFinanceNews();
    console.log(`\n✅ Initial scraping completed.\n`);
})();

// Send a Telegram message when server starts
// sendTelegramMessage('🚀 Server started successfully in ' + process.env.NODE_ENV + ' mode');

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});

app.get('/', (req, res) => {
    res.send('Welcome to the News Scraper API');
});