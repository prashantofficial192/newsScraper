import express from 'express';
import dotenv from 'dotenv';
import cron from 'node-cron';
import connectToDatabase from './config/newsDb.js';
import { scrapeStockNews } from './services/scrapperService.js';
import { scrapeEconomicTimesNews } from './services/economicTimes.js';
import { scrapeMarketNews } from './services/scrapeMarketNews.js';
import { getMoneyControlNews } from './services/money-control/moneyControl.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Cron Job: Run every 10 seconds
// cron.schedule('*/10 * * * * *', async () => {
//     console.log(`\n⏰ [${new Date().toLocaleString()}] Running stock market news scraping...\n`);
//     await scrapeStockNews();
// });

// ✅ Run it immediately once when the server starts
(async () => {
    console.log(`\n🚀 Running initial scraping on server start...\n`);
    // await scrapeStockNews();
    // await scrapeEconomicTimesNews();
    // await scrapeMarketNews();
    await getMoneyControlNews();
    console.log(`\n✅ Initial scraping completed.\n`);
})();

// connectToDatabase()

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
