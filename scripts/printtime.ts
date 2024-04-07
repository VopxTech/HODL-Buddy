import { NetworkProvider } from "@ton/blueprint";

export async function run(provider: NetworkProvider) {
  console.log(Math.floor(Date.now() / 1e3));
}
