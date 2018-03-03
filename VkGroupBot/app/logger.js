const { createLogger, format, transports } = require('winston');
let instance;
module.exports = class Logger{
    static get(){
        if(!instance){
            instance = createLogger({
                level: 'info',
                format: format.combine(
                    format.timestamp(),
                    format.align(),
                    format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
                ),
                transports: [
                    new transports.File({ filename: 'error.log', level: 'error' }),
                    new transports.File({ filename: 'combined.log' })
                ]
            });
        }
        return instance;
    }
};