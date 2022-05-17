// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import hre from 'hardhat';
import fs from 'fs';
import dotenv from 'dotenv';
import process from "process";

dotenv.config();
const basePath = process.cwd();


(async () => {
  try {
    await fs.readFile(`${basePath}/ipfsUrl.txt`, 'utf8', async (err, nftBaseUrl) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log('nftBaseUrl is: ', nftBaseUrl);

      const NFTFactory = await hre.ethers.getContractFactory("NFTFactory");

      const nftFactory = await NFTFactory.deploy(
        process.env.NFT_FACTORY_NAME,
        process.env.NFT_FACTORY_SYMBOL,
        nftBaseUrl
      );

      await nftFactory.deployed();

      const dataNFTFactory = {
        address: nftFactory.address,
        abi: JSON.parse(nftFactory.interface.format('json'))
      };
      fs.writeFileSync('./src/NFTFactory.deployed.json', JSON.stringify(dataNFTFactory));

      console.log("NFTFactory deployed to:", nftFactory.address);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();

