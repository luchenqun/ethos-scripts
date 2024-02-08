import { ethers } from "ethers";
import fs from "fs-extra";

const main = async () => {
  BigInt.prototype.toJSON = function () {
    return this.toString();
  };

  const PROVIDER = "http://127.0.0.1:8545";
  const PRIVATE_KEY = "f78a036930ce63791ea6ea20072986d8c3f16a6811f6a2583b0787c45086f769";
  const ABI = (await fs.readJSON("./contracts/IBank.json")).abi;
  const PRECOMPILE_ADDRESS = "0x0000000000000000000000000000000000001000";
  const TO_ADDRESS = "0x1111102dd32160b064f2a512cdef74bfdb6a9f96";

  const provider = new ethers.JsonRpcProvider(PROVIDER);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  let tx;

  const contractPrecompile = new ethers.Contract(PRECOMPILE_ADDRESS, ABI, wallet);

  {
    // send
    console.log("send coins(8ethos) to another address");
    console.log("before from user ", wallet.address, " have balance ", await provider.getBalance(wallet.address));
    console.log("before to user ", TO_ADDRESS, " have balance ", await provider.getBalance(TO_ADDRESS));

    const coins = [{ denom: "aethos", amount: "8000000000000000000" }];
    tx = await contractPrecompile.send(TO_ADDRESS, coins);
    const receipt = await tx.wait();
    const events = await contractPrecompile.queryFilter("Send", receipt.blockNumber, receipt.blockNumber);
    console.log("Send event", JSON.stringify(events[0].args, undefined, 2));

    console.log("after from user ", wallet.address, " have balance ", await provider.getBalance(wallet.address));
    console.log("after to user ", TO_ADDRESS, " have balance ", await provider.getBalance(TO_ADDRESS));

    console.log("");
  }

  // {
  //   // deposition
  //   const coins = await contractPrecompile.deposition(wallet.address);
  //   console.log("query user ", wallet.address, " deposit balance ", JSON.stringify(coins));
  // }
};

main();
