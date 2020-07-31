#!/usr/bin/env node
import chalk from 'chalk';
import clear from 'clear';
import figlet from 'figlet';
import program from 'commander';
import commandSplitUnits from './commands/split-units';
import commandMapPreview from './commands/mappreview/map-preview';

// program.exitOverride();

clear();
console.log(
  chalk.red(figlet.textSync('loud-toolchain', { horizontalLayout: 'full' }))
);

//console.warn('args', JSON.stringify(process.argv.slice(2), null, 2));

if (!process.argv.slice(2).length) {
  program.outputHelp();
}

program
  .version('0.0.1')
  .command('split-units <source> <destination>')
  .description(
    'Split unit binaries from their blueprint/scripts at <source> to <destination>'
  )
  .action((source, destination = 'units_binaries') => {
    commandSplitUnits(source, destination);
  });

program
  .command('map-preview <source> [destination]')
  .description('Extract the map preview from an SCD')
  .action((source, destination) => {
    commandMapPreview(source, destination);
  });

program.parse(process.argv);

//npm start split-units "G:\Git\Git-LOUD\gamedata\units" "G:\Git\Git-LOUD\gamedata\units_binaries"
