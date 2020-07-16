# LOUD Toolchain

## How to:

- Download NPM [https://nodejs.org/en/download/](https://nodejs.org/en/download/);
- Download the source;
- Open a CMD / PowerShell / Terminal where you unpacked the source;
- Run `npm i` if its your first time or when source has changed;
- Run any of the commands below: `npm run <command> <arguments for command>`

## Commands

### Split units

This command will split the units from their binaries.
It will keep the `_script.lua` and `_unit.bp` in the _source_ location and move the others to the _destination_ with the same folder structure, starting from _units/_.
_source must end with /units!_

```
split-units <source> <destination>
Ex: npm start split-units "G:\Git\Git-LOUD\gamedata\units" "G:\Git\Git-LOUD\gamedata\units_binaries"
```
