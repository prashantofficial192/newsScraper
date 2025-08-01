import axios from 'axios';
import mongoose from 'mongoose';
import * as cheerio from 'cheerio';
import { sendDiscordMessage } from '../../discord/discordNotifier.js';
import connectToDatabase from '../../../config/newsDb.js';
import { newsSchema } from '../../../models/newsModel.js';

const url = 'https://www.moneycontrol.com/news/tags/option-trading.html';

const browserHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
};

// 📦 Create model for "optionNews" collection
const OptionNews = mongoose.models.OptionNews || mongoose.model('OptionNews', newsSchema, 'optionNews');

// Function to scrape full article content from an article page
async function getArticleContent(url) {
    try {
        // Send request to the article page with custom browser headers (to avoid being blocked)
        const { data: articlePageHtml } = await axios.get(url, { headers: browserHeaders });

        // Load HTML into Cheerio to parse
        const $$ = cheerio.load(articlePageHtml);

        // --- Extract publish time ---
        let publishedTime = '';

        // Time is usually inside this class
        const scheduleDiv = $$('.article_schedule');

        // Remove extra spaces
        if (scheduleDiv.length > 0) {
            publishedTime = scheduleDiv.text().replace(/\s+/g, ' ').trim(); // Clean extra spaces
        }

        // Target the main content container by its ID
        const contentContainer = $$('#contentdata');

        // Remove unwanted elements like ads, social links, scripts, etc.
        contentContainer.find('script, style, .social_icons_wrapper, .mid-arti-ad, .related_stories_left_block, .taboolaClass, .maintextdiv, em, [id*="v-moneycontrol-"]').remove();

        // Extract only clean paragraph text
        const fullText = contentContainer.find('p')
            .map((i, el) => $$(el).text().trim()) // Get text from each <p> tag
            .get()
            .join('\n\n'); // Join all paragraphs

        const cleanedContent = fullText.replace(/\s\s+/g, ' ').trim() || "Unable to scrape content.";

        // Return both content and published time
        return {
            content: cleanedContent,
            publishedTime: publishedTime || "N/A",
        };

    } catch (error) {
        // console.error(`--> ERROR scraping article link ${url}: ${error.message}`);
        return "Failed to retrieve the full article content.";
    }
}

// Main function to get latest market news from MoneyControl
export async function getMoneyControlOptionsNews() {
    try {

        await connectToDatabase(); // ← connect to DB

        // --- Step 1: Send message to Discord before scraping options news
        await sendDiscordMessage('1. Scraping Options News...');

        // --- Step 2: Fetch the news list page ---
        const { data: listPageHtml } = await axios.get(url, { headers: browserHeaders });

        // Load HTML for parsing
        const $ = cheerio.load(listPageHtml);

        const articlesToScrape = [];

        // --- Step 3: Select only actual news articles ---
        // Using ID pattern of "newslist-" to avoid ads or other non-news items
        const selector = '#cagetory > li[id^="newslist-"]';

        $(selector).each((index, element) => {
            const linkElement = $(element).find('h2 > a');  // News title link

            const headline = linkElement.attr('title');
            const link = linkElement.attr('href');
            const overview = $(element).find('p').first().text().trim(); // Short summary below title

            // If valid title and link found, store it
            if (headline && link) {
                articlesToScrape.push({
                    headline,
                    link,
                    overview,
                    source: 'MoneyControl',
                    tag: 'Options Trading',
                });
            }
        });

        // If no articles found, inform user 
        if (articlesToScrape.length === 0) {
            console.log("\nNo articles found on the list page. The website's CSS selectors may have changed.");
            return [];
        }

        // --- Step 4: Scrape content from each article page in parallel ---
        const scrapePromises = articlesToScrape.map(async (article) => {
            const { content, publishedTime } = await getArticleContent(article.link);
            return {
                publishedTime, // Add publish time from article page
                ...article,
                content,
            };
        });


        // Wait for all scraping tasks to finish
        const fullNewsData = await Promise.all(scrapePromises);

        // await OptionNews.insertMany(fullNewsData, { ordered: false }); // skip duplicates

        const bulkInserts = [];

        for (const article of fullNewsData) {
            const exists = await OptionNews.exists({ link: article.link });
            if (!exists) {
                bulkInserts.push(article);
            }
        }

        if (bulkInserts.length > 0) {
            await OptionNews.insertMany(bulkInserts);
            await sendDiscordMessage(`2. Inserted ${bulkInserts.length} new articles into the database.`);
            // console.log(`✅ Inserted ${bulkInserts.length} new articles`);
        } else {
            // console.log("ℹ️ All articles already exist. Nothing new to insert.");
            await sendDiscordMessage('ℹ️ All articles already exist. Nothing new to insert in optionNews collection')
        }


        // --- Send message to Discord after scraping is completed ---
        await sendDiscordMessage(`1. Option News Scraping completed with ${fullNewsData.length} articles.`);

        // --- Final Result ---
        // console.log(JSON.stringify({
        //     status: 'success',
        //     timestamp: new Date().toISOString(),
        //     length: fullNewsData.length,
        //     data: fullNewsData,
        // }, null, 2));

        return fullNewsData;

    } catch (error) {
        console.error(error.message);
        return [];
    }
}