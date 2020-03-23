var mqtt = require('mqtt');                 //Library required to use MQTT protocol

const environmentalStation_ID = "SE1";

const thingsboardHost = "demo.thingsboard.io";          //Server of ThingsBoard 

const accessToken_temperature = "LuzNyU3GMUx5wjOGgRsK";         //Access token of the temperature sensor we're simulating 
const accessToken_humidity = "AO0xdeod7Rb9iG4PWWRf";            //Access token of the humidity sensor we're simulating
const accessToken_windDirection = "1LX2hYd7jFJzMgnIiCtv";       //Access token of the wind direction sensor sensor we're simulating
const accessToken_windIntensity = "yJI4iC83pIAj6zCGNaVT";       //Access token of the wind intensity sensor sensor we're simulating
const accessToken_rainHeight = "5l4srhQKSd7SHsnL2DhK";          //Access token of the rain height sensor sensor we're simulating

const minTemperature = - 50;        // Celsius
const maxTemperature = 50;

const minHumidity = 0;              // % 
const maxHumidity = 100;

const minWindDirection = 0;         // Degrees
const maxWindDirection = 360;

const minWindIntensity = 0;         // m/s
const maxWindIntensity = 100;

const minRainHeight = 0;            // nm/h
const maxRainHeight = 50;

//Initialization of data with random vaue
var data_temperature = {
    temperature: minTemperature + (maxTemperature - minTemperature) * Math.random()
};
console.log('First temperature: %s', data_temperature);
var data_humidity = {
    humidity: minHumidity + (maxHumidity - minHumidity) * Math.random()
};
var data_windDirection = {
    windDirection: minWindDirection + (maxWindDirection - minWindDirection) * Math.random()
};
var data_windIntensity = {
    windIntensity: minWindIntensity + (maxWindIntensity - minWindIntensity) * Math.random()
};
var data_rainHeight = {
    rainHeight: minRainHeight + (maxRainHeight - minRainHeight) * Math.random()
};

//Initialization of MQTT clients using Thingsboard host and device access token
console.log('Connecting to: %s using temperature access token %s', thingsboardHost, accessToken_temperature);
var client_temperature = mqtt.connect('mqtt://'+thingsboardHost, {username: accessToken_temperature});

console.log('Connecting to: %s using humidity access token %s', thingsboardHost, accessToken_humidity);
var client_humidity = mqtt.connect('mqtt://'+thingsboardHost, {username: accessToken_humidity});

console.log('Connecting to: %s using wind direction access token %s', thingsboardHost, accessToken_windDirection);
var client_windDirection = mqtt.connect('mqtt://'+thingsboardHost, {username: accessToken_windDirection});

console.log('Connecting to: %s using wind intensity access token %s', thingsboardHost, accessToken_windIntensity);
var client_windIntensity = mqtt.connect('mqtt://'+thingsboardHost, {username: accessToken_windIntensity});

console.log('Connecting to: %s using rain height access token %s', thingsboardHost, accessToken_rainHeight);
var client_rain_height = mqtt.connect('mqtt://'+thingsboardHost, {username: accessToken_rainHeight});

//Triggers when client is successfully connected to the Thingsboard host and device access token
client_temperature.on('connect', function(){
    console.log('Client connected! [Temperature]');
    //Uploads enviromental station ID as device attribute using 'v1/devices/me/attributes' MQTT topic
    client_temperature.publish('v1/devices/me/attributes', JSON.stringify({"Environmental Station ID":environmentalStation_ID}));
    //Schedules telemetry data upload once every 10 seconds
    console.log('Uploading temperature data once every 10 seconds...');
    setInterval(publishTelemetry, 10000);
});

client_humidity.on('connect', function(){
    console.log('Client connected! [Humidity]');
    //Uploads enviromental station ID as device attribute using 'v1/devices/me/attributes' MQTT topic
    client_humidity.publish('v1/devices/me/attributes', JSON.stringify({"Environmental Station ID":environmentalStation_ID}));
    //Schedules telemetry data upload once every 10 seconds
    console.log('Uploading humidity data once every 10 seconds...');
    setInterval(publishTelemetry, 10000);
});

client_windDirection.on('connect', function(){
    console.log('Client connected! [Wind Direction]');
    //Uploads enviromental station ID as device attribute using 'v1/devices/me/attributes' MQTT topic
    client_windDirection.publish('v1/devices/me/attributes', JSON.stringify({"Environmental Station ID":environmentalStation_ID}));
    //Schedules telemetry data upload once every 10 seconds
    console.log('Uploading wind direction data once every 10 seconds...');
    setInterval(publishTelemetry, 10000);
});

client_windIntensity.on('connect', function(){
    console.log('Client connected! [Wind Intensity]');
    //Uploads enviromental station ID as device attribute using 'v1/devices/me/attributes' MQTT topic
    client_windIntensity.publish('v1/devices/me/attributes', JSON.stringify({"Environmental Station ID":environmentalStation_ID}));
    //Schedules telemetry data upload once every 10 seconds
    console.log('Uploading wind intensity data once every 10 seconds...');
    setInterval(publishTelemetry, 10000);
});

client_rain_height.on('connect', function(){
    console.log('Client connected! [Rain Height]');
    //Uploads enviromental station ID as device attribute using 'v1/devices/me/attributes' MQTT topic
    client_rain_height.publish('v1/devices/me/attributes', JSON.stringify({"Environmental Station ID":environmentalStation_ID}));
    //Schedules telemetry data upload once every 10 seconds
    console.log('Uploading humidity data once every 10 seconds...');
    setInterval(publishTelemetry, 10000);
});

//Uploads telemetry data using 'v1/devices/me/telemetry' MQTT topic
function publishTelemetry(){

    data_temperature.temperature = getNextValue(data_temperature.temperature, minTemperature, maxTemperature);
    data_humidity.humidity = getNextValue(data_humidity.humidity, minHumidity, maxHumidity);
    data_windDirection.windDirection = getNextValue(data_windDirection.windDirection, minWindDirection, maxWindDirection);
    data_windIntensity.windIntensity = getNextValue(data_windIntensity.windIntensity, minWindIntensity, maxWindIntensity);
    data_rainHeight.rainHeight = getNextValue(data_rainHeight.rainHeight, minRainHeight, maxRainHeight);

    client_temperature.publish('v1/devices/me/telemetry', JSON.stringify(data_temperature));
    console.log(JSON.stringify(data_temperature));
    client_humidity.publish('v1/devices/me/telemetry', JSON.stringify(data_humidity));
    client_windDirection.publish('v1/devices/me/telemetry', JSON.stringify(data_windDirection));
    client_windIntensity.publish('v1/devices/me/telemetry', JSON.stringify(data_windIntensity));
    client_rain_height.publish('v1/devices/me/telemetry', JSON.stringify(data_rainHeight));
    console.log('Things published');
}

//Generates new random value that is within 3% range from previous value
function getNextValue(prevValue, min, max) {
    var value = prevValue + ((max - min) * (Math.random() - 0.5)) * 0.03;
    value = Math.max(min, Math.min(max, value));
    return Math.round(value * 10) / 10;
}

//Catches ctrl+c event
process.on('SIGINT', function(){
    console.log();
    console.log('Disconnecting...');
    client_temperature.end();
    client_humidity.end();
    client_windDirection.end();
    client_windIntensity.end();
    client_rain_height.end();
    console.log('Exited!');
    process.exit(2);
});

//Catches uncaught exceptions
process.on('uncaughtException', function(e){
    console.log('Uncaught Exception...');
    console.log(e.stack);
    process.exit(99);
});