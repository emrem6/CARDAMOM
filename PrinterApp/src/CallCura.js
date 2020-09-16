const path = require('path');
const inputFilesPath = path.join(__dirname, '../files/input/');
const outputFilesPath = path.join(__dirname, '../files/output/');
const { exec } = require("child_process");

module.exports = {
    callCura: (fileHashSC_) => {
        return new Promise((resolve, reject) => {
            var inputFile = inputFilesPath.concat(fileHashSC_);
            var outputFile = outputFilesPath.concat(fileHashSC_, '.gcode');
            const command = "cd && cd CuraEngine && /home/emre/CuraEngine/build/CuraEngine slice -v -j /home/emre/CuraEngine/definitions/ultimaker2.def.json -o " + "'" + outputFile + "'" + " -l " + inputFile + ".stl";
            console.log(command)
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.log(`error: ${error.message}`);
                    return;
                }
                if (stderr) {
                    //   console.log(`stderr: ${stderr}`);
                    return resolve(stderr);
                }
                if (stdout != undefined) {
                    console.log(`stdout: ${stdout}`);
                }
            });
        }).then(result => {
            const rows = result.split(/\n/g);
            return {
                printTime: parseInt(rows[rows.length - 4].split(':')[1]),
                filamentUsage: parseInt(rows[rows.length - 2].split(':')[1])
            };
        });
    }
};
