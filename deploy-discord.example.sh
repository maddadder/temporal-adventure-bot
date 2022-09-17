export DISCORD_BOT_TOKEN=the_DISCORD_BOT_TOKEN
export COUCHBASE_PASSWORD=the_COUCHBASE_PASSWORD
docker-compose build
docker push 192.168.1.151:32000/temporal-adventure-bot:1.22.126
helm install temporal-discord-adventure-bot --set couchbasePassword=$COUCHBASE_PASSWORD --set discordBotToken=$DISCORD_BOT_TOKEN --values ./temporal-adventure-bot/values.yaml --values ./temporal-adventure-bot/values.discord.yaml ./temporal-adventure-bot
