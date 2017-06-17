/**
 * Created by taoyuan on 2017/6/14.
 */

const clc = require("cli-color");
const loading = require('loading-indicator');
const presets = require('loading-indicator/presets');

/**
 *
 * @param text
 * @returns {string}
 */
const lineText = (text) => {
  const windowSize = process.stdout.getWindowSize();
  let sep = "";
  for (let i = 0; i < windowSize[0] - text.length; i++) {
    sep += " ";
  }

  return text + sep;
};


/**
 *
 * @returns {string}
 */
const emptyLine = () => {
  const windowSize = process.stdout.getWindowSize();
  let sep = "";
  for (let i = 0; i < windowSize[0]; i++) {
    sep += " ";
  }

  return sep;
};


/**
 *
 * @param text
 */
const initCliWindowWithText = (text) => {
  console.log("\u001b[2J\u001b[0;0H");
  console.log(clc.black.bgWhite(emptyLine()));
  console.log(clc.black.bgWhite(lineText(text)));
  console.log(clc.black.bgWhite(emptyLine()));
};

/**
 *
 * @returns {*|exports|module.exports}
 */
const spinner = function () {
  // return new LoadingIndicator({
  //   preset: "dots",
  //   suffix: " searching for locale and network printers",
  //   prefix: "! CUPS Printers: ",
  //   sequence: [
  //     clc.blue("⠋"),
  //     clc.green("⠙"),
  //     clc.blue("⠹"),
  //     clc.green('⠸'),
  //     clc.blue("⠼"),
  //     clc.green("⠴"),
  //     clc.blue("⠦"),
  //     clc.green('⠧'),
  //     clc.blue("⠇"),
  //     clc.green('⠏')
  //   ]
  // });

  let timer;

  return {
    start: () => {
      timer = loading.start(null, {
        frames: [
          clc.blue("⠋"),
          clc.green("⠙"),
          clc.blue("⠹"),
          clc.green('⠸'),
          clc.blue("⠼"),
          clc.green("⠴"),
          clc.blue("⠦"),
          clc.green('⠧'),
          clc.blue("⠇"),
          clc.green('⠏')
        ]
      });
    },
    stop: () => loading.stop(timer)
  }

};


/**
 * all exports come here
 */
module.exports = {
  lineText,
  emptyLine,
  initCliWindowWithText,
  spinner
};
