const BaseHandler = require('./base_handler');
let https = require('https');
let fs = require('fs');
let SpeechTranslator = require('./speech_translator');

class AudioMessageHandler extends BaseHandler{
    constructor (message,dialogflow){
        super();
        if(typeof message !== "object"){
            throw "is not object";
        }

        this.message = message;
        this.dialogflow = dialogflow;
    }


    execute(sessionId,responseFunc,errorFunc) {
        super.execute(sessionId);
        let df = this.dialogflow;
        let speechTranslator = new SpeechTranslator(process.env.YANDEX_DEV_KEY);
        let request = https.get(this.message.audio, (res) => {
            res.pipe(speechTranslator.translate(function (res) {
                let req = df.textRequest(res,{
                    sessionId: sessionId
                });

                req.on('response',responseFunc);
                req.on('error',errorFunc);
                req.end();
            }), function (err) {

                console.log("Ошибка распознования аудио");
                errorFunc(err);
            });
        }).on('error', (e) => {
            console.log("Ошибка получения аудио");
            errorFunc(e);
        });

    }
}

module.exports = AudioMessageHandler;