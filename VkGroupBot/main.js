const MessageParser = require('./message_parser');
const TextMessageHandler = require('./text_message_handler');
const AudioMessageHandler = require('./audio_message_handler');
let apiai = require('apiai');
let dialogflow = apiai(process.env.DIALOGFLOW_CLIENT_ID);
const VK = require('vk-node-sdk');
const Group = new VK.Group(process.env.VKTOKEN);

Group.onMessage((message) => {
    message.setTyping();
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
        m.messageObject.addText(response.result.fulfillment.speech).send();
    }, async function (error) {
        m.messageObject.addText('у меня ошибки какие-то: '+ JSON.stringify(error)).send()
    })
});