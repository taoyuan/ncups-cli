/**
 * Created by taoyuan on 2017/6/14.
 */

const _ = require("lodash");
const clc = require("cli-color");
const inquirer = require('inquirer');
const Manager = require('ncups').Manager;
const utils = require('./utils');
const windowText = utils.initCliWindowWithText;

module.exports = async function manage() {
  const pm = new Manager();

  const actions = [
    {
      type: "list",
      name: "action",
      message: "what do you want to manage",
      choices: [
        {
          name: "Share / Unshare printer",
          value: "printer-is-shared"
        },
        {
          name: "Media (paper size)",
          value: "media"
        },
        {
          name: "Uninstall printer",
          value: "uninstall"
        }
      ]
    }
  ];

  const data = await pm.list();
  const choices = _.map(data, printer => ({
    name: printer.name,
    value: printer
  }));

  let answer = await inquirer.prompt({
    name: "printer",
    message: "What printer queue do you want to manage?",
    type: "list",
    choices: choices
  });
  const printer = answer.printer;

  answer = await inquirer.prompt(actions);
  const action = answer.action;


};
