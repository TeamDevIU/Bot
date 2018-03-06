# -*- coding: utf-8 -*-

from .base_handler import BaseHandler

class TextHandler(BaseHandler):
    """Класс обработчика текстовых сообщений
    """
        
    def handle(self):
        """Метод обработки сообщения
        """

        super(TextHandler, self).handle()