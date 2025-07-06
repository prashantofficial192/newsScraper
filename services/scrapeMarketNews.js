import axios from 'axios';
import * as cheerio from 'cheerio';

const baseURL = 'https://economictimes.indiatimes.com';
const marketsURL = `${baseURL}/markets`;

export async function scrapeMarketNews() {
    try {
        console.log(`Starting scrape of ${marketsURL}...`);

        const browserHeaders = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
        };

        const { data: mainPageHtml } = await axios.get(marketsURL, { headers: browserHeaders });
        const $ = cheerio.load(mainPageHtml);
        const articleScrapePromises = [];

        $('#topStories ul.newsList li').each((index, element) => {
            const linkElement = $(element).find('a');
            const newsTitle = linkElement.text().trim();
            const relativeLink = linkElement.attr('href');

            if (newsTitle && relativeLink) {
                const newsLink = new URL(relativeLink, baseURL).href;
                console.log(`Found article: "${newsTitle}"`);

                const articlePromise = new Promise(async (resolve) => {
                    try {
                        const { data: articlePageHtml } = await axios.get(newsLink, { headers: browserHeaders });
                        const $$ = cheerio.load(articlePageHtml);

                        let description = '';

                        // --- ROBUST FALLBACK LOGIC ---

                        // 1. Attempt to scrape as a standard article
                        const articleBody = $$('div.artText');
                        if (articleBody.length > 0) {
                            console.log(` -> Scraping "${newsTitle}" as a standard article.`);
                            articleBody.find('script, style, .inSideInd.show').remove();
                            description = articleBody.text();
                        } else {
                            // 2. Fallback: Attempt to scrape as Slideshow Type 1
                            const slideDescV1 = $$('div.slide_desc');
                            if (slideDescV1.length > 0) {
                                console.log(` -> Scraping "${newsTitle}" as Slideshow Type 1.`);
                                slideDescV1.each((i, el) => {
                                    description += $$(el).text().trim() + '\n\n';
                                });
                            } else {
                                // 3. Fallback: Attempt to scrape as Slideshow Type 2
                                const slideDescV2 = $$('div.s_des');
                                if (slideDescV2.length > 0) {
                                    console.log(` -> Scraping "${newsTitle}" as Slideshow Type 2.`);
                                    slideDescV2.each((i, el) => {
                                        description += $$(el).find('p').text().trim() + '\n\n';
                                    });
                                }
                            }
                        }

                        // Final cleanup of the extracted text
                        const cleanedDescription = description.replace(/\s\s+/g, ' ').trim();

                        resolve({
                            source: 'The Economic Times',
                            newsTitle,
                            newsLink,
                            newsDescription: cleanedDescription || "Article content could not be scraped with known formats.",
                        });

                    } catch (error) {
                        console.error(`Could not scrape article at ${newsLink}: ${error.message}`);
                        resolve({
                            source: 'The Economic Times',
                            newsTitle,
                            newsLink,
                            newsDescription: "Failed to retrieve the full article.",
                        });
                    }
                });

                articleScrapePromises.push(articlePromise);
            }
        });

        if (articleScrapePromises.length === 0) {
            console.log("\nNo articles found. The website's CSS selectors have likely changed.");
            return;
        }

        console.log(`\nFound ${articleScrapePromises.length} articles. Now fetching full content with multi-layout support...`);

        const allNewsData = await Promise.all(articleScrapePromises);

        console.log('\n--- SCRAPING COMPLETE ---');
        console.log(JSON.stringify(allNewsData, null, 2));

    } catch (error) {
        console.error(`An error occurred: ${error.message}`);
    }
}