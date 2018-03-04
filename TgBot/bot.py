#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Основной модуль приложения, содержащий функции-обработчики пользовательских сообщений
    Используется веб-сервер библиотеки aiohttp для запуска бота
    с использованием webhook

:author: Melnikov Dmitry
"""

import json
import telebot
from aiohttp import web
from config import *
from handlers.text_handler import TextHandler
from handlers.voice_handler import VoiceHandler
from dialog_flow import DialogFlow
from main_server import MainServer


WEBHOOK_URL_BASE = "https://{}".format(WEBHOOK_HOST)
WEBHOOK_URL_PATH = "/{}/".format(API_TOKEN)

bot = telebot.TeleBot(API_TOKEN)
df = DialogFlow(DIALOG_FLOW_TOKEN)
server = MainServer(SERVER_HOST)

app = web.Application()

async def handleTg(request):
    """ Функция-обработчик запросов, поступающих на веб-сервер
        с сервера Telegram

    :param request: объект-запрос

    """

    if request.match_info.get('token') == bot.token:
        requestBodyDict = await request.json()
        update = telebot.types.Update.de_json(requestBodyDict)
        bot.process_new_updates([update])
        return web.Response()
    else:
        return web.Response(status=403)


async def handleMainServer(request):
    """ Функция-обработчик запросов, поступающих на веб-сервер
        с главного сервера приложения

    :param request: объект-запрос

    """
    try:
        requestBodyDict = await request.json()
    except BaseException as e:
        print(e)
        return web.Response(status=500, 
            text="Internal server error")
    

    if requestBodyDict:
        print(requestBodyDict)
        try:
            user_id = int(requestBodyDict['user_id'])
            message = str(requestBodyDict['message'])
        except (KeyError, ValueError) as e:
            return web.Response(status=400, 
                text="Bad request. Check request body")
        else:
            try:
                bot.send_message(user_id, message)
            except telebot.apihelper.ApiException as e:
                print(e)
                return web.Response(status=400, 
                    text="Bad request. Chat not found")
            else:
                return web.Response()
    else:
        return web.Response(status=400, 
                text="Bad request. Check request body")


app.router.add_post('/{token}/', handleTg)
app.router.add_post('/', handleMainServer)


@bot.message_handler(content_types=['voice', 'text'])
def answer(message):
    """ Обработчик всех сообщений пользователя
    
    :param message: сообщение пользователя

    """

    try:
        ct = message.content_type
        if ct == 'voice':
            VoiceHandler(bot, message, server, df)
        else:
            TextHandler(bot, message, server, df)
    except telebot.apihelper.ApiException as e:
        print(e)
        bot.send_message(message.chat.id, "Повтори, пожалуйста.")
    

bot.remove_webhook()
bot.set_webhook(url=WEBHOOK_URL_BASE+WEBHOOK_URL_PATH)

web.run_app(
    app,
    host=WEBHOOK_LISTEN,
    port=WEBHOOK_PORT,
)
