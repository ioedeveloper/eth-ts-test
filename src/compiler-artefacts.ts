  /**
   * Get artefacts for a contract (called by script-runner)
   * @param name contract name or fully qualified name i.e. <filename>:<contractname> e.g: contracts/1_Storage.sol:Storage 
   * @returns artefacts for the contract
   */
  export async function getArtefactsByContractName (name: string) {
    const contractsDataByFilename = getAllContractDatas()
    // check if name is a fully qualified name
    if (name.includes(':')) {
      const fullyQualifiedName = name
      const nameArr = fullyQualifiedName.split(':')
      const filename = nameArr[0]
      const contract = nameArr[1]
      if(Object.keys(contractsDataByFilename).includes(filename) && contractsDataByFilename[filename][contract]) 
        return contractsDataByFilename[filename][contract]
      else {
        const allContractsData = {}
        await this._populateAllContractArtefactsFromFE ('contracts', contract, allContractsData)
        if(allContractsData[fullyQualifiedName]) return { fullyQualifiedName, artefact: allContractsData[fullyQualifiedName]}
        else throw new Error(`Could not find artifacts for ${fullyQualifiedName}. Compile contract to generate artifacts.`)
      }
    } else {
      const contractName = name
      const contractArtefacts = this._getAllContractArtefactsfromOutput(contractsDataByFilename, contractName)
      let keys = Object.keys(contractArtefacts)
      if (!keys.length) {
        await this._populateAllContractArtefactsFromFE ('contracts', contractName, contractArtefacts)
        keys = Object.keys(contractArtefacts)
      }
      if (keys.length === 1) return { fullyQualifiedName: keys[0], artefact: contractArtefacts[keys[0]] }
      else if (keys.length > 1) {
        throw new Error(`There are multiple artifacts for contract "${contractName}", please use a fully qualified name.\n
          Please replace ${contractName} for one of these options wherever you are trying to read its artifact: \n
          ${keys.join()}\n
          OR just compile the required contract again`)
      } else throw new Error(`Could not find artifacts for ${contractName}. Compile contract to generate artifacts.`)
    }
  }

    /**
   * Get compilation output for contracts compiled during a session of Remix IDE
   * @returns compilatin output
   */
  export function getAllContractDatas () {
    return filterAllContractDatas(() => true)
  }

    /**
   * filter compilation output for contracts compiled during a session of Remix IDE
   * @returns compilatin output
   */
  export function filterAllContractDatas (filter) {
    const contractsData = {}
    Object.keys(this.compilersArtefactsPerFile).map((targetFile) => {
      const contracts = this.compilersArtefactsPerFile[targetFile].getContracts()
      Object.keys(contracts).map((file) => {
        if (filter(file, contracts[file])) contractsData[file] = contracts[file]
      })
    })
    // making sure we save last compilation result in there
    if (this.compilersArtefacts.__last) {
      const contracts = this.compilersArtefacts.__last.getContracts()
      Object.keys(contracts).map((file) => {
        if (filter(file, contracts[file])) contractsData[file] = contracts[file]
      })
    }
    return contractsData
  }