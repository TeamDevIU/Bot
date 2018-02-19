class UserCommandHandler {
    static calculate(req, message, Group) {
        let intent_name = req.result.metadata.intentName;
        let text = req.result.fulfillment.speech;
        switch (intent_name) {
            case "CreateRoom": {
                break;
            }
            case "DeleteRoom": {
                break;
            }
            case "SendMessage": {
                let input_message = req.result.parameters.any
                if(input_message.replace(/\s+/g, '') === ""){
                    break
                }
                text = text+"  ("+input_message+") "
                break;
            }
            case "ConnectedToRoom": {
                let input_message = req.result.parameters.any;
                if(input_message.replace(/\s+/g, '') === ""){
                    break;
                }
                text = text+"  ("+input_message+") "
                break;
            }
            case "Unsubscription": {
                let input_message = req.result.parameters.any;
                if(input_message.replace(/\s+/g, '') === ""){
                    break
                }
                text = text+"  ("+input_message+") "
                break;
            }
            case "SetPrivilege": {
                let input_message = req.result.parameters.any;
                if(input_message.replace(/\s+/g, '') === ""){
                    break
                }
                text = text+"  ("+input_message+") "
                break;
            }
            case "SetPrivilegeWithQuestion": {
                let input_message = req.result.parameters.any;
                if(input_message.replace(/\s+/g, '') === ""){
                    break
                }
                text = text+"  ("+input_message+") "
                break;
            }
            case "UnsubscriptionWithQuestion": {
                let input_message = req.result.parameters.any;
                if(input_message.replace(/\s+/g, '') === ""){
                    break
                }
                text = text+"  ("+input_message+") "
                break;
            }
            case "SendMessageWithQuestion": {
                let input_message = req.result.parameters.any;
                if(input_message.replace(/\s+/g, '') === ""){
                    break
                }
                text = text+"  ("+input_message+") "
                break;
            }
            case "ConnectedToRoomWithQuestion": {
                let input_message = req.result.parameters.any;
                if(input_message.replace(/\s+/g, '') === ""){
                    break
                }
                text = text+"  ("+input_message+") "
                break;
            }
            default: {
                break;
            }
        }

        return text;
    };
}

module.exports = UserCommandHandler;