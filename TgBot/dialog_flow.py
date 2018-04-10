# -*- coding: utf-8 -*-

"""Модуль для взаимодействия с DialogFlow

:author: Melnikov Dmitry
"""

import json
import apiai

class DialogFlow():
    """Класс, предоставляющий интерфейс для взаимодействия с Dialog Flow
    """

    def __init__(self, token):
        """Конструктор класса

        :param token: токен для доступа к Dialog Flow
        """

        self.ai = apiai.ApiAI(token)
    
    def sendMessage(self, text, sessionId):
        """Метод отправки сообщения в Dialog Flow
        
        :param text: текст отправляемого сообщения

        :return: словарь, содержащий поля "speech", "intentName" и "parametrs"
    
        :rtype: dict

        :raise: DialogFlowException
        """

        self.ai.session_id = "tg" + str(sessionId)
        request = self.ai.text_request()
        request.query = text

        try:
            response = json.loads(request.getresponse().read())
        except BaseException:
            raise DialogFlowException("Error to accessing to DialogFlow")
        else:
            if response['status']['code'] != 200:
                raise DialogFlowException(
                    "Error to accessing to DialogFlow\nDialog Flow return: {0} - {1}".format(
                        response['status']['code'],
                        response['status']['errorType'] 
                    ))
            else:
                speech = response['result']['fulfillment']['speech']
                intentName = response.get('result').get('metadata').get('intentName', None)
                parameters = response['result']['parameters']
                sessionId = response['sessionId']

                return {
                    "speech": speech,
                    "intentName": intentName,
                    "parameters": parameters,
                    "sessionId": sessionId
                }
               
        

class DialogFlowException(Exception):
    """ 
    Класс исключений, возникающих при обращении к Dialog Flow
    """
    pass