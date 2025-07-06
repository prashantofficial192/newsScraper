import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs-extra';
import path from 'path';

const __dirname = path.resolve();

export const scrapeStockNews = async () => {
    const url = 'https://www.moneycontrol.com/news/business/markets/';

    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const newsList = [];

        $('.clearfix').each((i, el) => {
            const title = $(el).find('h2').text().trim();
            const link = $(el).find('a').attr('href');

            if (title && link) {
                newsList.push({
                    title,
                    link: link.startsWith('http') ? link : `https://www.moneycontrol.com${link}`,
                    source: 'MoneyControl',
                    timestamp: new Date().toISOString()
                });
            }
        });

        const filePath = path.join(__dirname, 'data', 'news.json');

        // ✅ Check if file exists and has valid content
        let existingData = [];
        if (fs.existsSync(filePath)) {
            const fileContent = await fs.readFile(filePath, 'utf8');

            if (fileContent.trim().length > 0) {
                try {
                    existingData = JSON.parse(fileContent);
                } catch (parseErr) {
                    console.error(`❌ Error parsing JSON: ${parseErr.message}`);
                    existingData = [];
                }
            }
        }

        // ✅ Merge new data with existing
        const updatedData = [...existingData, ...newsList];

        // ✅ Remove duplicates based on title+link
        const uniqueData = Array.from(new Map(updatedData.map(item => [`${item.title}-${item.link}`, item])).values());

        // ✅ Write back to file with formatting
        await fs.outputJson(filePath, uniqueData, { spaces: 2 });

        console.log(`✅ [${new Date().toLocaleString()}] Saved ${newsList.length} new articles. Total articles: ${uniqueData.length}`);
    } catch (error) {
        console.error(JSON.stringify({
            status: 'error',
            timestamp: new Date().toISOString(),
            error: error.message
        }, null, 2));
    }
};