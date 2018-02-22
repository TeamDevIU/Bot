#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Основной модуль приложения, содержащий функции-обработчики пользовательских сообщений
    Используется веб-сервер библиотеки aiohttp для запуска бота
    с использованием webhook
"""

import json
import requests
import telebot
from aiohttp import web
from config import API_TOKEN
from webhookConfig import *

WEBHOOK_URL_BASE = "https://{}".format(WEBHOOK_HOST)
WEBHOOK_URL_PATH = "/{}/".format(API_TOKEN)

bot = telebot.TeleBot(API_TOKEN)

app = web.Application()

async def handle(request):
    """ Функция-обработчик запросов, поступающих на веб-сервер

    :param request: объект-запрос

    """

    if request.match_info.get('token') == bot.token:
        request_body_dict = await request.json()
        update = telebot.types.Update.de_json(request_body_dict)
        bot.process_new_updates([update])
        return web.Response()
    else:
        return web.Response(status=403)

app.router.add_post('/{token}/', handle)

@bot.message_handler(content_types=['voice'])
def handleAudio(message):
    """ Обработчик голосовых сообщений пользователя
    
    :param message: сообщение пользователя

    """
    fileInfo = bot.get_file(message.voice.file_id)
    bot.send_message(message.chat.id, "я не понимаю аудиосообщения :(")
    file = requests.get('https://api.telegram.org/file/bot{0}/{1}'.
                        format(API_TOKEN, fileInfo.file_path))
                        

@bot.message_handler()
def echoMessage(message):
    """ Обработчик всех сообщений пользователя
    
    :param message: сообщение пользователя

    """
    bot.reply_to(message, message.text)


bot.remove_webhook()
bot.set_webhook(url=WEBHOOK_URL_BASE+WEBHOOK_URL_PATH)

web.run_app(
    app,
    host=WEBHOOK_LISTEN,
    port=WEBHOOK_PORT,
)
