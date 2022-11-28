import { ethers } from 'ethers'
import { Provider } from '@remix-project/remix-simulator'
import * as hhEtherMethods from './methods'

const remixSimulatorProvider = new Provider({ fork: null })
console.log('before initialization starts')
remixSimulatorProvider.init().then(() => {
    console.log('remixSimulatorProvider initialized')
    global.remixProvider = remixSimulatorProvider
})
// ethers.provider = new ethers.providers.Web3Provider(remixSimulatorProvider)
for(const method in hhEtherMethods) Object.defineProperty(ethers, method, { value: hhEtherMethods[method]})

export { ethers }