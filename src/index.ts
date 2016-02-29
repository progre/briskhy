/// <reference path="typings.d.ts"/>
try { require("source-map-support").install(); } catch (e) { /* empty */ }
const promisify: (func: Function) => (...args: any[]) => Promise<any> = require("native-promisify");
import * as fs from "fs";
const read = promisify(fs.read);
const merge = require("merge");
import IrcClient from "./ircclient";
import * as jira from "./bot/jira";
import * as cron from "./bot/cron";

async function main(configPath: string) {
    let config = JSON.parse(await read("lib/res/config.json"));
    if (configPath != null) {
        merge(config, JSON.parse(await read(configPath)));
    }
    let irc = new IrcClient(config.irc);
    await irc.connect();
    console.log("irc connected.");

    cron.wakeup(irc);
    jira.wakeup(config.jira, irc);
}

main(process.argv[2]).catch(e => console.error(e.stack));
