export SLACK_BOT_TOKEN=the_SLACK_BOT_TOKEN
export SLACK_SIGNING_SECRET=the_SLACK_SIGNING_SECRET

docker-compose build
docker push 192.168.1.151:32000/temporal-adventure-bot:1.22.99
helm upgrade temporal-adventure-bot --set slackBotToken=$SLACK_BOT_TOKEN --set slackSigningSecret=$SLACK_SIGNING_SECRET ./temporal-adventure-bot
