const path = require('path');
const cura = require(path.join(__dirname, 'CallCura.js'));
const config = require(path.join(__dirname, 'config', 'PrinterConfig.json'));

// get calculation elements from PrinterConfig.json
let density = config.filament.density;
let filamentCost = config.filament.filamentcost;
let filamentWeight = config.filament.filamentweight;
let powerconsumption = config.costs.powerconsumption;
let powerprice = config.costs.powerprice;
let economicwear = config.costs.economicwear;
let cleaning = config.costs.cleaning;
let profitfactor = config.costs.profitfactor;

var filamentUsageWeight
var filamentUsageCost
var electricitycosts
var totalcosts
var offerprice;
var printtimeinh;

function calculatePrice(curaValues_) {
    if (typeof curaValues_.printTime == 'number' && typeof curaValues_.filamentUsage == 'number') {
        filamentUsageWeight = density / 1000 * curaValues_.filamentUsage;
        filamentUsageCost = filamentCost / filamentWeight * filamentUsageWeight;
        electricitycosts = powerconsumption * powerprice * (curaValues_.printTime / 60 / 60) // curaValues_.printTime is given in sec. and needs to tranformed into hours
        totalcosts = (filamentUsageCost + electricitycosts) * (1 + (economicwear + cleaning))
        offerprice = totalcosts * profitfactor;
        printtimeinh = new Date(curaValues_.printTime * 1000).toISOString().substr(11, 8)
        console.log('##################################################')
        console.log('Materialcosts: ', filamentUsageCost, 'EUR', '\n',
            'Filament needed: ', filamentUsageWeight, 'gr.', '\n',
            'Printing time (sec.): ', curaValues_.printTime, 'sec.', '\n',
            'Printing time (h.): ', printtimeinh, 'h.', '\n',
            'Electricity costs: ', electricitycosts, 'EUR', '\n',
            'Total costs: ', totalcosts, 'EUR', '\n',
            '\n',
            'Offer price: ', offerprice.toFixed(2), 'EUR'
        )
        console.log('##################################################')
        return offerprice
    }
    else {
        console.log('EROR: ', curaValues_.printTime, ' or ', curaValues_.filamentUsage, 'is not type of number')
    }
}
module.exports = {
    calculatePrice
};