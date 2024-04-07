# HODLBuddy

HODL Buddy is a DApp for TON that allows you to lock your funds for a certain period of time. You can deposit funds and withdraw them after the specified time has passed.

## Features

-   Only the owner of the contract can withdraw the funds.
-   Contract accepts deposits from any address.
-   Contract can be destroyed after all funds are withdrawn.
-   Storage fee protection: the contract will not accept withdrawals that put the balance below the storage fee.
-   Withdrawal only using the contract address.

## Usage

**Web UI coming soon...**

### CLI Setup

Start by cloning the repository and installing the dependencies:

```bash
git clone https://github.com/VopxTech/HODL-Buddy.git
npm ci
npm run start
```

### Deposit

Choose `deposit` from the menu and enter the following info:

-   How long to HODL? - Enter the number of seconds you want to lock your funds for. E.g.: 300 for 5 minutes.
-   What is your address? - Enter your TON address.
    -   **Important**: Copy the address from the CLI. E.g.: `Connected to wallet at address: EQ...`.
    -   At the time of writing, the address format is `UQ...`.
-   Deposit amount - Enter the amount in TON coins. E.g.: `1.5`.

**Copy the contract address and save it for future withdrawal.**

### Withdraw

Choose `withdraw` from the menu and enter the following info:

-   Your HODL address - Enter the contract address you received when depositing.
-   Withdrawal mode - Choosing `0` will withdraw only the amount of funds that you enter. Choosing `1` will withdraw all funds and burn the contract.
-   Withdrawal amount - Enter the amount in TON coins. E.g.: `1.1`.

If you experience an error, check the exit code of the transaction:

-   `103`: You are not the owner of the contract.
-   `104`: The time for withdrawal has not come yet.
-   `105`: There is not enough funds in the contract to withdraw the specified amount.

## Development

### Project structure

-   `contracts` - source code of all the smart contracts of the project and their dependencies.
-   `wrappers` - wrapper classes (implementing `Contract` from ton-core) for the contracts, including any [de]serialization primitives and compilation functions.
-   `tests` - tests for the contracts.
-   `scripts` - scripts used by the project, mainly the deployment scripts.

### Build

`npx blueprint build` or `yarn blueprint build`

### Test

`npx blueprint test` or `yarn blueprint test`

### Deploy or run another script

`npx blueprint run` or `yarn blueprint run`

### Add a new contract

`npx blueprint create ContractName` or `yarn blueprint create ContractName`
