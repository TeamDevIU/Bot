let xml2json = require('xml2json');
let yandex_speech = require('yandex-speech');

class SpeechTranslator {
    constructor(developer_key){
        this.dev_key = developer_key;
    };

    translate(onResponse, onError){
        return yandex_speech.ASR({
            developer_key: this.dev_key,
            debug: true,
            topic: 'queries'
        }, function (err, httpResponse, xml) {
            if (err) {
                console.log("Ошибка ASR")
                onError(err);
            } else {
                let json = JSON.parse(xml2json.toJson(xml));
                let success = Number.parseInt(json.recognitionResults.success);
                if(success > 0){
                    if(Array.isArray(json.recognitionResults.variant)){
                        onResponse(json.recognitionResults.variant[0].$t);
                    } else {
                        onResponse(json.recognitionResults.variant.$t);
                    }
                } else {
                    console.log("не распознал")
                    onResponse("")
                }
            }
        })
    }
}

module.exports = SpeechTranslator;