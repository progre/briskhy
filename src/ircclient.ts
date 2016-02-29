const irc = require("irc");

export default class IrcClient {
    private bot: any;

    constructor(
        private config: any) {
    }

    connect() {
        return new Promise((resolve, reject) => {
            this.bot = new irc.Client(this.config.host, this.config.name, {
                autoConnect: false,
                channels: [this.config.channel],
                debug: true
            });
            this.bot.addListener("error", (m: any) => {
                console.error("ERROR: %s: %s", m.command, m.args.join(" "));
            });
            this.bot.connect(resolve);
        });
    }

    post(message: string) {
        this.bot.say(this.config.channel, message);
    }
}
