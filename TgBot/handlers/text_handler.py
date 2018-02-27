# -*- coding: utf-8 -*-

from .base_handler import BaseHandler
from dialog_flow import DialogFlowException

class TextHandler(BaseHandler):
    """Класс обработчика текстовых сообщений
    """
        
    def handle(self):
        """Метод обработки сообщения
        """

        try:
            response = self.df.sendMessage(self.message.text)
        except DialogFlowException as e:
            print(e)
            self.sendMessage(self.message.chat.id,
                            "Возникли неполадки :(\nПовтори, пожалуйста.")
        else:
            print("Intent:", response['intentName'])
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
