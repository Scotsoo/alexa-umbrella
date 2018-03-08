const AlexaDeviceAddressClient = require('./AlexaDeviceAddressClient');
const Messages = require('./Messages');
const request = require('request');

const getWeather = function(addressData, next) {
    const { city, countryCode } = addressData;
    if (!city || !countryCode ) {
        next(emitErr(":tell", Messages.ADDRESS_NOT_COMPLETE));
        return;
    }
    const requestOptions = {
        host: 'api.openweathermap.org',
        port: 443,
        path: `/data/2.5/forecast?q=${city},${countryCode}&appid=e2b38bff7e9ea81cb061b98eb9abf94f`,
        method: 'GET',
    }
    request(`http://${requestOptions.host}${requestOptions.path}`, (err, response, body) => {
        if(err) {
            console.log("[ERR] - WEATHER API : data " + JSON.stringify(err))
            return next(emitErr(':tell', Messages.API_ERROR));   
        }
        var data = JSON.parse(body);
        if (data.cod != 200){
            console.log("[ERR] - WEATHER API : data " + JSON.stringify(data));
            return next(emitErr(':tell', Messages.API_ERROR));   
        }
        next(null, data);
    })
}
const getAddress = function(alexaContext, next) {
    console.log('Getting address')
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
                // This likely means that the user didn't have their address set via the companion app.
                console.log("Successfully requested from the device address API, but no address was returned.");
                next(emitErr(":tell", Messages.NO_ADDRESS));
                break;
            case 403:
                console.log("The consent token we had wasn't authorized to access the user's address.");
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
    if(err.type === 'emit') {
        alexaContext.emit(err.event, err.message, err.extra);
        return true;
    }
    console.log(`[ERR] - errorHandler - err: ${JSON.stringify(err)}`);
    alexaContext.emit(":tell", Messages.ERROR)
    return true;
}
const weatherIntentBase = (alexaContext, next) => {
    getAddress(alexaContext, (err, address) => {
        console.log("Got address - ", JSON.stringify(address));
        if(errorHandler(err, alexaContext)){
            return next(err);
        }
        console.log('past error')
        getWeather(address, (err, data) => {
            console.log('got wweather')
            if(errorHandler(err, alexaContext)){
                return next(err);
            }
            console.log('returning')
            
            next(null, {data, address}) 
        })
    });
}
const umbrellaIntent = (alexaContext) => {
    return weatherIntentBase(alexaContext, (err, {data, address}) => {
        if(err){
            return;
        }
        console.log('got data and processing')
        let lenToTake = 3;
        lenToTake = data.list.length > lenToTake ? lenToTake : data.list.length; 
        const newData = data.list.slice(1,lenToTake);
        const willRain = newData.some(l => l.weather.some(m => m.main === "Rain")).length > 0;
        if(willRain) {
            console.log('it will rain')
            alexaContext.emit(":tell", `Looks like a wet one in ${address.city}! You should probably take an umbrella.`); 
            return; 
        } else {
            console.log('it wont rain')
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