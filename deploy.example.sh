export SLACK_BOT_TOKEN=the_SLACK_BOT_TOKEN
export SLACK_SIGNING_SECRET=the_SLACK_SIGNING_SECRET
export COUCHBASE_PASSWORD=the_COUCHBASE_PASSWORD

docker-compose build
docker push 192.168.1.151:32000/temporal-adventure-bot:1.22.117
helm upgrade temporal-adventure-bot --set couchbasePassword=$COUCHBASE_PASSWORD --set slackBotToken=$SLACK_BOT_TOKEN --set slackSigningSecret=$SLACK_SIGNING_SECRET ./temporal-adventure-bot
