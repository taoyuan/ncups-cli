/**
 * Created by taoyuan on 2017/6/14.
 */

const _ = require("lodash");
const clc = require("cli-color");
const inquirer = require('inquirer');
const Manager = require('ncups').Manager;
const utils = require('./utils');
const windowText = utils.initCliWindowWithText;

module.exports = async function install() {
  await new Installer().start();
};


/**
 *
 * The installer class handles the CLI input and output for the installation process
 *
 * workflow:
 *
 * 1.) start
 *          -> find printers
 * 2.) builds printer choices for prompt
 *
 * 3.) PROMPT: select a printer
 *          [or search again -> 1.]
 *
 * 4.) find drivers by printer or search slug
 *
 * 5.) PROMPT: select a driver
 *          [or cancel and go to printers -> 2.]
 *          [or search with own slug -> 4.]
 *
 * 6.) PROMPT: set additional configurations
 *
 * 7.) PROMPT: install [or quit]
 *
 */

class Installer {

  /**
   * installer class constructor
   */
  constructor() {
    this.pm = new Manager();
    this.printer = null;
    this.driver = null;

    this.printers = [];
    this.drivers = [];

    this.spinner = utils.spinner();
  }

  /**
   * start the installation process for the CLI
   */
  async start() {
    await this.findPrinters();
  }

  /**
   * find printers within the local network or directly attached to the machine
   * and build a inquirer choices object and call the printer selection prompt
   */
  async findPrinters() {

    // clear the current shell window and print app message
    windowText(" ncups ");

    // check, if printers had already been searched
    if (this.printers.length > 0) {
      // if so, go on with printer selection
      return await this.promptPrinterSelection(this.printers);
    }

    // start the spinner for indicating searching process
    this.spinner.start();

    // run search printers and catch callback
    const searchPrintersResult = await this.pm.discover();

    // printer counter
    let count = 0;

    // stop the spinner, because we are already in the callback
    this.spinner.stop();

    // clean the window again
    windowText(" ncups ");

    // distinguish between USB and NETWORK printers
    let network = searchPrintersResult['network'] || [];
    let usb = searchPrintersResult['direct'] || [];

    // set the found printers array to an empty array (in case something was found before)
    this.printers = [];

    // push a line separator to the found printers array (to distinguish in menu)
    this.printers.push(new inquirer.Separator(clc.green.bold("------  MENU  ------------------")));

    // add a menu option to search again
    this.printers.push({
      name: (("Search again")),
      value: "again"
    });

    // add a menu option to quit
    this.printers.push({
      name: (("quit")),
      value: "cancel"
    });

    if (usb.length > 0) {
      // push a line separator to the found printers array (to distinguish in menu)
      this.printers.push(new inquirer.Separator(clc.blue.bold("------  USB PRINTERS  -------")));
      // loop over the direct available printers
      _.forEach(usb, (item) => {

        count++; //increas printers counter
        this.printers.push({
          name: item.description + " (" + clc.red.italic("USB") + ")",
          value: item
        });
      })
    }

    if (network.length > 0) {
      // push a line separator to the found printers array (to distinguish in menu)
      this.printers.push(new inquirer.Separator(clc.blue.bold("------  NETWORK PRINTERS  ------")));

      // loop over the network available printers
      _.forEach(network, (item) => {
        count++; //increas printers counter
        this.printers.push({
          name: item.description + " (" + clc.red.italic("NETWORK") + ")",
          value: item
        });
      })
    }

    //promptShouldSearchDriversAgain();
    console.log("\n" + clc.green.bold(`! Found ${count} printer(s).`));

    await this.promptPrinterSelection(this.printers);
  }

