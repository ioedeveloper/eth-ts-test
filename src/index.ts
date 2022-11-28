import * as core from '@actions/core'
import * as fs from 'fs/promises'
import { existsSync } from 'fs'
import * as path from 'path'
import * as cli from '@actions/exec'
import * as ts from 'typescript'
import { Compiler as RemixCompiler, EVMVersion } from '@remix-project/remix-solidity'
import { RemixURLResolver } from '@remix-project/remix-url-resolver'
import axios from 'axios'

interface CompileSettings {
  optimize: boolean,
  evmVersion: EVMVersion | null,
  runs: number,
  version: string
}

async function execute () {
  const testPath = core.getInput('test-path')
  const contractPath = core.getInput('contract-path')
  const compilerVersion = core.getInput('compiler-version')
  const isTestPathDirectory = (await fs.stat(testPath)).isDirectory()
  const isContractPathDirectory = (await fs.stat(contractPath)).isDirectory()
  const compileSettings = {
    optimize: true,
    evmVersion: null,
    runs: 200,
    version: compilerVersion
  }

  // compile smart contracts to run tests on.
  await core.group ("Compile contracts", async () => {
    if (isContractPathDirectory) {
      const contractFiles = await fs.readdir(contractPath)

      if (contractFiles.length > 0)  {
        for (const file of contractFiles) {
          await compileContract(`${contractPath}/${file}`, compileSettings)
        }
        await cli.exec('ls', [contractPath])
        await cli.exec('ls', [`${contractPath}/artifacts`])
      } else {
        core.setFailed('No contract files found')
      }
    } else {
      await compileContract(contractPath, compileSettings)
    }
  })

  // Move remix dependencies to test folder and transpile test files. Then run tests.
  await core.group("Run tests", async () => {
    if (isTestPathDirectory) {
      const testFiles = await fs.readdir(testPath)

      if (testFiles.length > 0) {
        (['ethers.js', 'methods.js', 'signer.js']).forEach(async (file: string) => {
          await fs.cp('dist/' + file, testPath + '/remix_deps/' + file)
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

// Compile single smart contract
async function compileContract (contractPath: string, settings: CompileSettings): Promise<void> {
  const contract = await fs.readFile(contractPath, 'utf8')
  const compilationTargets = { [contractPath]: { content: contract } }
  const remixCompiler = new RemixCompiler(async (url: string, cb: (error: string | null, result?: string) => void) => {
    try {
      if(await existsSync(url)) {
        const importContent = await fs.readFile(url, 'utf8')

        cb(null, importContent)
      } else {
        const resolver = new RemixURLResolver()
        const result = await resolver.resolve(url)

        cb(null, result.content)
      }
    } catch (e: any) {
      cb(e.message)
    }
  })
  const compilerList = await axios.get('https://raw.githubusercontent.com/ethereum/solc-bin/gh-pages/bin/list.json')
  const releases = compilerList.data.releases

  if (releases[settings.version]) {
    const compilerUrl = releases[settings.version].replace('soljson-', '').replace('.js', '')

    remixCompiler.set('evmVersion', settings.evmVersion)
    remixCompiler.set('optimize', settings.optimize)
    remixCompiler.set('runs', 200)
    return new Promise((resolve, reject) => {
      let intervalId: NodeJS.Timer

      remixCompiler.loadRemoteVersion(compilerUrl)
      remixCompiler.event.register('compilerLoaded', () => {
        remixCompiler.compile(compilationTargets, contractPath)
        // use setInterval to keep gh-action process alive in other for compilation to finish
        process.stdout.write('Compiling')
        intervalId = setInterval(() => {
          process.stdout.write('.')
        }, 1000)
      })
      remixCompiler.event.register('compilationFinished', async (success: boolean, data: any, source: string) => {
        if (success) {
          const contractName = path.basename(contractPath, '.sol')
          const artifactsPath = `${path.dirname(contractPath)}/artifacts`

          if (!existsSync(artifactsPath)) {
            await fs.mkdir(artifactsPath)
          }
          await fs.writeFile(`${artifactsPath}/${contractName}.json`, JSON.stringify(data, null, 2))
          console.log('JSON.stringify(data, null, 2): ', JSON.stringify(data, null, 2))
          clearInterval(intervalId)
          return resolve()
        } else {
          clearInterval(intervalId)
          return reject('Compilation failed')
        }
      })
    })
  } else {
    throw new Error('Compiler version not found')
  }
}

// Transpile and execute test files
async function main (filePath: string): Promise<void> {
  try {
    // TODO: replace regex globally
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

// Setup environment for running tests
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

// Run tests
async function runTest (filePath: string): Promise<void> {
  await cli.exec('npx', ['mocha', filePath])
}

// Transpile test scripts
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