const irc = require("irc");

export default class IrcClient {
    private bot: any;

    connect() {
        return new Promise((resolve, reject) => {
            this.bot = new irc.Client(process.env.npm_package_config_irc_host, process.env.npm_package_config_irc_name, {
                autoConnect: false,
                channels: [process.env.npm_package_config_irc_channel],
                debug: true
            });
            this.bot.addListener("error", (m: any) => {
                console.error("ERROR: %s: %s", m.command, m.args.join(" "));
            });
            this.bot.connect(resolve);
        });
    }

    post(message: string) {
       console.log("post to", process.env.npm_package_config_irc_channel, message);
       this.bot.say(process.env.npm_package_config_irc_channel, message);
    }
}
