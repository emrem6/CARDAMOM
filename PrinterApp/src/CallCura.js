const path = require('path');
const inputFilesPath = path.join(__dirname, '../files/input/');
const outputFilesPath = path.join(__dirname, '../files/output/');
const { exec } = require("child_process");

module.exports = {
    callCura: (fileHashSC_) => {
        return new Promise((resolve, reject) => {
            var inputFile = inputFilesPath.concat(fileHashSC_);
            var outputFile = outputFilesPath.concat(fileHashSC_, '.gcode');
            const command = "cd && cd CuraEngine && ./build/CuraEngine slice -v -j ./definitions/ultimaker2.def.json -o " + "'" + outputFile + "'" + " -l " + inputFile + ".stl";
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
            const printT = rows[rows.length - 3].split(':')[1]
            const printStr = printT.split(' ')
            console.log(printStr)
            const printTh = parseInt(printStr[1].split('h')[0]) * 60 * 60
            console.log(printTh)
            const printTm = parseInt(printStr[2].split('m')[0]) * 60
            console.log(printTm)
            const printTs = parseInt(printStr[3].split('s')[0])
            console.log(printTs)
            const printTimeReturn = printTh + printTm + printTs
            console.log(printTimeReturn)


            return {
                printTime: printTh + printTm + printTs,
                filamentUsage: parseInt(rows[rows.length - 2].split(':')[1])
            };
        });
    }
};
