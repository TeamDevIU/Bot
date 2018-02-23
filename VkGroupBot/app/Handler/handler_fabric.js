const TextMessageHandler = require('./text_message_handler');
const AudioMessageHandler = require('./audio_message_handler');
const MessageParser = require('./message_parser');

module.exports = class HandlerFabric {
    static get(message){
        let type = MessageParser.parseMessage(message);
        switch (type) {
            case 'text' : {
                return new TextMessageHandler(message);
            }
            case 'audio' : {
                return new AudioMessageHandler(message);
            }
            default : {
                throw "no handler";
            }
        }
    }
};