  /**
   *
   * @param drivers
   */
  async prepareSelectPrinterDriverPromptChoices(drivers) {
    // reset and|or initialize this value
    this.drivers = [];

    // push a line separator to the found printers array (to distinguish in menu)
    this.drivers.push(new inquirer.Separator(clc.green.bold("------  MENU  ------------------")));

    // add a menu option to search with slug
    this.drivers.push({
      name: "Search other driver by custom slug",
      value: "other"
    });

    // add a menu option to cancel
    this.drivers.push({
      name: "Cancel",
      value: "cancel"
    });

    // push a line separator to the found printers array (to distinguish in menu)
    this.drivers.push(new inquirer.Separator(clc.blue.bold("-------  DRIVERS SELECTION  -------")));
    this.drivers.push(..._.map(drivers, driver => ({
      name: driver.makeAndModel + " (" + clc.red(driver.id) + ")",
      value: driver
    })));

    console.log("\n" + clc.green.bold(`! Found ${drivers.length} driver(s).`));
    const answer = await inquirer.prompt({
      type: 'list',
      name: 'driver',
      message: 'Please select the driver you want to use?',
      choices: this.drivers,
      default: 2
    });

    switch (answer.driver) {
      case "other":
        return await this.promptEnterSearchDriverWithSlug();
        break;
      case "cancel":
        return await this.findPrinters();
        break;
      default:

    }

    this.driver = answer.driver;
    return await this.definePrinterQueueSettings();
  }

  /**
   * prompts a printer selection based on the choices object
   * @param choices
   */
  async promptPrinterSelection(choices) {
    const answer = await inquirer.prompt({
      type: 'list',
      name: 'printer',
      message: 'Which one do you want to install?',
      choices: choices,
      default: 2
    });

    if (answer.printer === "again") {

      // reset the found printers array, so it can search again
      this.printers = [];
      return await this.findPrinters();
    }
    if (answer.printer === "cancel") {
      console.log("! Quit");
      process.exit(0);
    }

    this.printer = answer.printer;

    await this.searchDriver(answer.printer.model);
  }

  /**
   * search the printer driver database of CUPS by a given slug
   * @param slug
   */
  async searchDriver(slug) {
    try {
      // call the find function
      const drivers = await this.pm.findDrivers(slug);

      // in case of nothing found, ask if should search again
      if (drivers.length === 0) {
        return await this.promptShouldSearchDriversAgain();
      }

      await this.prepareSelectPrinterDriverPromptChoices(drivers);
    } catch (e) {
      console.error(e);
      // in case of an error, ask if should search again
      return await this.promptShouldSearchDriversAgain();
    }
  }

  /**
   *
   * @param slug
   */
  async promptEnterSearchDriverWithSlug(slug) {
    const answer = await inquirer.prompt({
      type: 'input',
      name: 'slug',
      message: 'Search driver by slug. Please enter a slug:',

    });
    return await this.searchDriver(answer.slug);
  }

  /**
   *
   */
  async promptShouldSearchDriversAgain() {
    const answer = await inquirer.prompt({
      type: 'list',
      name: 'again',
      message: 'No driver found. Would you like to search by entering a search slug?',
      choices: ["yes", "no"]
    });
    switch (answer.again) {
      case "yes":
        return await this.promptEnterSearchDriverWithSlug();
      default:
        return await this.findPrinters();
    }
  }

  /**
   * additionally settings you may define
   */
  async definePrinterQueueSettings() {
    const questions = [
      {
        type: "input",
        name: "name",
        message: "Please define the PRINT QUEUE name:",
        validate: input => {

          if (input.match(/\s/)) {

            return "Whitespaces are not allowed in a printer queue";
          }

          if (input.match(/[^a-zA-Z\-_0-9]/gmi)) {
            return 'Only "letters", "numbers", "_" and "-" is allowed';
          }

          return true;


        },
        default: this.printer.name
      },
      {
        type: "input",
        name: "description",
        message: "Please define the printer description / title:",
        default: this.printer.description
      },
      {
        type: "input",
        name: "location",
        message: "Please define the printer location",
        default: this.printer.location
      },
      {
        type: "confirm",
        name: "shared",
        message: "Do you want to share this printer on your network",
        default: false
      }
    ];

    const options = await inquirer.prompt(questions);
    options.driver = this.driver.driver;

    // this.printer.name = answer['name'];
    // this.printer.description = answer['description'];
    // this.printer.location = answer['location'];
    // this.printer.shared = answer['shared'];

    //console.log("! You have selected the printer: " + clc.blue.bold(this.printer.description));
    //console.log("! You have selected the driver:  " + clc.blue.bold(this.driver['make-and-model']));
    const answer = await inquirer.prompt({
      name: "install",
      type: "confirm",
      message: "Do you want to install this printer?"
    });

    if (answer.install) {
      await this.pm.install(this.printer, options);
      console.log(clc.green.bold("! Printer successfully installed."));
    }

    // return await this.findPrinters();
  }

}
