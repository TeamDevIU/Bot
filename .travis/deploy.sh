#!/bin/bash

eval "$(ssh-agent -s)" # Start ssh-agent cache
chmod 600 /tmp/deploy_rsa # Allow read access to the private key
ssh-add /tmp/deploy_rsa # Add the private key to SSH


# Skip this command if you don't need to execute any additional commands after deploying.
ssh -o "StrictHostKeyChecking no" botuser@$PUBLIC_HOST <<EOF
  cd Bot;
  git pull;
  rm TgBot/config.py;
  echo "SERVER_HOST=\"http://$PRIVATE_HOST:8080\"\n /
            WEBHOOK_HOST=\"$SERVER_DNS/tg\"\n /
            API_TOKEN=\"$API_TOKEN\"\n /
            DIALOG_FLOW_TOKEN=\"$DIALOG_FLOW_TOKEN\"\n /
            WEBHOOK_LISTEN=\"0.0.0.0\"\n  /
            WEBHOOK_PORT=\"8002\"\n /
            YANDEX_SPEECH_TOKEN=\"$YANDEX_SPEECH_TOKEN\"" > TgBot/config.py;
  cat TgBot/config.py;         
  rm VkGroupBot/config.json;
  echo "{\"YANDEX_DEV_KEY\":\"$YANDEX_SPEECH_TOKEN\",\n /
             \"VKTOKEN\":\"$VK_TOKEN\",\n /
             \"DIALOGFLOW_CLIENT_ID\":\"$DIALOG_FLOW_TOKEN\",\n /
             \"PORT_BOT\":8000 \n, /
             \"URL\":\"https://$PUBLIC_HOST/vk/callback\",\n /
             \"MAINSERVER_URL\":\"$PRIVATE_HOST:8080\",\n /
             \"WORKER\":2}" > VkGroupBot/config.json;
 cat VkGroupBot/config.json;
 rm main-server/run.sh;
 echo "go get github.com/gorilla/mux\n/
       go get github.com/lib/pq\n/
       go build\n/
       ./go -dbuser=$PG_USER -dbpass=$PG_PASSWORD -dbname=botdb -tgbot=$PRIVATE_HOST:8002 -vkbot=$PUBLIC_HOST:8000 -port=8080" > main-server/run.sh;
 cat main-server/run.sh;
 sudo docker-compose build --no-cache;
 sudo docker-compose up
EOF
