import { ethers } from 'ethers'
import { Provider } from '@remix-project/remix-simulator'
import * as hhEtherMethods from './methods'

ethers.provider = new ethers.providers.Web3Provider(new Provider())
for(const method in hhEtherMethods) Object.defineProperty(ethers, method, { value: hhEtherMethods[method]})

export { ethers }