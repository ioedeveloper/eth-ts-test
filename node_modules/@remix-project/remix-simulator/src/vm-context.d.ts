/// <reference types="node" />
import Web3 from 'web3';
import { VmProxy } from './VmProxy';
import VM from '@ethereumjs/vm';
import Common from '@ethereumjs/common';
import StateManager from '@ethereumjs/vm/dist/state/stateManager';
import { StorageDump } from '@ethereumjs/vm/dist/state/interface';
import { Block } from '@ethereumjs/block';
import { Transaction } from '@ethereumjs/tx';
declare class StateManagerCommonStorageDump extends StateManager {
    keyHashes: {
        [key: string]: string;
    };
    constructor();
    putContractStorage(address: any, key: any, value: any): Promise<void>;
    dumpStorage(address: any): Promise<StorageDump>;
    getStateRoot(force?: boolean): Promise<Buffer>;
    setStateRoot(stateRoot: any): Promise<void>;
}
export declare type CurrentVm = {
    vm: VM;
    web3vm: VmProxy;
    stateManager: StateManagerCommonStorageDump;
    common: Common;
};
export declare class VMContext {
    currentFork: string;
    blockGasLimitDefault: number;
    blockGasLimit: number;
    blocks: Record<string, Block>;
    latestBlockNumber: string;
    blockByTxHash: Record<string, Block>;
    txByHash: Record<string, Transaction>;
    currentVm: CurrentVm;
    web3vm: VmProxy;
    logsManager: any;
    exeResults: Record<string, Transaction>;
    constructor(fork?: any);
    createVm(hardfork: any): {
        vm: VM;
        web3vm: VmProxy;
        stateManager: StateManagerCommonStorageDump;
        common: Common;
    };
    getCurrentFork(): string;
    web3(): VmProxy;
    blankWeb3(): Web3;
    vm(): VM;
    vmObject(): CurrentVm;
    addBlock(block: Block): void;
    trackTx(txHash: any, block: any, tx: any): void;
    trackExecResult(tx: any, execReult: any): void;
}
export {};
