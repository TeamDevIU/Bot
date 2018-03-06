# -*- coding: utf-8 -*-

import requests
from .base_handler import BaseHandler
from config import API_TOKEN
from voice_message import SpeechException, voiceToText

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
            self.message.text = text
            super(VoiceHandler, self).handle()
            
            
