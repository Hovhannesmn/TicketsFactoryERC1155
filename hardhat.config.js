/**
 * @type import('hardhat/config').HardhatUserConfig
 */
require('@nomiclabs/hardhat-waffle');
require('@nomiclabs/hardhat-etherscan');
require("dotenv").config();

module.exports = {
  solidity: "0.8.14",
  defaultNetwork: "rinkeby",
  paths: {
    artifacts: "./src/artifacts",
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
  },
  networks: {
    hardhat: {
      chainId: 1337
    },
    rinkeby: {
      url: "https://eth-rinkeby.alchemyapi.io/v2/VQu1SPhPXOGss4gbh_NuIPcRvadikkpo",
      accounts: [`0x${'fbccbe2e52936444c1818f5307f1fd1501650dce75ae821f2c073ca6727ae11a'}`]
    },
    localhost: {
      url: "http://localhost:8545",
      chainId: 1337,
    },
  },
  etherscan: {
    apiKey: "NNCF3K536PGUC28CGJUXA7WYXHS8SGNQ82"
  }
};
