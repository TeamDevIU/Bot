# -*- coding: utf-8 -*-
"""Модуль для взаимодействия с главным сервером
"""

import requests
import logging

class MainServer():
    """Класс для взаимодействия с главным сервером приложения
    """

    def __init__(self, host):
        """Конструктор класса
        
        :param host: адрес сервера

        """

        self.host = host
        self.logger = logging.getLogger("TgBot.mainServer")
    

    def sendRequest(self, intentName, message, parameters):
        """Метод для отправки запроса на сервер.
           На основании значения intentName принимается решение,
           какой запрос отправлять.
        
        :param intentName: имя интента, полученноe из Dialog Flow
        :param message: сообщение пользователя (telebot.types.Message)
        :param parameters: данные для запроса

        :return: результат запроса(True/False), 
            признак дополнения сообщения, сообщение

        """

        if intentName == "CreateRoom":
            return self.createRoom(message)

        elif intentName == "DeleteRoom":
            return True, None, "Данная функция пока не поддерживается"

        elif intentName == "SendMessage":
            return self.sendMessage(message, parameters['room_id'],
                                     parameters['user_message'])

        elif intentName == "ConnectedToRoom":
            return self.subscribe(message, parameters['room_id'])

        elif intentName == "Unsubscription":
            return True, None, "Данная функция пока не поддерживается"

        elif intentName == "SetPrivilege":
            return True, None, "Данная функция пока не поддерживется"

        elif intentName == "RoomsListAdmin":
            return self.getRoomsList(message, "admin")

        elif intentName == "RoomsListReader":
            return self.getRoomsList(message, "reader")

        elif intentName == "RoomsListModerator":
            return True, None, "Данная функция пока не поддерживется"

        elif intentName == "RoomInfo":
            return self.getRoomInfo(message, parameters['room_id'])

        else:
            return False, False, ""

        
    def createRoom(self, message):
        """Запрос на создание комнаты
        
        :param message: сообщение пользователя (telebot.types.Message)

        :return: результат запроса(True/False), 
            признак дополнения сообщения, сообщение

        """
        
        url = self.host + "/createRoom"
        data = {
            "room_name": message.from_user.username + " room",
            "owner_info": {
                "id": message.from_user.id,
                "name": message.from_user.username,
                "type": "tg"
            }
        }

        try:
            response = requests.post(url, json=data)
        except BaseException as e:
            self.logger.error("Exception in CreateRoom method:\n{}".format(e))
            return True, None, "Не удалось создать комнату :("

        res = response.json()
        if res["room_id"] == -1:
            self.logger.error("Can't create room.\nError message from server: {}".
                        format(res["error"]))
            return True, None, "Не удалось создать комнату :("

        self.logger.debug("Response from main server:\n{}".format(res))

        return False, True, " c id: " + str(res["room_id"])

    def getRoomsList(self, message, role):
        """Запрос на получение списка комнат
        
        :param message: сообщение пользователя (telebot.types.Message)
        :param role: роль пользователя в группе (админ, читатель, модератор)

        :return: результат запроса(True/False), 
            признак дополнения сообщения, сообщение

        """

        url = self.host + "/rooms"
        parameters = {
                "role": role,
                "userID": message.from_user.id,
                "botType": "tg"
            }

        try:
            response = requests.get(url, params=parameters)
        except BaseException as e:
            self.logger.error("Exception in getRoomsList method:\n{}".format(e))
            return True, None, "Не удалось получить список групп :("

        res = response.json()
        if res['error'] != "none":
            self.logger.error("Can't get rooms list.\nError message from server: {}".
                        format(res["error"]))
            return True, None, "Не удалось получить список групп :("

        self.logger.debug("Response from main server:\n{}".format(res))
        rooms = res['rooms']
        text = "\n"
        if len(rooms) == 0:
            text += "-"
        else:
            for room in rooms:
                text += room['name'] + " id: " + str(room['id']) + "\n"

        return False, True, text

    def subscribe(self, message, roomId):
        """Запрос на подписку в группу
        
        :param message: сообщение пользователя (telebot.types.Message)
        :param roomId: id группы

        :return: результат запроса(True/False), 
            признак дополнения сообщения, сообщение

        """

        if not roomId:
            return False, False, ""
        
        url = self.host + "/subscribe"
        data = {
            "room_id": int(roomId),
            "user_info": {
                "id": message.from_user.id,
                "name": message.from_user.username,
                "type": "tg"
            }
        }

        try:
            response = requests.post(url, json=data)
        except BaseException as e:
            self.logger.error("Exception in Subscribe method:\n{}".format(e))
            return True, None, "Не удалось добавить в группу :("

        res = response.json()
        if res["error"] != "none":
            self.logger.error("Can't subscribe.\nError message from server: {}".
                        format(res["error"]))
            return True, None, "Не удалось добавить в группу :(\n" + \
                    "Возможно, ты ее админ."

        self.logger.debug("Response from main server:\n{}".format(res))

        return False, False, ""

    def sendMessage(self, message, roomId, text):
        """Запрос на отправку сообщения в группу
        
        :param message: сообщение пользователя (telebot.types.Message)
        :param roomId: id группы
        :param text: текст для рассылки членам группы

        :return: результат запроса(True/False), 
            признак дополнения сообщения, сообщение

        """

        if not roomId or not text:
            return False, False, ""


        url = self.host + "/sendMessage"
        data = {
            "room_id": int(roomId),
            "message": text,
            "sender_info": {
                "id": message.from_user.id,
                "name": message.from_user.username,
                "type": "tg"
            }
        }

        try:
            response = requests.post(url, json=data)
        except BaseException as e:
            self.logger.error("Exception in Subscribe method:\n{}".format(e))
            return True, None, "Не удалось отправить сообщение в группу :("

        res = response.json()
        if res["error"] != "none":
            self.logger.error("Can't send message.\nError message from server: {}".
                        format(res["error"]))
            return True, None, "Не удалось отправить сообщение в группу :("

        self.logger.debug("Response from main server:\n{}".format(res))

        return False, False, ""

    def getRoomInfo(self, message, roomId):
        """Запрос на получение списка комнат
        
        :param message: сообщение пользователя (telebot.types.Message)
        :param roomId: id группы

        :return: результат запроса(True/False), 
            признак дополнения сообщения, сооsщение

        """

        if not roomId:
            return False, False, ""
            
        url = self.host + "/roomInfo"
        parameters = {
                "id": int(roomId),
            }

        try:
            response = requests.get(url, params=parameters)
        except BaseException as e:
            self.logger.error("Exception in getRoomInfo method:\n{}".format(e))
            return True, None, "Не удалось получить информацию о группе :("

        res = response.json()
        if res['error'] != "none":
            self.logger.error("Can't get room info.\nError message from server: {}".
                        format(res["error"]))
            return True, None, "Не удалось получить информацию о группе :("

        self.logger.debug("Response from main server:\n{}".format(res))

        text = "\nНазвание комнаты: " + res['room_name']
        text += "\nАдминистратор: " + res['admin']['name'] + " (" + \
            res['admin']['type'] + ")"

        moderators = res['moderators']
        if moderators:
            text += "\n\nМодераторы: " + str(len(moderators))
            for moderator in moderators:
                text += "\n" + moderator['name'] + " (" + \
                    moderator['type'] + ")"

        readers = res['reader']
        if readers:
            text += "\n\nЧитатели: " + str(len(readers))
            for reader in readers:
                text += "\n" + reader['name'] + " (" + \
                    reader['type'] + ")"
        
        return False, True, text