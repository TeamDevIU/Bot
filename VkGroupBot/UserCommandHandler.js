class UserCommandHandler {
    static calculate(req, vkbot) {
        let intent_name = req.result.metadata.intentName;
        let text = req.result.fulfillment.speech;
        switch (intent_name) {
            case "CreateRoom": {
                vkbot.addText(text).send();
                break;
            }
            case "DeleteRoom": {
                vkbot.addText(text).send();
                break;
            }
            case "SendMessage": {
                let input_message = req.result.parameters.any
                if(input_message.replace(/\s+/g, '') === ""){
                    vkbot.addText(text).send();
                    break
                }
                vkbot.addText(text+"  ("+input_message+") ").send();
                break;
            }
            case "ConnectedToRoom": {
                let input_message = req.result.parameters.any;
                if(input_message.replace(/\s+/g, '') === ""){
                    vkbot.addText(text).send();
                    break;
                }
                vkbot.addText(text+"  ("+input_message+") ").send();
                break;
            }
            case "Unsubscription": {
                let input_message = req.result.parameters.any;
                if(input_message.replace(/\s+/g, '') === ""){
                    vkbot.addText(text).send();
                    break
                }
                vkbot.addText(text+"  ("+input_message+") ").send();
                break;
            }
            case "SetPrivilege": {
                let input_message = req.result.parameters.any;
                if(input_message.replace(/\s+/g, '') === ""){
                    vkbot.addText(text).send();
                    break
                }
                vkbot.addText(text+"  ("+input_message+") ").send();
                break;
            }
            case "SetPrivilegeWithQuestion": {
                let input_message = req.result.parameters.any;
                if(input_message.replace(/\s+/g, '') === ""){
                    vkbot.addText(text).send();
                    break
                }
                vkbot.addText(text+"  ("+input_message+") ").send();
                break;
            }
            case "UnsubscriptionWithQuestion": {
                let input_message = req.result.parameters.any;
                if(input_message.replace(/\s+/g, '') === ""){
                    vkbot.addText(text).send();
                    break
                }
                vkbot.addText(text+"  ("+input_message+") ").send();
                break;
            }
            case "SendMessageWithQuestion": {
                let input_message = req.result.parameters.any;
                if(input_message.replace(/\s+/g, '') === ""){
                    vkbot.addText(text).send();
                    break
                }
                vkbot.addText(text+"  ("+input_message+") ").send();
                break;
            }
            case "ConnectedToRoomWithQuestion": {
                let input_message = req.result.parameters.any;
                if(input_message.replace(/\s+/g, '') === ""){
                    vkbot.addText(text).send();
                    break
                }
                vkbot.addText(text+"  ("+input_message+") ").send();
                break;
            }
            default: {
                vkbot.addText(text).send();
                break;
            }
        }
    };
}

module.exports = UserCommandHandler;