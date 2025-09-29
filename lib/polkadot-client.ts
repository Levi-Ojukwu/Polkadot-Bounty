import { createBountiesSdk } from "@polkadot-api/sdk-governance"
import { createClient } from "polkadot-api"
import { getWsProvider } from "polkadot-api/ws-provider"

let clientInstance: any = null
let bountiesSdkInstance: any = null

export async function getPolkadotClient() {
  if (clientInstance) return clientInstance

  console.log("Connecting to Paseo testnet...")
  
  // Use WebSocket provider for Paseo testnet
  const provider = getWsProvider("wss://paseo-rpc.dwellir.com")
  clientInstance = createClient(provider)
  
  console.log("Client created:", clientInstance)
  return clientInstance
}

export async function getBountiesSdk() {
  if (bountiesSdkInstance) return bountiesSdkInstance

  const client = await getPolkadotClient()
  const typedApi = client.getUnsafeApi()

  bountiesSdkInstance = createBountiesSdk(typedApi)
  return bountiesSdkInstance
}

export async function getTypedApi() {
  const client = await getPolkadotClient()
  console.log("Getting unsafe API from client...")
  const api = client.getUnsafeApi()
  console.log("API obtained:", api)
  
  // Wait a bit for the runtime to be loaded
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  console.log("API after wait:", api)
  return api
}
