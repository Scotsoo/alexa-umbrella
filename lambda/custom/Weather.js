const request = require('request');
const errors = require('./Error');
const endpoints = {
    fiveDay: 'forecast',
    now: 'weather'
}

function getWeather ({city, countryCode, endpoint}, next) {
    const requestOptions = {
        host: 'api.openweathermap.org',
        port: 443,
        path: `/data/2.5/${endpoint}?q=${city},${countryCode}&appid=${process.env.WEATHER_API_KEY}`,
        method: 'GET',
    }
    request(`http://${requestOptions.host}${requestOptions.path}`, (err, response, body) => {
        if(err) {
            console.log("[ERR] - WEATHER API : data " + JSON.stringify(err))
            return next(errors.API_ERROR);
        }
        var data = JSON.parse(body);
        if (data.cod != 200){
            console.log("[ERR] - WEATHER API : data " + JSON.stringify(data));
            return next({message: 'THERE WAS AN API ERROR'});
        }
        next(null, data);
    })
}

const weather = {
    fiveDay: ({city, countryCode}, next) => {
        getWeather({city, countryCode, endpoint: endpoints.fiveDay}, next);
    },
    now: ({city, countryCode}, next) => {
        getWeather({city, countryCode, endpoint: endpoints.now}, next);
    }
}

module.exports = weather
