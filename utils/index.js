const fs = require("fs");
const chalk = require("chalk");
const TurndownService = require("turndown");
const inquirer = require("inquirer");
const kebabCase = require("lodash").kebabCase;

const getKeyWords = async () => {
  var questions = [
    {
      type: "input",
      name: "name",
      message: `Enter your desired keyword to search https://www.prnewswire.com/`,
    },
  ];
  let input = await inquirer.prompt(questions);
  let keywords = input.name.toLowerCase().split(" ").join("+");
  return keywords;
};
const deletePreviousPressReleases = (dir) => {
  if (fs.existsSync(dir)) {
    try {
      fs.rmdirSync(dir, { recursive: true });
      console.log(chalk.bgRedBright.white(`${dir} is deleted!`));
      fs.mkdirSync(dir);
      console.log(chalk.bgGreen.white(`${dir} is created`));
    } catch (err) {
      console.error(`Error while deleting ${dir}.`);
    }
  } else {
    fs.mkdirSync(dir);
    console.log(chalk.bgGreen.white(`${dir} is created`));
  }
};

const scrapeLinks = async (page) => {
  const prLinks = await page.evaluate(() => {
    const links = Array.from(
      document.querySelectorAll("a.news-release"),
      (element) => {
        const obj = { headline: element.textContent, link: element.href };
        return obj;
      }
    );
    return links;
  });
  return prLinks;
};

const scrapePressRelease = async (page, link) => {
  await page.goto(link, { waitUntil: "load" });
  let node = await page.$(".row > div > h1");
  const headline = await page.evaluate((node) => node.innerHTML, node);
  node = await page.$(".release-body.container");
  const body = await page.evaluate((node) => node.innerHTML, node);
  return { headline, body };
};

const parseHTMLtoMarkdown = (text) => {
    var turndownService = new TurndownService();
    const markdown = turndownService.turndown(text);
    return markdown;
  };
  
  const savePressRelease = async (markdown, headline) => {
    await fs.writeFile(
      `./press-releases/${kebabCase(headline)}.md`,
      markdown,
      function (err) {
        if (err) throw err;
        console.log(
          chalk.bgGreen.underline(
            `✅📰 Press release ${kebabCase(headline.slice(0, 50))}.md saved!`
          )
        );
      }
    );
  };

module.exports = {
  deletePreviousPressReleases,
  parseHTMLtoMarkdown,
  getKeyWords,
  scrapeLinks,
  scrapePressRelease,
  savePressRelease
};
