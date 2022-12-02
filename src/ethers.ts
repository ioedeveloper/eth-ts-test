import { ethers } from 'ethers'
import * as ganache from 'ganache'

// import { Provider } from '@remix-project/remix-simulator'
import * as hhEtherMethods from './methods'

global.remixProvider = ganache.provider()
for(const method in hhEtherMethods) Object.defineProperty(ethers, method, { value: hhEtherMethods[method]})

export * from 'ethers'
export { ethers }