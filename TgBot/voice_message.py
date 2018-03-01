# -*- coding: utf-8 -*-
"""Модуль для обработки голосового сообщения Telegram

:author: Melnikov Dmitry
"""

import os
import xml.etree.ElementTree as XmlElementTree
import httplib2
import uuid

YANDEX_ASR_HOST = 'asr.yandex.net'
YANDEX_ASR_PATH = '/asr_xml'


def voiceToText(voiceBytes):
    """ Функция преобразования голосового сообщения в текст

    :param voiceBytes: голосовое сообщение в виде набора байтов 

    :return: текст сообщения
    
    :rtype: string

    :raise: SpeechException

    """

    url = YANDEX_ASR_PATH + '?uuid={0}&key={1}&topic={2}&lang={3}'.format(
        uuid.uuid4().hex,
        os.environ['YANDEX_SPEECH_TOKEN'],
        'notes',
        'ru-RU'
    )

    connection = httplib2.HTTPConnectionWithTimeout(YANDEX_ASR_HOST)
    connection.connect()
    connection.putrequest('POST', url)
    connection.putheader('Content-Length', str(len(voiceBytes)))
    connection.putheader('Content-Type', 'audio/ogg;codecs=opus')
    connection.endheaders()
    connection.send(voiceBytes)
    response = connection.getresponse()

    if response.code == 200:
        responseText = response.read()
        xml = XmlElementTree.fromstring(responseText)
        
        if int(xml.attrib['success']) == 1:
            maxConf = - float("inf")
            text = ""

            for child in xml:
                if float(child.attrib['confidence']) > maxConf:
                    text = child.text
                    maxConf = float(child.attrib['confidence'])

            if maxConf != - float("inf"):
                return text
            else:
                raise SpeechException("No text found.\nResponse: {0}".format(responseText))
        else:
            raise SpeechException("No text found.\nResponse: {0}".format(responseText))
    else:
        raise SpeechException("Unknown error.\nCode: {0}\n{1}".format(
            response.code, response.read()
        ))


class SpeechException(Exception):
    """ 
    Класс исключений, возникающих при обработке голосового сообщения
    """
    pass