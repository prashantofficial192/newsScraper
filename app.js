// import express from 'express';
import dotenv from 'dotenv';
// import cron from 'node-cron';
// import connectToDatabase from './config/newsDb.js';
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

dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 5000;


(async () => {
    try {
        console.log(`🕖 Scheduled scraping started`);
        await sendTelegramMessage('🕖 Scheduled scraping started');

        await getMoneyControlOptionsNews();
        await getMoneyControlStockNews();
        await getMoneyControlMarketNews();
        await getEconomyNews();
        await getIpoNews();
        await getMutualFundsNews();
        await getCommoditiesNews();
        await getPersonalFinanceNews();

        await sendTelegramMessage('✅ Scheduled scraping completed');
        console.log(`✅ Scheduled scraping completed`);
    } catch (err) {
        console.error('❌ Error:', err);
        await sendTelegramMessage('❌ Scraper failed with error');
        process.exit(1);
    }

    process.exit(0); // Important: Stop the script completely
})();

// 🔁 Schedule the scraping to run every day at 7:15 AM
// cron.schedule('15 7 * * *', async () => {
//     try {
//         await sendTelegramMessage('🕖 Daily News Scraping started at 7:15 AM.');

//         console.log(`\n🔄 Scheduled scraping started...\n`);
//         await getMoneyControlOptionsNews(); // 1
//         await getMoneyControlStockNews();   // 2
//         await getMoneyControlMarketNews();  // 3
//         await getEconomyNews();             // 4
//         await getIpoNews();                 // 5
//         await getMutualFundsNews();         // 6
//         await getCommoditiesNews();         // 7
//         await getPersonalFinanceNews();     // 8
//         // await getTechnicalAnalysisNews(); // Optional

//         await sendTelegramMessage('✅ Daily News Scraping completed.');

//         console.log(`\n✅ Scheduled scraping completed.\n`);
//     } catch (err) {
//         console.error('❌ Error in scheduled scraping:', err);
//         await sendTelegramMessage('❌ Error occurred during scheduled news scraping.');
//     }
// });



// Send a Telegram message when server starts
// sendTelegramMessage('🚀 Server started successfully in ' + process.env.NODE_ENV + ' mode');

// app.listen(PORT, () => {
//     console.log(`🚀 Server is running on port ${PORT}`);
// });

// app.get('/', (req, res) => {
//     res.send('Welcome to the News Scraper API');
// });