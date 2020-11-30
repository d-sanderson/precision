const fs = require("fs");
const chalk = require("chalk");
const TurndownService = require("turndown");
const inquirer = require("inquirer");

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


const parseHTMLtoMarkdown = (text) => {
  var turndownService = new TurndownService();
  const markdown = turndownService.turndown(text);
  return markdown;
};


module.exports = {
  deletePreviousPressReleases,
  parseHTMLtoMarkdown,
  getKeyWords,
};