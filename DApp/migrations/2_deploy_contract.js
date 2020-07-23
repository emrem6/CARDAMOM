const PrinterMarketplace = artifacts.require("PrinterMarketplace");

module.exports = function(deployer) {
  deployer.deploy(PrinterMarketplace);
};
