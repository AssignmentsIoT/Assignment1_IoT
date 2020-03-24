var mqtt = require('mqtt');                 //Library required to use MQTT protocol

const environmentalStation_ID = "ES-1";

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
    Value: dataInitialization(minTemperature, maxTemperature)
};
console.log('First temperature: %s', data_temperature);
var data_humidity = {
    Value: dataInitialization(minHumidity, maxHumidity)
};
var data_windDirection = {
    Value: dataInitialization(minWindDirection, maxWindDirection)
};
var data_windIntensity = {
    Value: dataInitialization(minWindIntensity, maxWindIntensity)
};
var data_rainHeight = {
    Value: dataInitialization(minRainHeight, maxRainHeight)
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
var client_rainHeight = mqtt.connect('mqtt://'+thingsboardHost, {username: accessToken_rainHeight});

//Triggers when client is successfully connected to the Thingsboard host and device access token
client_temperature.on('connect', function(){
    sendData('temperature', data_temperature, client_temperature, minTemperature, maxTemperature);
});

client_humidity.on('connect', function(){
    sendData('humidity', data_humidity,  client_humidity, minHumidity, maxHumidity);
});

client_windDirection.on('connect', function(){
    sendData('wind direction', data_windDirection, client_windDirection, minWindDirection, maxWindDirection);
});

client_windIntensity.on('connect', function(){
    sendData('wind intensity', data_windIntensity, client_windIntensity, minWindIntensity, maxWindIntensity);
});

client_rainHeight.on('connect', function(){
    sendData('rain height', data_rainHeight, client_rainHeight, minRainHeight, maxRainHeight);
});

//Initializes data with random values at the beginning
function dataInitialization(min, max){
    var Value = min + (max - min) * Math.random();
    return Value;
}

//Sends the data associated to a device (environmental station ID and latest telemetry) through MQTT channel
function sendData(deviceType, data, client, min, max){
    console.log('Client connected! [%s]', deviceType);
    //Uploads enviromental station ID as device attribute using 'v1/devices/me/attributes' MQTT topic
    client.publish('v1/devices/me/attributes', JSON.stringify({"Environmental Station ID":environmentalStation_ID}));
    //Schedules telemetry data upload once every 10 seconds
    console.log('Uploading %s data once every 10 seconds...', deviceType);
    setInterval(publishTelemetry, 10000, data, client, min, max);
}

//Uploads telemetry data using 'v1/devices/me/telemetry' MQTT topic
function publishTelemetry(data, client, min, max){
    data.Value = getNextValue(data.Value, min, max);
    client.publish('v1/devices/me/telemetry', JSON.stringify(data));
    console.log(JSON.stringify(data));
    console.log('Things published');
}

//Generates new random Value that is within 3% range from previous Value
function getNextValue(prevValue, min, max) {
    var Value = prevValue + ((max - min) * (Math.random() - 0.5)) * 0.03;
    Value = Math.max(min, Math.min(max, Value));
    return Math.round(Value * 10) / 10;
}

//Catches ctrl+c event
process.on('SIGINT', function(){
    console.log();
    console.log('Disconnecting...');
    client_temperature.end();
    client_humidity.end();
    client_windDirection.end();
    client_windIntensity.end();
    client_rainHeight.end();
    console.log('Exited!');
    process.exit(2);
});

//Catches uncaught exceptions
process.on('uncaughtException', function(e){
    console.log('Uncaught Exception...');
    console.log(e.stack);
    process.exit(99);
});