# -*- coding: utf-8 -*-

import logging
from dialog_flow import DialogFlowException

class BaseHandler():
    """Базовый класс обработчика сообщений

    """

    def __init__(self, bot, message, server, df=None):
        """Конструктор класса
        
        :param bot: экземпляр класса Telebot
        :param message: сообщение пользователя (telebot.types.Message)
        :param df: экземпляр класса DialogFlow
        :param server: экземпляр класса MainServer
        """

        self.bot = bot
        self.message = message
        self.server = server
        self.df = df
        self.logger = logging.getLogger("TgBot.UserMessageHandler")
        self.handle()
       

    def sendMessage(self, id, text):
        """Метод отправки сообщения пользователю
        
        :param id: id пользователя
        :param text: текст сообщения

        """
        self.logger.debug("SENDING MESSAGE TO TELEGRAM: {}".format(text))
        try:
            self.bot.send_message(id, text)
        except BaseException as e:
            self.logger.error("Exception of telegram api: {}".format(e))
    

    def handle(self):
        """Метод для обработки сообщения.
            Переопределяется в дочерних классах
        """
        try:
            response = self.df.sendMessage(self.message.text, self.message.chat.id)
        except DialogFlowException as e:
            self.logger.error("Dialog Flow exception:\n{}".format(e))
            self.sendMessage(self.message.chat.id,
                            "Возникли неполадки :(\nПовтори, пожалуйста.")
        else:
            self.logger.info("Response from Dialog Flow:\n"
                             "speech: {0}\tintent: {1}\tsession_id: {2}\tparameters: {3}".format(
                                response['speech'],
                                response['intentName'],
                                response['sessionId'],
                                response['parameters']
                            ))
            #self.logger.debug("Intent: {}".format(response['intentName']))
            if response['intentName'] == None:
                self.sendMessage(self.message.chat.id, response['speech'])
            else:
                    
                err, isAppend, s = self.server.sendRequest(
                    response['intentName'],
                    self.message,
                    response['parameters']
                )
                    
                if isAppend:
                    response['speech'] += s

                if err:
                    self.sendMessage(self.message.chat.id, s)
                else:
                    self.sendMessage(self.message.chat.id, response['speech'])

        