/**
 * Created by taoyuan on 2017/6/14.
 */

const _ = require("lodash");
const clc = require("cli-color");
const Manager = require('ncups').Manager;
const utils = require('./utils');
const windowText = utils.initCliWindowWithText;

module.exports = async function list() {
  windowText(" ncups list");

  // instantiate the print manager class object
  const pm = new Manager();

  // write an initial message to the cli
  console.log(clc.green("Listing installed printers"));

  // start the spinner to indicate searching
  const data = await pm.list();

  // let choices = [];
  _.forEach(data, (printer, index) => {
    //choices.push({
    //    name: printer['name'],
    //    value: printer
    //})
    console.log(clc.blue(printer.name));
  })
  //inquirer.prompt({
  //    name:"printer",
  //    message: "What printer queue do you want to manage?",
  //    type: "list",
  //    choices: choices
  //
  //}).then((answer)=>{
  //
  //    //answer["printer"].getOptionsForPrinter((err, optionsData)=> {
  //    //    var util = require('util');
  //    //
  //    //        console.log(util.inspect(optionsData, true ,false));
  //    //});
  //
  //    console.log("you selected printer "+answer.printer.name);
  //    //console.log(answer["printer"].uninstall());
  //
  //})
};
