import { ethers } from 'ethers'
import { Provider } from '@remix-project/remix-simulator'
import * as hhEtherMethods from './methods'

const remixSimulatorProvider = new Provider({ fork: null })

global.remixProvider = remixSimulatorProvider
for(const method in hhEtherMethods) Object.defineProperty(ethers, method, { value: hhEtherMethods[method]})

export { ethers }