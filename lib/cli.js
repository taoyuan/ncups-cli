const program = require('caporal');
const commands = require('./commands');
const pkg = require('../package.json');

program
  .version(pkg.version)
  .command('list', 'List all installed printers').action(commands.list)
  .command('find', 'Find all available printers for installation').action(commands.find)
  .command('install', 'Install a printer from available printers').action(commands.install)
  .command('manage', 'Manage an installed printer').action(commands.manage)
  .command('remove', 'Remove an installed printer').action(commands.remove);

program.parse(process.argv);
