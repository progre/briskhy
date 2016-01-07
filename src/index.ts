/// <reference path="typings.d.ts"/>
try { require("source-map-support").install(); } catch (e) { /* empty */ }
import * as fs from "fs";
import {format} from "util";
const promisify: (func: Function) => (...args: any[]) => Promise<any> = require("native-promisify");
import {CronJob} from "cron";
import IrcClient from "./ircclient";
import JiraWatcher from "./jirawatcher";
import Ticket from "./ticket";
import * as jirautils from "./jirautils";

async function main() {
    let irc = new IrcClient();
    await irc.connect();
    console.log("irc connected.");

    JSON.parse(await promisify(fs.readFile)("cron.json"))
        .forEach((x: any) => new CronJob({
            cronTime: x.time,
            onTick: () => irc.post(x.message),
            start: true
        }));
    let watcher = new JiraWatcher();
    watcher.on("update", (list: Ticket[]) => {
        list.forEach(ticket => {
            console.log(ticket);
        });
        // createdを収集
        list.filter(ticket => ticket.categoryTerm === "created")
            .forEach(ticket => {
                console.log("created: " + ticket.title);
                setTimeout(() => notifyCreatedTicket(irc, ticket), 60 * 1000);
            });
        list.filter(ticket => ticket.categoryTerm === "resolved")
            .forEach(ticket => {
                jirautils.getTicketInfo(ticket.title)
                    .then(info => {
                        let name = info.username;
                        if (name === "-1") {
                            name = "all";
                        }
                        irc.post(`${name} さんの ${ticket.title} が解決しました。`);
                    });
            });
        list.filter(ticket => ticket.categoryTerm === "closed")
            .forEach(ticket => {
                jirautils.getTicketInfo(ticket.title)
                    .then(info => {
                        let name = info.username;
                        if (name === "-1") {
                            name = "all";
                        }
                        irc.post(`${name} さんの ${ticket.title} が閉じました。`);
                    });
            });
        list.filter(ticket => ticket.categoryTerm === "reopened")
            .forEach(ticket => {
                irc.post(`${ticket.title} は開き直されました。`);
            });
    });
    watcher.on("sprintstart", (name: string) => {
        irc.post(format(process.env.npm_package_config_message_sprintStart, name));
    });
    watcher.on("sprintclose", (name: string) => {
        irc.post(format(process.env.npm_package_config_message_sprintClosed, name));
    });
}

function notifyCreatedTicket(irc: IrcClient, ticket: Ticket) {
    return jirautils.getTicketInfo(ticket.title)
        .then(info => {
            let numLinks = info.links.length;
            let inSprint = info.sprint;
            let message = "新しいチケット: 【" + ticket.title + "】" + ticket.summary;
            if (info.parent.length > 0) {
                message += " (" + info.parent + "のサブチケット)";
            } else {
                let warning = "";
                if (false /* link check */) {
                    if (numLinks === 0) {
                        warning += "リンクなし！";
                    }
                }
                if (false /* splint check */) {
                    if (!inSprint) {
                        warning += "Sprint外！";
                    }
                }
                if (warning.length > 0) {
                    message += " (" + warning + ")";
                }
            }
            irc.post(message);
            irc.post(ticket.link);
        });
}

main().catch(e => console.error(e.stack));
