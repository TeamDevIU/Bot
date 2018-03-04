# -*- coding: utf-8 -*-

import requests
from .base_handler import BaseHandler
from config import API_TOKEN
from voice_message import SpeechException, voiceToText
from dialog_flow import DialogFlowException

class VoiceHandler(BaseHandler):
    """Класс обработчика голосовых сообщений
    """
        
    def handle(self):
        """Метод обработки сообщения
        """

        fileInfo = self.bot.get_file(self.message.voice.file_id)
        response = requests.get('https://api.telegram.org/file/bot{0}/{1}'.
                        format(API_TOKEN, fileInfo.file_path))
        try:
            text = voiceToText(response.content)
        except SpeechException as e:
            self.logger.error("Speech handler exception:\n{}".format(e))
            self.sendMessage(self.message.chat.id, "Я не могу понять, что ты говоришь :(")
        else:
            try:
                response = self.df.sendMessage(text)
            except DialogFlowException as e:
                self.logger.error("Dialog Flow exception:\n{}".format(e))
                self.sendMessage(self.message.chat.id,
                                "Возникли неполадки :(\nПовтори, пожалуйста.")
            else:
                self.logger.debug("Intent: {}".format(response['intentName']))
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
            
            
