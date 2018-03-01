const BaseHandler = require('./base_handler');
let https = require('https');
let fs = require('fs');
let SpeechTranslator = require('../speech_translator');
const CONFIG = require(`../${process.env.CONFIG}`);

class AudioMessageHandler extends BaseHandler{
    constructor (message){
        super();
        if(typeof message !== "object"){
            throw "is not object";
        }
        this.audioUrl = message.attachments[0].doc.preview.audio_msg.link_mp3;
        if(!this.audioUrl && typeof message.attachments[0].doc.preview.audio_msg.link_mp3 !== 'string')
            throw "not find audio url";
    }

    execute(sessionId,responseFunc,errorFunc) {
        super.execute(sessionId);
        let df = this.dialogflow;
        let onTranslateAudio = (res) => {
            let req = df.textRequest(res,{
                sessionId: sessionId
            });
            req.on('response',responseFunc);
            req.on('error',errorFunc);
            req.end();
        };
        let onErrorTranslateAudio = (err) => {
            console.log("Ошибка распознования аудио");
            errorFunc("Ошибка распознования аудио, " + err);
        };

        let onDownloadAudio = (res) => {
            let speechTranslator = new SpeechTranslator(CONFIG.YANDEX_DEV_KEY);
            res.pipe(speechTranslator.translate(onTranslateAudio, onErrorTranslateAudio));
        };
        let onErrorDownloadAudio = (e) => {
            console.log("Ошибка получения аудио");
            errorFunc("Ошибка получения аудио" + e);
        };
        let request = https.get(this.audioUrl,onDownloadAudio).on('error', onErrorDownloadAudio);
    }
}

module.exports = AudioMessageHandler;