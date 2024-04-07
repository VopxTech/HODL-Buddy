import { Address, address, toNano } from "@ton/core";
import { HODLBuddy } from "../wrappers/HODLBuddy";
import { compile, NetworkProvider } from "@ton/blueprint";

export async function run(provider: NetworkProvider, args: string[]) {
  const ui = provider.ui();

  const address = Address.parse(
    args.length > 0 ? args[0] : await ui.input("Your HODL address"),
  );

  const wmode = args.length > 1
    ? args[1]
    : await ui.input("Withdrawal mode (0 - custom amount, 1 - all funds)");

  const amount = args.length > 2
    ? args[2]
    : await ui.input("Withdrawal amount");

  if (!(await provider.isContractDeployed(address))) {
    ui.write(`Error: Contract at address ${address} is not deployed!`);
    return;
  }

  const openedContract = provider.open(HODLBuddy.createFromAddress(address));

  await openedContract.sendWithdrawalRequest(
    provider.sender(),
    toNano("0.005"),
    toNano(Number(amount)),
    wmode === "1" ? 1 : 0,
  );
}
