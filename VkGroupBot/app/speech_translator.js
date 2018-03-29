let xml2json = require('xml2json');
let yandex_speech = require('yandex-speech');

module.exports = class SpeechTranslator {
    constructor(developer_key){
        this.dev_key = developer_key;
    }

    _errorASR(err,onError){
        console.log("Ошибка ASR");
        onError("Ошибка ASR" + err);
    }

    _xmlResponseParser(xml,onResponse,onError){
        let json = JSON.parse(xml2json.toJson(xml));
        let success = Number.parseInt(json.recognitionResults.success);
        if(success > 0){
            if(Array.isArray(json.recognitionResults.variant)){
                onResponse(json.recognitionResults.variant[0].$t);
            } else {
                onResponse(json.recognitionResults.variant.$t);
            }
        } else {
            console.log("не распознал");
            onError("не распознал, попробуй повтори");
        }
    }

    translate(onResponse, onError){
        return yandex_speech.ASR({
            developer_key: this.dev_key,
            debug: true,
            topic: 'queries'
        },  (err, httpResponse, xml) => {
            if (err) {
                this._errorASR(err,onError);
            } else {
                this._xmlResponseParser(xml,onResponse,onError);
            }
        });
    }
};