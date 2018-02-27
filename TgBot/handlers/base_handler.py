# -*- coding: utf-8 -*-

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
        self.handle()

    def sendMessage(self, id, text):
        """Метод отправки сообщения пользователю
        
        :param id: id пользователя
        :param text: текст сообщения

        """
        self.bot.send_message(id, text)
    

    def handle(self):
        """Метод для обработки сообщения.
            Переопределяется в дочерних классах
        """

        pass