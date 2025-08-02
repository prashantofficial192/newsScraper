import axios from 'axios';
import * as cheerio from 'cheerio';
import mongoose from 'mongoose';
import { sendDiscordMessage } from '../../discord/discordNotifier.js';
import connectToDatabase from '../../../config/newsDb.js';
import { newsSchema } from '../../../models/newsModel.js';
import browserHeaders from '../../../config/browser-agent/browserAgent.js';

// Main URL of the MoneyControl market news page
const url = 'https://www.moneycontrol.com/news/business/personal-finance/';

// Create model for "personalFinanceNews" collection
const PersonalFinanceNews = mongoose.models.PersonalFinanceNews || mongoose.model('PersonalFinanceNews', newsSchema, 'personalFinanceNews');

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

        // --- Extract main article content ---
        const contentContainer = $$('#contentdata'); // Main article content wrapper

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
            publishedTime: publishedTime || "Unknown",
        };

    } catch (error) {
        // console.error(`--> ERROR scraping article link ${url}: ${error.message}`);
        return "Failed to retrieve the full article content.";
    }
}

// Main function to get latest market news from MoneyControl
export async function getPersonalFinanceNews() {
    try {
        // Step 1: Connect to DB
        await connectToDatabase();

        // Step 2: Send message to Discord before scraping commodities news
        await sendDiscordMessage('8. Scraping Personal Finance News...');

        // Step 3: Fetch the news list page
        const { data: listPageHtml } = await axios.get(url, { headers: browserHeaders });

        // Step 4: Load HTML for parsing
        const $ = cheerio.load(listPageHtml);

        const articlesToScrape = [];

        // Step 5: Select only actual news articles
        // Using ID pattern of "newslist-" to avoid ads or other non-news items
        const selector = '#cagetory > li[id^="newslist-"]';

        $(selector).each((index, element) => {
            const linkElement = $(element).find('h2 > a'); // News title link
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
                    tag: 'Personal Finance'
                });
            }
        });

        // If no articles found, inform user
        if (articlesToScrape.length === 0) {
            console.log("\nNo articles found on the list page. The website's CSS selectors may have changed.");
            return [];
        }

        // Step 6: Scrape content from each article page in parallel
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

        // Step 7: Filter out articles with unscripted content
        const filteredNewsData = fullNewsData.filter(article => article.content !== "Unable to scrape content.");

        // Step 8: Insert new articles into the database
        const bulkInserts = [];

        for (const article of filteredNewsData) {
            const exists = await PersonalFinanceNews.exists({ link: article.link });
            if (!exists) {
                bulkInserts.push(article);
            }
        }

        if (bulkInserts.length > 0) {
            await PersonalFinanceNews.insertMany(bulkInserts);
            await sendDiscordMessage(`8. Inserted ${bulkInserts.length} new articles into the database.`);
            // console.log(`✅ Inserted ${bulkInserts.length} new articles`);
        } else {
            // console.log("ℹ️ All articles already exist. Nothing new to insert.");
            await sendDiscordMessage('ℹ️ All articles already exist. Nothing new to insert in personalFinanceNews collection')
        }


        // Step 9: Send message to Discord after scraping is completed
        await sendDiscordMessage(`8. Personal Finance News Scraping completed with ${fullNewsData.length} articles.`);


        // --- Final Result ---
        // console.log(JSON.stringify({
        //     status: 'success',
        //     source: 'MoneyControl',
        //     timestamp: new Date().toISOString(),
        //     length: filteredNewsData.length,
        //     data: filteredNewsData,
        // }, null, 2));

        return fullNewsData;

    } catch (error) {
        console.error(error.message);
        return [];
    }
}