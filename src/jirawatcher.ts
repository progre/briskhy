import * as events from "events";
import * as jirautils from "./jirautils";

export default class JiraWatcher extends events.EventEmitter {
    private currentSprintState: string = null;

    static async new() {
        let rss = await jirautils.getRss(1);
        let result = await jirautils.parseFeed(rss);
        return new this(result[0].updated);
    }

    constructor(private lastUpdated: string) {
        super();
        setInterval(() => this.doWatching(), 60 * 1000);
    }

    private doWatching() {
        jirautils.getRss(10)
            .then(jirautils.parseFeed)
            .then(result => {
                console.log(result.length + "件中");
                let list = this.newer(result);
                console.log(list.length + "件が新着");
                this.emit("update", list);
            })
            .catch(e => {
                console.error(e.stack);
            });
        jirautils.getSprintInfo()
            .then(x => {
                let currentSprint = x.sprints[0];
                let prevState = this.currentSprintState;
                this.currentSprintState = currentSprint.state;
                if (prevState == null) {
                    return;
                }
                if (this.currentSprintState === prevState) {
                    return;
                }
                switch (this.currentSprintState) {
                    case "ACTIVE":
                        this.emit("sprintstart", currentSprint.name);
                        return;
                    case "CLOSED":
                        this.emit("sprintclose", currentSprint.name);
                        return;
                    default:
                        throw new Error(this.currentSprintState);
                }
            })
            .catch(e => {
                console.error(e.stack);
            });
    }

    private newer(result: any[]) {
        let list: any[] = [];
        for (let i = 0, len = result.length; i < len; i++) {
            let ticket = result[i];
            if (ticket.updated === this.lastUpdated) {
                break;
            }
            list.push(ticket);
        }
        if (list[0] != null) {
            this.lastUpdated = list[0].updated;
        }
        return list;
    }
}
