/**
 * Created by taoyuan on 2017/6/14.
 */
const _ = require("lodash");
const clc = require("cli-color");
const inquirer = require('inquirer');
const Manager = require('ncups').Manager;
const utils = require('./utils');
const windowText = utils.initCliWindowWithText;

module.exports = async function remove() {
  // instantiate the print manager class object
  const pm = new Manager();

  // write an initial message to the cli
  windowText(" ncups remove");
  console.log(clc.green("Listing installed printers that may be removed/uninstalled"));

  const data = await pm.list();
  const choices = _.map(data, printer => ({
    name: printer.name,
    value: printer
  }));

  const answer = await inquirer.prompt({
    name: "printer",
    message: "What printer do you want to remove/uninstall?",
    type: "list",
    choices: choices
  });

  //answer["printer"].getOptionsForPrinter((err, optionsData)=> {
  //    var util = require('util');
  //
  //        console.log(util.inspect(optionsData, true ,false));
  //});
  const answer_confirm = await inquirer.prompt({
    name: "sure",
    message: "Do you really want to delete printer " + clc.red.bold(answer.printer._queue) + "?",
    type: "confirm",
    default: false
  });

  if (answer_confirm.sure === true) {
    answer.printer.uninstall();
    console.log(clc.green("! ") + "you deleted printer " + clc.red.bold(answer.printer._queue));
  } else {
    console.log(clc.green("! ") + "ok, nothing happend");
  }
};
