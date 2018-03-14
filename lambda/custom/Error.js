const messages = require('./Messages');
const codes = {
    API_ERROR: new WeatherError(0, messages.API_ERROR)
}
function WeatherError(code, message){
    return {code, message};
}

module.exports = codes;
