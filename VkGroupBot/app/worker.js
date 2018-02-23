const UserCommandHandler = require('./UserCommand/user_command_handler');
const HandlerFabric = require('./Handler/handler_fabric');
const VK = require('vk-node-sdk');
const apiai = require('apiai');
let dialogflow = apiai(process.env.DIALOGFLOW_CLIENT_ID);
/**
 * Функция обработки команды от пользователя
 * с последующей отправкой отвека  чат вк.
 * @module worker.js
 * @class onResponse
 * @constructor
 * @param {number} [user_id] id пользователя в вк.
 * @param {Object} [response] ответ от dialogflow.
 */
function onResponse(user_id,user_name,response) {
    UserCommandHandler.calculate(process,user_id,user_name,response);
}

/**
 * Функция обработки ошибки
 * с последующей отправкой ошибки в чат вк.
 * @module worker.js
 * @class onErrorMessage
 * @constructor
 * @param {number} [user_id] id пользователя в вк.
 * @param {text}  [error] ответ от dialogflow.
 */
function onErrorMessage(user_id,error) {
    console.log(error);
    let message = {
        user_id: user_id,
        message: 'у меня ошибки какие-то: '+ JSON.stringify(error)
    };
    process.send(message);
}

/**
 * Принимает сообщение от главного процесса.
 * Получает от HandlerFabric обработчик
 * согласно типу входящего сообщения, затем
 * вызывает его выполнение
 * @module worker.js
 * @class process.on
 * @param {callback} [listener]
 * @uses HandlerFabric
 *
 */
process.on('message', task => {
    //console.log(`${process.pid} get message: ${task.message.body}`);
    let message = task.message;
    let handler = HandlerFabric.get(message);
    handler.setDialogflow(dialogflow);
    let bindResponse = (response) => {
        return onResponse(message.user_id,message.user_name,response);
    };

    let bindError = (response) => {
        return onErrorMessage(message.user_id,response);
    };
    handler.execute(1234,bindResponse,bindError);
});