import { CompilationResult } from '@remix-project/remix-solidity'
import * as fs from 'fs/promises'
import * as path from 'path'

declare global {
    var remixContractArtefactsPath: string
}

export async function getArtefactsByContractName (contractIdentifier: string) {
    const contractArtefacts = await fs.readdir(global.remixContractArtefactsPath)

    for (const artefactFile of contractArtefacts) {
      const artefact = await fs.readFile(path.join(global.remixContractArtefactsPath, artefactFile), 'utf-8')
      const artefactJSON: CompilationResult = JSON.parse(artefact)
      const contractFullPath = (Object.keys(artefactJSON.contracts!)).find((contractName) => artefactJSON.contracts![contractName][contractIdentifier])
      const contract = artefactJSON.contracts![contractFullPath!][contractIdentifier]

      return contract
    }
}