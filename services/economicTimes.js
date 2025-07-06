import axios from 'axios';
import * as cheerio from 'cheerio';

// async function extractArticleDescription(articleUrl) {
//   try {
//     const { data: html } = await axios.get(articleUrl, {
//       headers: {
//         'User-Agent': 'Mozilla/5.0',
//       },
//     });

//     const $ = cheerio.load(html);

//     // Try 1: Standard Economic Times articles
//     let content = $('.artText.medium')
//       .find('p')
//       .map((i, el) => $(el).text().trim())
//       .get()
//       .filter(Boolean)
//       .join('\n\n');

//     // Try 2: Fallback for slideshow or alternate layout
//     if (!content || content.length < 100) {
//       content = $('section, article, div, .clearfix')
//         .find('p')
//         .map((i, el) => $(el).text().trim())
//         .get()
//         .filter(text => text && text.length > 50)
//         .join('\n\n');
//     }

//     return content?.trim() || '';
//   } catch (err) {
//     console.warn(`⚠️ Failed to fetch content for ${articleUrl}: ${err.message}`);
//     return '';
//   }
// }

// async function extractArticleDescription(articleUrl) {
//   const { data: html } = await axios.get(articleUrl, {
//     headers: { 'User-Agent': 'Mozilla/5.0' }
//   });
//   const $ = cheerio.load(html);

//   // 1. Extract the synopsis (if available)
//   const synopsis = $('.artSyn.bgPink .summary').text().trim();

//   // 2. Extract all article paragraphs from the body
//   const bodyParagraphs = $('.artText.medium')
//     .find('p')
//     .map((i, el) => $(el).text().trim())
//     .get()
//     .filter(Boolean);

//   const body = bodyParagraphs.join('\n\n');

//   // Combine synopsis + body
//   const content = [synopsis, body].filter(Boolean).join('\n\n');

//   return content;
// }

async function extractArticleDescription(articleUrl) {
  try {
    const { data: html } = await axios.get(articleUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    const $ = cheerio.load(html);

    // Remove unwanted elements globally
    $('script, style, .adBox, .colombiaFail, .inSideInd, .hide_content, div[data-taboola], div[data-mid-newpos-mgid], .stockpro_widget, .liveEventMain_widget').remove();

    // Now select only paragraphs inside the article container
    const content = $('.artText.medium')
      .find('p')
      .map((_, el) => $(el).text().trim())
      .get()
      .filter(Boolean)
      .join('\n\n');

    return content;
  } catch (err) {
    console.warn(`⚠️ Failed to fetch ${articleUrl}:`, err.message);
    return '';
  }
}




export const scrapeEconomicTimesNews = async () => {
    const url = 'https://economictimes.indiatimes.com/markets';

    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        const listItems = $('#topStories ul.newsList > li').toArray();

        const newsPromises = listItems.map(async (el) => {
            const anchor = $(el).find('a[itemprop="url"]');
            const title = anchor.attr('title')?.trim() || anchor.text()?.trim();
            const link = anchor.attr('href');
            const fullLink = link?.startsWith('http')
                ? link
                : `https://economictimes.indiatimes.com${link}`;

            const titleMeta = anchor.find('meta[itemprop="name"]').attr('content');
            const finalTitle = titleMeta || title;

            if (finalTitle && fullLink) {
                const description = await extractArticleDescription(fullLink);

                return {
                    source: 'Economic Times',
                    title: finalTitle,
                    link: fullLink,
                    description,
                    fetchedAt: new Date(),
                    publishedAt: null,
                };
            }

            return null;
        });

        const resolvedNews = (await Promise.all(newsPromises)).filter(Boolean);

        console.log(`\n📰 Economic Times Top Stories (${resolvedNews.length} items):\n`);
        console.log(JSON.stringify(resolvedNews, null, 2));

        return resolvedNews;
    } catch (error) {
        console.error(`❌ Error scraping Economic Times Top Stories:`, error.message);
        return [];
    }
};

function cleanDescription(raw) {
  if (!raw) return '';

  return raw
    .replace(/Subscribe to .*?(\n|\.)/gi, '')
    .replace(/\(What's moving Sensex.*?\)/gi, '')
    .replace(/Top Trending Stocks:.*?(\n|$)/gi, '')
    .replace(/Also, ETMarkets\.com is now on Telegram.*?(\n|$)/gi, '')
    .replace(/\n{2,}/g, '\n') // remove extra newlines
    .trim();
}
