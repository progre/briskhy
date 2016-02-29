import * as _request from "request";
const request: typeof _request = require("request");
const cheerio = require("cheerio");
import Ticket from "./ticket";

export async function getSprintInfo(url: string, rapidViewId: number) {
    return JSON.parse(await getJira(
        url,
        `/rest/greenhopper/1.0/sprintquery/${rapidViewId}`));
}

export async function getTicketInfo(url: string, ticket: string) {
    let res = await getJira(
        url,
        "/si/jira.issueviews:issue-xml/" + ticket + "/" + ticket + ".xml"
    );
    let $ = cheerio.load(res, { ignoreWhitespace: true, xmlMode: true });
    return {
        links: $("issuelinks issuekey").map(function() { return $(this).text(); }).get(),
        parent: $("parent").text(),
        sprint: $("customfield[key=\"com.pyxis.greenhopper.jira:gh-sprint\"]").length > 0,
        username: $("assignee").attr("username")
    };
}

export function getRss(url: string, project: string, maxResults: number) {
    return getJira(
        url,
        "/activity?"
        + `maxResults=${maxResults}&`
        + `streams=key+IS+${project}&`
        + "os_authType=basic");
}

function getJira(url: string, path: string) {
    return new Promise<string>((resolve, reject) => {
        request(
            url + path,
            {
                auth: {
                    pass: process.env.JIRA_PASSWORD,
                    user: process.env.JIRA_USERNAME
                }
            },
            (err, res, body) => {
                if (err != null) {
                    reject(err);
                    return;
                }
                resolve(body);
            });
    });
}

export function parseFeed(res: string) {
    let $ = cheerio.load(res, { ignoreWhitespace: true, xmlMode: true });
    return (<any[]>$("entry")).map(function() {
        let elem = $(this);
        let activityObject = elem.children("activity\\:object");
        // let content: string = elem.children("content").text().replace("&lt;", "<");
        return new Ticket(
            elem.children("id").text(),
            elem.children("category").attr("term"),
            elem.children("author").children("usr\\:username").text(),
            elem.children("published").text(),
            elem.children("updated").text(),
            activityObject.children("title").text(),
            activityObject.children("summary").text(),
            activityObject.children("link").attr("href"));
    });
}
