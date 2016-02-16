const promisify: (func: Function) => (...args: any[]) => Promise<any> = require("native-promisify");
import * as fs from "fs";
const readFile = promisify(fs.readFile);
import {CronJob} from "cron";
import IrcClient from "./ircclient";

export async function wakeup(irc: IrcClient) {
    JSON.parse(await readFile("cron.json"))
        .forEach((x: any) => new CronJob({
            cronTime: x.time,
            onTick: () => irc.post(x.message),
            start: true
        }));
}
