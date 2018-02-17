class MessageParser {

    static parseMessage(message){
        if (typeof message !== "object"){
            throw "is not object";
        }
        if (typeof message.body === 'string' && message.attachments === false){
            return {
                text : message.body,
                type : 'text',
                messageObject: message
            }
        }
        if (message.body === "" && message.attachments[0].doc.title === "voice_message.webm"){
            return {
                audio : message.attachments[0].doc.preview.audio_msg.link_mp3,
                type : 'audio',
                messageObject: message
            }
        }
    }
}

module.exports = MessageParser