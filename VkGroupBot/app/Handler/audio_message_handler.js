const BaseHandler = require('./base_handler');
let https = require('https');
let fs = require('fs');
let SpeechTranslator = require('../speech_translator');
const CONFIG = require(`../${process.env.CONFIG}`);
const logger = require('../logger').get();

module.exports = class AudioMessageHandler extends BaseHandler{
    constructor (message){
        super();
        if(typeof message !== "object"){
            logger.error(`module: ${module} : is not object`);
            throw "is not object";
        }
        this.audioUrl = message.attachments[0].doc.preview.audio_msg.link_mp3;
        if(!this.audioUrl && typeof message.attachments[0].doc.preview.audio_msg.link_mp3 !== 'string') {
            logger.error(`module: ${module} : not find audio url in message ${message}`);
            throw "not find audio url";
        }
    }

    execute(sessionId,responseFunc,errorFunc) {
        super.execute(sessionId);
        let df = this.dialogflow;
        let audioUrl = this.audioUrl;
        let onTranslateAudio = (res) => {
            logger.info(`ya.speech translate ${audioUrl}`);
            let req = df.textRequest(res,{
                sessionId: sessionId
            });
            req.on('response',responseFunc);
            req.on('error',errorFunc);
            req.end();
        };
        let onErrorTranslateAudio = (err) => {
            logger.error(`module: ${module.id} : Ошибка распознования аудио : ${audioUrl}`);
            errorFunc("Ошибка распознования аудио, " + err);
        };

        let onDownloadAudio = (res) => {
            let speechTranslator = new SpeechTranslator(CONFIG.YANDEX_DEV_KEY);
            res.pipe(speechTranslator.translate(onTranslateAudio, onErrorTranslateAudio));
        };
        let onErrorDownloadAudio = (e) => {
            logger.error(`module: ${module.id} :Ошибка получения аудио : ${audioUrl}`);
            errorFunc("Ошибка получения аудио" + e);
        };
        let request = https.get(this.audioUrl,onDownloadAudio).on('error', onErrorDownloadAudio);
    }
};
