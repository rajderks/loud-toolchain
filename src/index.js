#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var chalk_1 = __importDefault(require("chalk"));
var clear_1 = __importDefault(require("clear"));
var figlet_1 = __importDefault(require("figlet"));
var commander_1 = __importDefault(require("commander"));
clear_1["default"]();
console.log(chalk_1["default"].red(figlet_1["default"].textSync("pizza-cli", { horizontalLayout: "full" })));
commander_1["default"]
    .version("0.0.1")
    .description("An example CLI for ordering pizza's")
    .option("-p, --peppers", "Add peppers")
    .option("-P, --pineapple", "Add pineapple")
    .option("-b, --bbq", "Add bbq sauce")
    .option("-c, --cheese <type>", "Add the specified type of cheese [marble]")
    .option("-C, --no-cheese", "You do not want any cheese")
    .parse(process.argv);
console.log("you ordered a pizza with:");
if (commander_1["default"].peppers)
    console.log("  - peppers");
if (commander_1["default"].pineapple)
    console.log("  - pineapple");
if (commander_1["default"].bbq)
    console.log("  - bbq");
var cheese = true === commander_1["default"].cheese ? "marble" : commander_1["default"].cheese || "no";
console.log("  - %s cheese", cheese);
if (!process.argv.slice(2).length) {
    commander_1["default"].outputHelp();
}
