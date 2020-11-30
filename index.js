const puppeteer = require("puppeteer");
const chalk = require("chalk");
const {
  getKeyWords,
  scrapeLinks,
  scrapePressRelease,
  parseHTMLtoMarkdown,
  savePressRelease,
  deletePreviousPressReleases,
} = require("./utils/index");
const { partial } = require("lodash");

(async () => {
  // Delete press releases from previous run and create new one,
  // or create a press-release directory if it doesn't exist.
  const dir = "./press-releases";
  deletePreviousPressReleases(dir);

  try {
    const keywords = await getKeyWords();
    const URL = `https://www.prnewswire.com/search/news/?keyword=${keywords}&page=1&pagesize=100`;
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(URL);
    const displayResults = await page.$eval(
      ".alert.alert-muted",
      (el) => el.textContent
    );
    const regex = / \d+ /;
    const totalNewsStories = parseInt(displayResults.match(regex)[0].trim());

    const isOnePage = totalNewsStories <= 100;
    if (isOnePage) {
      const links = await scrapeLinks(page);
      for (let i = 0; i < links.length; i++) {
        const { headline, body } = await scrapePressRelease(
          page,
          links[i].link
        );
        const markdown = parseHTMLtoMarkdown(headline + "<br>" + body);
        await savePressRelease(markdown, links[i].headline);
      }
    } else {
      const totalPages = totalNewsStories / 100;
      console.log(
        chalk.bgGreen.white(totalPages + " pages of press releases...")
      );
      
      let pageResults = [];
      for (let i = 1; i <= totalPages; i++) {
        pageResults.push(
          `https://www.prnewswire.com/search/news/?keyword=${keywords}&page=${i}&pagesize=100`
        );
      }
      for (let i = 0; i < pageResults.length; i++) {
        await page.goto(pageResults[i], { waitUntil: "load" });
        const links = await scrapeLinks(page);
        for (let i = 0; i < links.length; i++) {
          const { headline, body } = await scrapePressRelease(
            page,
            links[i].link
          );
          const markdown = parseHTMLtoMarkdown(headline + "<br>" + body);
          await savePressRelease(markdown, links[i].headline);
        }
      }
    }

    await browser.close();
  } catch (err) {
    // Catch and display errors

    console.error(err);
    await browser.close();
    console.error(
      `Browser Closed. Press Releases could not be gathered :( ${err}`
    );
  }
})();
