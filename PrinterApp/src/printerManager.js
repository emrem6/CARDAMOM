//const App = require('ServerApp.js')
const request = require('request');
const fs = require('fs');
const path = require('path')
const outputFilesPath = path.join(__dirname, '../files/output/');
const config = require('../config/PrinterConfig.json')
let fileStream;
let fileUrl;
let printerUrlFileUplaod = config.printerConnectoryStuttgart + config.api.upload;
let printerUrlPrint = config.printerConnectoryStuttgart + config.api.print;
let fileName;
//let printerUrl = "http://192.168.0.83:80"


//
let setFormData = (fileUrl) => {
    let formData;
    return formData = {
        print_file: fs.createReadStream(fileUrl),
    };
}
//
async function sendFileToPrinter(_fileHash) {
    fileUrl = outputFilesPath + _fileHash + '.gcode';
    console.log('fileUrl', fileUrl)
    console.log('SENDING FILE TO PRINTER');
    request.post({ url: printerUrlFileUplaod, formData: setFormData(fileUrl) }, function optionalCallback(err, httpResponse, body) {
        if (err) {
            return console.error('upload failed:', err);
        }
        console.log('Upload successful!  Server responded with:', body);
    });
}

async function startPrinter(_fileHash) {

    console.log('#########################');
    console.log('SENDING PRINTER COMMAND TO PRINTER');
    console.log('#########################');
    request.post({ url: printerUrlPrint, form: { PRINT: _fileHash + '.gcode' } }, function optionalCallback(err, httpResponse, body) {
        if (err) {
            return console.error('command failed:', err);
        }
        console.log('Printer starts..!  Server responded with:', body);
    });
}
module.exports = {
    sendFileToPrinter, startPrinter
};


