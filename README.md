brisky
============

Require Global Modules
----

node, npm

How to build
----
```
$ npm install
$ npm run build
```

How to run
----

```
$ npm config set brisky:jira_url [http(s)://[JIRA_HOST]:[JIRA_PORT]/[PATH]]
$ npm config set brisky:jira_project [YOUR_PROJECT]
$ npm config set brisky:jira_rapidViewId [PROJECT'S RAPID_VIEW_ID]
$ npm config set brisky:irc_host [HOST]
$ npm config set brisky:irc_channel [#CHANNEL]
$ export HTTPS_PROXY=[http(s)://[USER]:[PASSWORD]@[PROXY_HOST]:[PROXY_PORT]]
$ export JIRA_USERNAME=[JIRA_USERNAME]
$ export JIRA_PASSWORD=[JIRA_PASSWORD]
$ npm start
```

How to stop
----

```
$ npm stop
```
