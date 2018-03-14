const AlexaDeviceAddressClient = require('./AlexaDeviceAddressClient');
const Messages = require('./Messages');
const request = require('request');
const weather = require('./Weather');
const errors = require('./Error');
const async = require('async');

const getWeather = function({city, countryCode}, next) {
    if (!city || !countryCode ) {
        next(emitErr(":tell", Messages.ADDRESS_NOT_COMPLETE));
        return;
    }
    weather.now({city, countryCode}, (err, data) => {
        if(err) {
            return next(emitErr(':tell', err.message));
        }
        next(null, data);
    })
}
const getHourWeather = function({city, countryCode}, next) {
    if (!city || !countryCode ) {
        next(emitErr(":tell", Messages.ADDRESS_NOT_COMPLETE));
        return;
    }
    weather.fiveDay({city, countryCode}, (err, data) => {
        if(err) {
            return next(emitErr(':tell', err.message));
        }
        next(null, data);
    });
}
const getAddress = function(alexaContext, next) {
    const consentToken = alexaContext.event.context.System.user.permissions ? alexaContext.event.context.System.user.permissions.consentToken : null;
    if(!consentToken) {
        alexaContext.emit(":tellWithPermissionCard", Messages.NOTIFY_MISSING_PERMISSIONS, PERMISSIONS);
        return;
    }
    const deviceId = alexaContext.event.context.System.device.deviceId;
    const apiEndpoint = alexaContext.event.context.System.apiEndpoint;

    const alexaDeviceAddressClient = new AlexaDeviceAddressClient(apiEndpoint, deviceId, consentToken);
    let deviceAddressRequest = alexaDeviceAddressClient.getFullAddress();
    deviceAddressRequest.then((addressResponse) => {
        switch(addressResponse.statusCode) {
            case 200:
                const address = addressResponse.address;
                next(null, address)
                break;
            case 204:
                next(emitErr(":tell", Messages.NO_ADDRESS));
                break;
            case 403:
                next(emitErr(":tellWithPermissionCard", Messages.NOTIFY_MISSING_PERMISSIONS, PERMISSIONS));
                break;
            default:
                next(emitErr(":ask", Messages.LOCATION_FAILURE, Messages.LOCATION_FAILURE))
                break;
        }
    });

    deviceAddressRequest.catch((error) => {
        console.error(error);
        next(emitErr(":tell", Messages.ERROR));
    });
}
const emitErr = (event, message, extra) =>{
    return {
        event,
        message,
        extra,
        type: 'emit'
    }
}
const errorHandler = (err, alexaContext) => {
    if(!err){
        return false;
    }
    console.log(`[ERR] - errorHandler - err: ${JSON.stringify(err)}`);
    if(err.type === 'emit') {
        alexaContext.emit(err.event, err.message, err.extra);
        return true;
    }
    alexaContext.emit(":tell", Messages.ERROR)
    return true;
}
const weatherIntentBase = (alexaContext, next) => {
    async.autoInject({
        address: cb => getAddress(alexaContext, cb),
        current: (address, cb) => getWeather(address, cb),
        hour: (address, cb) => getHourWeather(address, cb)
    }, (err, data) => {
        if(errorHandler(err, alexaContext)){
            return next(err);
        }
        next(null, data);
    });
}
function determineRain(weatherData) {
    let lenToTake = 3;
    const rainTypes = [2,3,5];
    if (weatherData.list) {
        lenToTake = weatherData.list.length > lenToTake ? lenToTake : weatherData.list.length;
        const newData = weatherData.list.slice(1, lenToTake);
        return newData.some(l => l.weather.some(m => rainTypes.some(r => m.id[0]===r)));
    } else {
        lenToTake = weatherData.weather.length > lenToTake ? lenToTake : weatherData.weather.length;
        const newData = weatherData.weather.slice(1, lenToTake);
        return newData.some(l => l.some(m => rainTypes.some(r => m.id[0]===r)));
    }
}
const umbrellaIntent = (alexaContext) => {
    return weatherIntentBase(alexaContext, (err, {hour, current, address}) => {
        if(err){
            return;
        }
        const willRain = determineRain(hour) || determineRain(current);
        if(willRain) {
            alexaContext.emit(":tell", `Looks like a wet one in ${address.city}! You should probably take an umbrella.`);
            return;
        } else {
            alexaContext.emit(":tell", `It doesn't look like it's going to rain in ${address.city}. You can leave the umbrella at home today!.`);
            return;
        }
    })
}
const jacketIntent = (alexaContext) => {
    return weatherIntentBase(alexaContext, (data) => {

    })
}

module.exports = {
    umbrellaIntent,
    jacketIntent
}
