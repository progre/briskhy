import {format} from "util";
import IrcClient from "./ircclient";
import Watcher from "./jira/watcher";
import Ticket from "./jira/ticket";
import * as jirautils from "./jira/utils";

export async function wakeup(irc: IrcClient) {
    let watcher: Watcher;
    try {
        watcher = await Watcher.new();
    } catch (e) {
        irc.post("Failed to start watching the JIRA. Please check enviroments.");
        return;
    }
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
                        let message = process.env.npm_package_config_message_resolved;
                        if (!!message) {
                            irc.post(format(message, name, ticket.title));
                        }
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
                        let message = process.env.npm_package_config_message_closed;
                        if (!!message) {
                            irc.post(format(message, name, ticket.title));
                        }
                    });
            });
        list.filter(ticket => ticket.categoryTerm === "reopened")
            .forEach(ticket => {
                let message = process.env.npm_package_config_message_reopened;
                if (!!message) {
                    irc.post(format(message, ticket.title));
                }
            });
    });
    watcher.on("sprintstart", (name: string) => {
        irc.post(format(process.env.npm_package_config_message_sprintStarted, name));
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
            let messageTemplate = process.env.npm_package_config_message_opened;
            if (!messageTemplate) {
                return;
            }
            let message = format(messageTemplate, ticket.title, ticket.summary);
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
