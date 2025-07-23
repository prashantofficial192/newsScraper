import axios from 'axios';
import * as cheerio from 'cheerio';
import browserHeaders from '../../../config/browser-agent/browserAgent.js';

// Main URL of the MoneyControl market news page
const url = 'https://www.moneycontrol.com/news/business/commodities/';

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

        const cleanedContent = fullText.replace(/\s\s+/g, ' ').trim() || "Content could not be scraped.";

        // Return both content and published time
        return {
            content: cleanedContent,
            publishedTime: publishedTime || "Unknown",
        };

    } catch (error) {
        console.error(`--> ERROR scraping article link ${url}: ${error.message}`);
        return {
            content: "Failed to retrieve the full article content.",
            publishedTime: "Unknown",
        };
    }
}

// Main function to get latest market news from MoneyControl
export async function getCommoditiesNews() {
    try {
        // --- Step 1: Fetch the news list page ---
        const { data: listPageHtml } = await axios.get(url, { headers: browserHeaders });

        // Load HTML for parsing
        const $ = cheerio.load(listPageHtml);

        const articlesToScrape = [];

        // --- Step 2: Select only actual news articles ---
        // Using ID pattern of "newslist-" to avoid ads or other non-news items
        const selector = '#cagetory > li[id^="newslist-"]';

        $(selector).each((index, element) => {
            const linkElement = $(element).find('h2 > a'); // News title link
            const title = linkElement.attr('title');
            const link = linkElement.attr('href');
            const summary = $(element).find('p').first().text().trim(); // Short summary below title

            // If valid title and link found, store it
            if (title && link) {
                articlesToScrape.push({
                    title,
                    link,
                    summary,
                    source: 'MoneyControl',
                });
            }
        });

        // If no articles found, inform user
        if (articlesToScrape.length === 0) {
            console.log("\nNo articles found on the list page. The website's CSS selectors may have changed.");
            return [];
        }

        // --- Step 3: Scrape content from each article page in parallel ---
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

        // --- Final Result ---
        console.log(JSON.stringify({
            status: 'success',
            source: 'MoneyControl-Full',
            timestamp: new Date().toISOString(),
            count: fullNewsData.length,
            data: fullNewsData,
        }, null, 2));

        return fullNewsData;

    } catch (error) {
        console.error('An unexpected error occurred during the scraping process:');
        console.error(error.message);
        return [];
    }
}