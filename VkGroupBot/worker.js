const MessageParser = require('./message_parser');
const TextMessageHandler = require('./text_message_handler');
const AudioMessageHandler = require('./audio_message_handler');
const UserCommandHandler = require('./user_command_handler');
const VK = require('vk-node-sdk');
const apiai = require('apiai');
let dialogflow = apiai(process.env.DIALOGFLOW_CLIENT_ID);


process.on('message', task => {
    //console.log(`${process.pid} get message: ${task.message.body}`);

    let message = task.message;

    let m = MessageParser.parseMessage(message);
    let handler;
    switch (m.type) {
        case 'text' : {
            handler = new TextMessageHandler(m,dialogflow);
            break;
        }
        case 'audio' : {
            handler = new AudioMessageHandler(m,dialogflow);
            break;
        }
    }
    handler.execute('1234',async function (response) {
        let text = UserCommandHandler.calculate(response,m);
        let message = {
            user_id: m.peer_id,
            message: text
        };
        process.send(message);
    }, async function (error) {
        group.sendMessage({
            user_id: m.peer_id,
            message: 'у меня ошибки какие-то: '+ JSON.stringify(error)
        });
    })
});