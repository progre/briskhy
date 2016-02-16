/// <reference path="typings.d.ts"/>
try { require("source-map-support").install(); } catch (e) { /* empty */ }
import IrcClient from "./ircclient";
import * as jira from "./bot/jira";
import * as cron from "./bot/cron";

async function main() {
    let irc = new IrcClient();
    await irc.connect();
    console.log("irc connected.");

    cron.wakeup(irc);
    jira.wakeup(irc);
}

main().catch(e => console.error(e.stack));
