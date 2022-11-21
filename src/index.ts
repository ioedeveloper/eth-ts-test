import * as core from '@actions/core'
import * as fs from 'fs/promises'
import { existsSync } from 'fs'
import * as path from 'path'
import * as cli from '@actions/exec'
import * as ts from 'typescript'

async function execute () {
  const testPath = core.getInput('test-path')
  const artifactPath = core.getInput('artifact-path')
  const isTestPathDirectory = (await fs.stat(testPath)).isDirectory()

  await core.group("Run tests", async () => {
    if (isTestPathDirectory) {
      const testFiles = await fs.readdir(testPath)

      if (testFiles.length > 0) {
        (['ethers.js', 'methods.js', 'signer.js']).forEach(async (file: string) => {
          await fs.cp(path.resolve('dist/' + file), path.resolve(testPath + '/remix_deps/' + file))
        })
        for (const testFile of testFiles) {
          await main(`${testPath}/${testFile}`)
        }
      }
    } else {
      await main(testPath)
    }
  })
}

async function main (filePath: string): Promise<void> {
  try {
    let testFileContent = await fs.readFile(filePath, 'utf8')
    const hardhatEthersImportRegex = /import\s+{ ethers }\s+from\s+['"]hardhat['"]|import { * as ethers } from 'hardhat\/ethers'|import\s+ethers\s+from\s+['"]hardhat\/ethers['"]/
    const hardhatEthersRequireRegex = /const\s*{\s*ethers\s*}\s*=\s*require\(['"]hardhat['"]\)|let\s*{\s*ethers\s*}\s*=\s*require\(['"]hardhat['"]\)|const\s+ethers\s+=\s+require\(['"]hardhat['"]\)\.ethers|let\s+ethers\s+=\s+require\(['"]hardhat['"]\)\.ethers/g
    const hardhatImportIndex = testFileContent.search(hardhatEthersImportRegex)
    const hardhatRequireIndex = testFileContent.search(hardhatEthersRequireRegex)
    console.log('hardhatImportIndex', hardhatImportIndex)
    console.log('hardhatRequireIndex', hardhatRequireIndex)

    if (hardhatImportIndex > -1) {
      testFileContent = testFileContent.replace(hardhatEthersImportRegex, 'import { ethers } from \'./remix_deps/ethers\'')
      console.log('testFileContent', testFileContent)
    } else if (hardhatRequireIndex > -1) {
      testFileContent = testFileContent.replace(hardhatEthersRequireRegex, 'const { ethers } = require(\'./remix_deps/ethers\')')
      console.log('testFileContent', testFileContent)
    }
    const testFile = transpileScript(testFileContent)

    filePath = filePath.replace('.ts', '.js')
    await fs.writeFile(filePath, testFile.outputText)
    await setupRunEnv()
    runTest(filePath)
  } catch (error) {
    core.setFailed(error.message)
  }
}

async function setupRunEnv (): Promise<void> {
  const workingDirectory = process.cwd()
  const yarnLock = path.join(workingDirectory, 'yarn.lock')
  const isYarnRepo = await existsSync(yarnLock)
  const packageLock = path.join(workingDirectory, 'package-lock.json')
  const isNPMrepo = existsSync(packageLock)

  if (isYarnRepo) {
    await cli.exec('yarn', ['add', 'chai', 'mocha', '--dev'])
  } else if (isNPMrepo) {
    await cli.exec('npm', ['install', 'chai', 'mocha', '--save-dev'])
  } else {
    await cli.exec('npm', ['init', '-y'])
    await cli.exec('npm', ['install', 'chai', 'mocha', '--save-dev'])
  }
}

async function runTest (filePath: string): Promise<void> {
  await cli.exec('npx', ['mocha', filePath])
}

function transpileScript (script: string): ts.TranspileOutput {
  const output = ts.transpileModule(script, { compilerOptions: {
    target: ts.ScriptTarget.ES2015,
    module: ts.ModuleKind.CommonJS,
    esModuleInterop: true,  
  }})

  return output
}

execute().catch(error => {
  if (typeof (error) !== 'string') {
    if (error.message) error = error.message
    else {
      try { error = 'error: ' + JSON.stringify(error) } catch (e) { console.log(e) }
    }
  }
  core.setFailed(error)
})