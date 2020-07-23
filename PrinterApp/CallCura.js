const path = require('path');
const config = require(path.join(__dirname, 'config', 'CuraConfig.json'));
const { exec } = require("child_process");

module.exports = {
    callCura: (fileHashSC_) => {
        return new Promise((resolve, reject) => {
            var inputFile = __dirname.concat(config.inputPath, fileHashSC_)
            var outputfile = __dirname.concat(config.outputPath, fileHashSC_, '.gcode')
            const command = "cd && cd CuraEngine && /home/emre/CuraEngine/build/CuraEngine slice -v -j /home/emre/CuraEngine/definitions/ultimaker2.def.json -o " + "'" + outputfile + "'" + " -l " + inputFile+".stl";
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
