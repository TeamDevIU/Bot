# -*- coding: utf-8 -*-
"""Модуль для тестирования методов класса DialogFlow
"""

import unittest
from config import DIALOG_FLOW_TOKEN
from dialog_flow import DialogFlow


class TestDialogFlow(unittest.TestCase):
    """Класс, реализующий метод для тестирования методов класса DialogFlow
    """
    
    def setUp(self):
        """Метод, который будет запускаться перед каждым тестом
        """

        self.df = DialogFlow(DIALOG_FLOW_TOKEN)

    def testSendMessage(self):
        """Метод для тестирования метода sendMessage
            Сравниваем ответ, сформированный на основе запроса
            к Dialog Flow c ожидаемым
        """
        messages = ["подключи к комнате 33"] 
        answers = [{
            "speech": "Подключил к группе",
            "intentName": "ConnectedToRoom",
            "parameters": {
                "Connected": "Подключи",
                "Room": "Комната",
                "room_id": "33"
            }
        }]

        for i in range(len(messages)):
            answer = self.df.sendMessage(messages[i])
            with self.subTest():
                self.assertEqual(answer, answers[i])
        

if __name__ == "__main__":
    unittest.main()