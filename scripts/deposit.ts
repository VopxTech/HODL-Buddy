import { Address, address, toNano } from "@ton/core";
import { HODLBuddy } from "../wrappers/HODLBuddy";
import { compile, NetworkProvider } from "@ton/blueprint";

export async function run(provider: NetworkProvider, args: string[]) {
  const ui = provider.ui();

  const length = args.length > 0
    ? args[0]
    : await ui.input("How long to HODL? (in seconds)");

  const deploymentTime = Math.floor(Date.now() / 1e3) + Number(length);

  const address = Address.parse(
    args.length > 1 ? args[1] : await ui.input("What is your address?"),
  );

  const myContract = HODLBuddy.createFromConfig(
    {
      number: deploymentTime,
      address: address,
      owner_address: address,
    },
    await compile("HODLBuddy"),
  );

  const openedContract = provider.open(myContract);

  console.log(
    `SAVE THIS! Contract/HODL address: ${openedContract.address} (unlocks at ${deploymentTime})`,
  );

  const amount = args.length > 2 ? args[2] : await ui.input("Deposit amount");

  await openedContract.sendDeposit(
    provider.sender(),
    toNano(Number(amount) + 0.005),
  );
}
