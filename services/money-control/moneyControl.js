import axios from 'axios';
import * as cheerio from 'cheerio';

const baseURL = 'https://www.moneycontrol.com';
const marketsURL = `${baseURL}/news/business/markets/`;

const browserHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
};

async function getArticleContent(url) {
    try {
        const { data: articlePageHtml } = await axios.get(url, { headers: browserHeaders });
        const $$ = cheerio.load(articlePageHtml);

        // Target the main content container by its ID
        const contentContainer = $$('#contentdata');

        // IMPORTANT: Before extracting text, remove all known "junk" elements
        // like ads, related stories, videos, disclaimers, etc.
        contentContainer.find('script, style, .social_icons_wrapper, .mid-arti-ad, .related_stories_left_block, .taboolaClass, .maintextdiv, em, [id*="v-moneycontrol-"]').remove();

        // Join the text from all paragraph tags within the cleaned container
        const fullText = contentContainer.find('p').map((i, el) => $$(el).text().trim()).get().join('\n\n');

        // Final cleanup to ensure no excessive whitespace remains
        return fullText.replace(/\s\s+/g, ' ').trim() || "Content could not be scraped.";

    } catch (error) {
        console.error(`--> ERROR scraping article link ${url}: ${error.message}`);
        return "Failed to retrieve the full article content.";
    }
}

export async function getMoneyControlNews() {
    try {
        console.log(`Step 1: Fetching news list from: ${marketsURL}`);

        // 1. Fetch the HTML of the main news list page
        const { data: listPageHtml } = await axios.get(marketsURL, { headers: browserHeaders });
        const $ = cheerio.load(listPageHtml);

        const articlesToScrape = [];

        // 2. Precisely select only the list items that are actual news articles.
        const selector = '#cagetory > li[id^="newslist-"]';

        $(selector).each((index, element) => {
            const linkElement = $(element).find('h2 > a');

            const title = linkElement.attr('title');
            const link = linkElement.attr('href');
            const summary = $(element).find('p').first().text().trim();

            if (title && link) {
                articlesToScrape.push({
                    title,
                    link,
                    summary,
                    source: 'MoneyControl',
                });
            }
        });

        if (articlesToScrape.length === 0) {
            console.log("\nNo articles found on the list page. The website's CSS selectors may have changed.");
            return [];
        }

        console.log(`\nStep 2: Successfully found ${articlesToScrape.length} articles. Now fetching full content...`);

        // 3. Create an array of promises. Each promise will resolve with the full article details.
        const scrapePromises = articlesToScrape.map(async (article) => {
            const content = await getArticleContent(article.link);
            return {
                ...article, // Keep original title, link, summary, source
                content: content, // Add the full scraped content
            };
        });

        // 4. Run all scraping tasks in parallel and wait for them all to complete.
        const fullNewsData = await Promise.all(scrapePromises);

        console.log('\n--- SCRAPING COMPLETE ---');
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