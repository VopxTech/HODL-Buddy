import {
  Address,
  beginCell,
  Cell,
  Contract,
  contractAddress,
  ContractProvider,
  Sender,
  SendMode,
} from "@ton/core";

// Define the contract's initial data
export type HODLBuddyConfig = {
  number: number; // Counter value
  address: Address; // Address of the sender
  owner_address: Address; // Address of the owner
};

// Convert the config into a Cell (data)
export function HODLBuddyConfigToCell(config: HODLBuddyConfig): Cell {
  return beginCell()
    .storeUint(config.number, 64) // store the counter value
    .storeAddress(config.address) // store the address
    .storeAddress(config.owner_address) // store the owner address
    .endCell();
}

export class HODLBuddy implements Contract {
  constructor(
    readonly address: Address,
    readonly init?: { code: Cell; data: Cell },
  ) {}

  static createFromAddress(address: Address) {
    return new HODLBuddy(address);
  }

  static createFromConfig(
    config: HODLBuddyConfig,
    code: Cell,
    workchain = 0,
  ) {
    const data = HODLBuddyConfigToCell(config);
    const init = { code, data };
    const address = contractAddress(workchain, init);

    return new HODLBuddy(address, init);
  }

  sendDeposit(provider: ContractProvider, sender: Sender, value: bigint) {
    const msg_body = beginCell().storeUint(1, 32).endCell();

    return provider.internal(sender, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: msg_body,
    });
  }

  async sendNoCodeDeposit(
    provider: ContractProvider,
    sender: Sender,
    value: bigint,
  ) {
    const msg_body = beginCell().endCell();

    await provider.internal(sender, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: msg_body,
    });
  }

  async sendWithdrawalRequest(
    provider: ContractProvider,
    sender: Sender,
    value: bigint,
    amount: bigint,
    withdraw_all: number,
  ) {
    const msg_body = beginCell().storeUint(2, 32).storeCoins(amount).storeUint(
      withdraw_all,
      1,
    ).endCell();

    await provider.internal(sender, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: msg_body,
    });
  }

  async getData(provider: ContractProvider) {
    const { stack } = await provider.get("get_contract_storage_data", []);
    return {
      number: stack.readNumber(),
      recent_sender: stack.readAddress(),
      owner_address: stack.readAddress(),
    };
  }

  async getBalance(provider: ContractProvider) {
    const { stack } = await provider.get("balance", []);
    return {
      balance: stack.readNumber(),
    };
  }
}
