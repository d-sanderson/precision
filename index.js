const puppeteer = require("puppeteer");
const chalk = require("chalk");
const { getKeyWords } = require("./utils/index");

(async () => {
  // Delete press releases from previous run and create new one,
  // or create a press-release directory if it doesn't exist.
  const dir = "./press-releases";

  try {
    const keywords = await getKeyWords();
    const URL = `https://www.prnewswire.com/search/news/?keyword=${keywords}`;
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(URL);
    const displayResults = await page.$eval(
      ".alert.alert-muted",
      (el) => el.textContent
    );
    const regex = / \d+ /;

    const totalNewsStories = parseInt(displayResults.match(regex)[0].trim());
    const totalPages = totalNewsStories / 100;

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
