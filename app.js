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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


// ✅ Run it immediately once when the server starts
(async () => {
    console.log(`\n🚀 Running initial scraping on server start...\n`);
    // await scrapeStockNews();
    // await scrapeEconomicTimesNews();
    // await scrapeMarketNews();
    // await getMoneyControlNews();
    // await getMoneyControlStockNews();
    // await getMoneyControlOptionsNews();
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