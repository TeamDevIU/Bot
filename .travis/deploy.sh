#!/bin/bash

eval "$(ssh-agent -s)" # Start ssh-agent cache
chmod 600 /tmp/deploy_rsa # Allow read access to the private key
ssh-add /tmp/deploy_rsa # Add the private key to SSH


# Skip this command if you don't need to execute any additional commands after deploying.

ssh -o "StrictHostKeyChecking no" botuser@$PUBLIC_HOST <<EOF
  cd Bot;
  git pull;
  rm TgBot/config.py;
  echo "SERVER_HOST=\"http://$PRIVATE_HOST:8080\"
WEBHOOK_HOST=\"$SERVER_DNS/tg\"
API_TOKEN=\"$API_TOKEN\"
DIALOG_FLOW_TOKEN=\"$DIALOG_FLOW_TOKEN\"
WEBHOOK_LISTEN=\"0.0.0.0\"
WEBHOOK_PORT=\"8002\"
YANDEX_SPEECH_TOKEN=\"$YANDEX_SPEECH_TOKEN\"" > TgBot/config.py;
  cat TgBot/config.py;         
  rm VkGroupBot/config.json;
  echo "{\"YANDEX_DEV_KEY\":\"$YANDEX_SPEECH_TOKEN\",
             \"VKTOKEN\":\"$VK_TOKEN\",
             \"DIALOGFLOW_CLIENT_ID\":\"$DIALOG_FLOW_TOKEN\",
             \"PORT_BOT\":8000,
             \"URL\":\"https://$PUBLIC_HOST/vk/callback\",
             \"MAINSERVER_URL\":\"$PRIVATE_HOST:8080\",
             \"WORKER\":2}" > VkGroupBot/config.json;
 cat VkGroupBot/config.json;
 rm main-server/run.sh;
 echo "go get github.com/gorilla/mux
       go get github.com/lib/pq
       go build
       ./go -dbhost=10.0.0.4 -dbport=5432 -dbuser=$PG_USER -dbpass=$PG_PASSWORD -dbname=botdb -tgbot=$PRIVATE_HOST:8002 -vkbot=$PRIVATE_HOST:8000/send_message -port=8080" > main-server/run.sh;
 cat main-server/run.sh;
 sudo docker-compose build --no-cache;
 sudo docker-compose kill;
 sudo docker-compose up -d;
EOF
