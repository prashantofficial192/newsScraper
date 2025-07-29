import { getMoneyControlNews } from './money-control/moneyControl.js';
import { getMoneyControlStockNews } from './money-control/stock/stockNews.js';
import { getMoneyControlOptionsNews } from './money-control/options/optionsNews.js';
import { getMoneyControlMarketNews } from './money-control/market/marketNews.js';
import { getTechnicalAnalysisNews } from './money-control/technical-analysis/technicalAnalysisNews.js';
import { getEconomyNews } from './money-control/economy/economyNews.js';
import { getIpoNews } from './money-control/ipo/ipoNews.js';
import { getCommoditiesNews } from './money-control/commodities/commoditiesNews.js';
import { getMutualFundsNews } from './money-control/mutual-funds/mutualFundsNews.js';
import { getPersonalFinanceNews } from './money-control/personal-finance/personalFinanceNews.js';

export const scripts = [
    // getMoneyControlNews,
    getMoneyControlStockNews,
    getMoneyControlOptionsNews,
    getMoneyControlMarketNews,
    getTechnicalAnalysisNews,
    getEconomyNews,
    getIpoNews,
    getCommoditiesNews,
    getMutualFundsNews,
    getPersonalFinanceNews
];