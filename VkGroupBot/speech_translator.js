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
                onError(err);
            } else {
                let json = JSON.parse(xml2json.toJson(xml));
                let success = Number.parseInt(json.recognitionResults.success);
                if(success > 0){
                    if(success === 1){
                        onResponse(json.recognitionResults.variant.$t);
                    } else {
                        let max_variant;
                        max_variant.confidence = 0;
                        for (let variant in json.recognitionResults.variant){
                            if(variant.confidence > max_variant.confidence){
                                max_variant = variant;
                            }
                        }
                        onResponse(max_variant.$t);
                    }

                } else {
                    onResponse("")
                }
            }
        })
    }
}

module.exports = SpeechTranslator;