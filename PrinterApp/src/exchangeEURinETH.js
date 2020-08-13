// returns the exchange rate from 1 ETH in EUR by calling a API service
const https = require('https');
module.exports = {
    exchangeEURinETH: () => {
        const chunks = []
        return new Promise((resolve, reject) => {
            https.get("https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=ETH,USD,EUR", function (response) {
                response.on('data', (chunk) => chunks.push(chunk))
                response.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
            })
        }).then(result => {
            let str = result.split('"EUR":')[1]
            str = str.split('}')[0]
            return str
        })
    }
}