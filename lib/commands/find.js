/**
 * Created by taoyuan on 2017/6/14.
 */

const _ = require("lodash");
const clc = require("cli-color");
const Manager = require('ncups').Manager;
const utils = require('./utils');
const windowText = utils.initCliWindowWithText;

module.exports = async function find() {
  windowText(" ncups find");
  // instantiate the print manager class object
  const pm = new Manager();

  // set the indicator properties
  const spinner = utils.spinner();

  // write an initial message to the cli
  console.log(clc.green("Start searching local and network printer(s)..."));

  // start the spinner to indicate searching
  spinner.start();

  // call the search method
  const printers = await pm.discover();

  // callback called, so searching finished
  // stop the spinner
  spinner.stop();
  // write to the cli that searching has finished
  console.log(clc.green.bold("Finished searching.\n"));

  // loop over the connection types
  let index = 0;
  _.forEach(printers, (obj, groupKey) => {
    // write connection type group to the cli
    if (index > 0) {
      console.log();
    }
    console.log(clc.blue.bold("CONNECTION: ") + obj.length + "x " + groupKey + " connection");

    // loop over printers in connection group
    _.forEach(obj, (p, i) => {
      const isLast = i === obj.length - 1;
      // write printer to the cli
      if (i > 0) {
        console.log('|');
      }

      console.log(`├─ ${p.description} (${clc.blue(p.protocol.toUpperCase())})`);
      console.log(`${isLast ? '└': '├'}─ ${clc.red(p.uri_pretty)}`);

      // console.log((index > 0 ? "│\n" : "") + (index < length - 1 ? "├" : "├") + "─ " + printer.description + " (" + clc.blue(printer.protocol.toUpperCase()) + ")" + "\n" + (index < length - 1 ? "├" : "└") + "─ " + clc.red(printer.uri_pretty) + "");
    });
    // increase group index
    index++;
  });

  console.log("\n" + clc.green("If you want to install one of these, please type: ") + clc.red.bold("ncups install") + clc.green(" into your shell"));
};
