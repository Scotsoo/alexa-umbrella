const https = require('http');
const request = require('request');
const city = 'manchester'.toLowerCase()
const countryCode = 'GB'.toLowerCase()
//http://api.openweathermap.org/data/2.5/forecast?q=Manchester,gb&appid=e2b38bff7e9ea81cb061b98eb9abf94f
//http://api.openweathermap.org/data/2.5/forecast?q=manchester,gb?appid=e2b38bff7e9ea81cb061b98eb9abf94f
const requestOptions = {
    host: 'api.openweathermap.org',
    port: 80,
    path: `/data/2.5/forecast?q=${city},${countryCode}&appid=e2b38bff7e9ea81cb061b98eb9abf94f`,
    method: 'GET'
}

console.log('logging city and country: ', city, countryCode);
console.log('requestOptions', requestOptions)
request(`http://${requestOptions.host}${requestOptions.path}`, (err, response, body) => {
	console.log(err)
	console.log(response)
	console.log(body)
	var data = JSON.parse(body);
	console.log(data.list.length)
	const willRain = [data.list[0].weather.some(m => m.main === "Rain")]
	willRain.push(data.list[1].weather.some(m => m.main === "Rain"))
	console.log(willRain.length)
})
// https.get(requestOptions, (response) => {
//     response.on('data', (data) => {
//         data = data.toString('utf-8')
//         data = JSON.parse(data)
//         const items = data.list.filter(l => l.weather.some(m => m.main === "Rain"))
//         console.log(items);
//         // let responseJson = JSON.parse(data);
//         //let type = response.weather[0].main;
//         //self.emit(":tell", "Looks like there is " + type);
        
//         // const deviceAddressResponse = {
//         //     statusCode: response.statusCode,
//         //     address: responsePayloadObject
//         // };
//         Promise.resolve(data)
//     });
// }).on('error', (e) => {
//     console.log("BAD ERROR!!", e)
//     //self.emit(":tell", "Something went wrong Jack!");
//     Promise.reject(e);
// });