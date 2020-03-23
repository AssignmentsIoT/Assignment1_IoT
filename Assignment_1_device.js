var mqtt = require('mqtt');

const thingsboardHost = "demo.thingsboard.io";
const accessToken = "UOHOaA085nxCNdrpbRUz";
const minTemperature = - 20;
const maxTemperature = 50;

//Initialization of temperature with random vaue
var data = {
    temperature: minTemperature + (maxTemperature - minTemperature) * Math.random()
};

//Initialization of MQTT client using Thingsboard host and device access token
console.log('Connecting to: %s using access token %s', thingsboardHost, accessToken);
var client = mqtt.connect('mqtt://'+thingsboardHost, {username: accessToken});

//Triggers when client is successfully connected to the Thingsboard host and device access token
client.on('connect', function(){
    console.log('Client connected!');
    //Uploads firmware version and serial number as device attributes using 'v1/devices/me/attributes' MQTT topic
    client.publish('v1/devices/me/attributes', JSON.stringify({"firmware_version":"1.0.1", "serial_number":"SN-001"}));
    //Schedules telemetry data upload once per second
    console.log('Uploading temperature data once per second...');
    setInterval(publishTelemetry, 1000);
});

//Uploads telemetry data using 'v1/devices/me/telemetry' MQTT topic
function publishTelemetry(){
    data.temperature = getNextValue(data.temperature, minTemperature, maxTemperature);
    client.publish('v1/devices/me/telemetry', JSON.stringify(data));
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
    client.end();
    console.log('Exited!');
    process.exit(2);
});

//Catches uncaught exceptions
process.on('uncaughtException', function(e){
    console.log('Uncaught Exception...');
    console.log(e.stack);
    process.exit(99);
});