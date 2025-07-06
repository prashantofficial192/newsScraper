import { scrapeStockNews } from '../services/scrapperService.js';

export const getNews = async (req, res) => {
    try {
        const newsData = await scrapeStockNews();
        res.json(newsData);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching news', error: error.message });
    }
};