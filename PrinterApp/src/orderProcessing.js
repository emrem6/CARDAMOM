let orderList = new Array();
async function fetchOrder(_contract, _account) {
    console.log('inside orderprocessing')
    // Load offers
    const orderCount = await _contract.methods.orderCount().call()

    for (var i = 1; i <= orderCount; i++) {
        orderList.push(await _contract.methods.orders(i).call())
    }
    console.log('Orders: ', orderList)
    console.log('Account: ', _account)

    if (orderList !== 1) {
        return 0;
    }
    if (orderList.owner.includes(_account) == true) {
        console.log('NEW ORDER RECEIVED')
    }
}
module.exports = { fetchOrder }