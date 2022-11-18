import { ethers } from 'ethers'
import { Provider } from '@remix-project/remix-simulator'
import * as hhEtherMethods from './methods'

const ethersRemix: any = ethers

ethersRemix.provider = new ethersRemix.providers.Web3Provider(new Provider())
for(const method in hhEtherMethods) Object.defineProperty(ethersRemix, method, { value: hhEtherMethods[method]})

export { ethersRemix }