import { Cell, toNano } from "@ton/core";
import { Blockchain, SandboxContract, TreasuryContract } from "@ton/sandbox";
import { HODLBuddy } from "../wrappers/HODLBuddy";
import "@ton/test-utils";
import { compile } from "@ton/blueprint";

describe("main.fc contract tests", () => {
  let blockchain: Blockchain;
  let myContract: SandboxContract<HODLBuddy>;
  let initWallet: SandboxContract<TreasuryContract>;
  let ownerWallet: SandboxContract<TreasuryContract>;
  let codeCell: Cell;

  beforeAll(async () => {
    codeCell = await compile("HODLBuddy");
  });

  beforeEach(async () => {
    blockchain = await Blockchain.create();
    initWallet = await blockchain.treasury("init");
    ownerWallet = await blockchain.treasury("owner");

    myContract = blockchain.openContract(
      await HODLBuddy.createFromConfig(
        {
          number: Math.floor(Date.now() / 1e3) + 5, // 5 seconds from now
          address: initWallet.address,
          owner_address: ownerWallet.address,
        },
        codeCell,
      ),
    );
  });

  // ---- Deployment test ----

  it("Checks the latest address", async () => {
    const senderWallet = await blockchain.treasury(
      "sender",
    );

    const sentMessageResult = await myContract.sendDeposit(
      senderWallet.getSender(),
      toNano("0.05"),
    );

    expect(sentMessageResult.transactions).toHaveTransaction({
      from: senderWallet.address,
      to: myContract.address,
      success: true,
    });

    const data = await myContract.getData();

    expect(data.recent_sender.toString()).toBe(senderWallet.address.toString());
  });

  // ---- Deposit tests ----

  it("successfully deposits funds", async () => {
    const senderWallet = await blockchain.treasury("sender");

    const depositMessageResult = await myContract.sendDeposit(
      senderWallet.getSender(),
      toNano("5"),
    );

    expect(depositMessageResult.transactions).toHaveTransaction({
      from: senderWallet.address,
      to: myContract.address,
      success: true,
    });

    const balance = await myContract.getBalance();

    expect(balance.balance).toBeGreaterThan(toNano("4.99"));
  });

  // ---- Error tests ----

  it("should return funds as no command is sent", async () => {
    const senderWallet = await blockchain.treasury("sender");

    const depositMessageResult = await myContract.sendNoCodeDeposit(
      senderWallet.getSender(),
      toNano("5"),
    );

    expect(depositMessageResult.transactions).toHaveTransaction({
      from: myContract.address,
      to: senderWallet.address,
      success: true,
    });

    const balanceRequest = await myContract.getBalance();

    expect(balanceRequest.balance).toBe(0);
  });

  // ---- Withdrawal tests ----

  it("successfully withdraws funds on behalf of owner", async () => {
    const senderWallet = await blockchain.treasury("sender");

    await myContract.sendDeposit(senderWallet.getSender(), toNano("5"));

    await new Promise((resolve) => setTimeout(resolve, 6000));

    const withdrawalRequestResult = await myContract.sendWithdrawalRequest(
      ownerWallet.getSender(),
      toNano("0.05"),
      toNano("1"),
      0,
    );

    expect(withdrawalRequestResult.transactions).toHaveTransaction({
      from: myContract.address,
      to: ownerWallet.address,
      success: true,
      value: toNano(1),
    });
  }, 30 * 1000);

  it("fails to withdraw funds on behalf of not-owner", async () => {
    const senderWallet = await blockchain.treasury("sender");

    await myContract.sendDeposit(senderWallet.getSender(), toNano("5"));

    const withdrawalRequestResult = await myContract.sendWithdrawalRequest(
      senderWallet.getSender(),
      toNano("0.5"),
      toNano("1"),
      0,
    );

    expect(withdrawalRequestResult.transactions).toHaveTransaction({
      from: senderWallet.address,
      to: myContract.address,
      success: false,
      exitCode: 103,
    });
  });

  it("fails to withdraw funds because too little time passed", async () => {
    const withdrawalRequestResult = await myContract.sendWithdrawalRequest(
      ownerWallet.getSender(),
      toNano("0.5"),
      toNano("0.01"),
      0,
    );

    expect(withdrawalRequestResult.transactions).toHaveTransaction({
      from: ownerWallet.address,
      to: myContract.address,
      success: false,
      exitCode: 104,
    });
  });

  it("fails to withdraw funds because lack of balance", async () => {
    await new Promise((resolve) => setTimeout(resolve, 6 * 1000));

    const withdrawalRequestResult = await myContract.sendWithdrawalRequest(
      ownerWallet.getSender(),
      toNano("0.5"),
      toNano("1"),
      0,
    );

    expect(withdrawalRequestResult.transactions).toHaveTransaction({
      from: ownerWallet.address,
      to: myContract.address,
      success: false,
      exitCode: 105,
    });
  }, 30 * 1000);
});
