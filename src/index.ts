import * as core from'@actions/core'
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
  await cli.exec('ls')

  // load environment and depeondencies
  // await core.group("Setup environment", async () => {
  //   await setupRunEnv()
  // })

  // compile smart contracts to run tests on.
  await core.group("Compile contracts", async () => {
    if (isContractPathDirectory) {
      const contractFiles = await fs.readdir(path.resolve(contractPath))

      if (contractFiles.length > 0)  {
        for (const file of contractFiles) {
          if ((await fs.stat(`${contractPath}/${file}`)).isDirectory()) continue

          await compileContract(`${contractPath}/${file}`, compileSettings)
        }
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
      const filesPaths = []

      if (testFiles.length > 0) {
        (['ethers.js', 'methods.js', 'signer.js', 'artefacts-helper.js', 'chai.js']).forEach(async (file: string) => {
          await fs.cp('dist/' + file, testPath + '/remix_deps/' + file)
        })
        for (const testFile of testFiles) {
          if ((await fs.stat(`${testPath}/${testFile}`)).isDirectory()) continue
          const filePath = await main(`${testPath}/${testFile}`, contractPath)

          if (filePath) filesPaths.push(filePath)
        }
        if (filesPaths.length > 0) {
          await runTest(filesPaths)
        }
      }
    } else {
      const filePath = await main(testPath, contractPath)

      if (filePath) {
        await runTest(filePath)
      }
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
        process.stdout.write('\nCompiling')
        intervalId = setInterval(() => {
          process.stdout.write('.')
        }, 1000)
      })
      remixCompiler.event.register('compilationFinished', async (success: boolean, data: any, source: string) => {
        if (success) {
          const contractName = path.basename(contractPath, '.sol')
          const artifactsPath = `${path.dirname(contractPath)}/artifacts`

          if (!existsSync(artifactsPath)) await fs.mkdir(artifactsPath)
          await fs.writeFile(`${artifactsPath}/${contractName}.json`, JSON.stringify(data, null, 2))
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
async function main (filePath: string, contractPath: string): Promise<string | undefined> {
  try {
    // TODO: replace regex globally
    let testFileContent = await fs.readFile(filePath, 'utf8')
    const hardhatEthersImportRegex = /from\s*['"]hardhat['"]|from\s*['"]hardhat\/ethers['"]|from\s*['"]ethers['"]|from\s*['"]ethers\/ethers['"]/g
    const hardhatEthersRequireRegex = /require\(['"]hardhat\/ethers['"]\)|require\(['"]hardhat['"]\)|require\(['"]ethers\/ethers['"]\)|require\(['"]ethers['"]\)/g
    const chaiImportRegex = /from\s*['"]chai['"]/g
    const chaiRequireRegex = /require\(['"]chai['"]\)/g
    const hardhatImportIndex = testFileContent.search(hardhatEthersImportRegex)
    const hardhatRequireIndex = testFileContent.search(hardhatEthersRequireRegex)
    const chaiImportIndex = testFileContent.search(chaiImportRegex)
    const chaiRequireIndex = testFileContent.search(chaiRequireRegex)
    const describeIndex = testFileContent.search(/describe\s*\(/)
    
    if (describeIndex === -1) {
      throw new Error(`No describe function found in ${filePath}. Please wrap your tests in a describe function.`)
    } else {
      testFileContent = `${testFileContent.slice(0, describeIndex)}\nglobal.remixContractArtefactsPath = "${contractPath}/artifacts"; \n${testFileContent.slice(describeIndex)}`
      if (hardhatImportIndex > -1) testFileContent = testFileContent.replace(hardhatEthersImportRegex, 'from \'./remix_deps/ethers\'')
      if (hardhatRequireIndex > -1) testFileContent = testFileContent.replace(hardhatEthersRequireRegex, 'require(\'./remix_deps/ethers\')')
      if (chaiImportIndex) testFileContent = testFileContent.replace(chaiImportRegex, 'from \'./remix_deps/chai\'')
      if (chaiRequireIndex) testFileContent = testFileContent.replace(chaiRequireRegex, 'require(\'./remix_deps/chai\')')
      const testFile = transpileScript(testFileContent)

      filePath = filePath.replace('.ts', '.js')
      await fs.writeFile(filePath, testFile.outputText)
      return filePath
    }
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
    await cli.exec('yarn', ['add', 'chai', 'mocha', '@ethereum-waffle/chai', '--dev'])
  } else if (isNPMrepo) {
    await cli.exec('npm', ['install', 'chai', 'mocha', '@ethereum-waffle/chai', '--save-dev'])
  } else {
    await cli.exec('npm', ['init', '-y'])
    await cli.exec('npm', ['install', 'chai', 'mocha', '@ethereum-waffle/chai', '--save-dev'])
  }
}

// Run tests
async function runTest (filePath: string | string[]): Promise<void> {
  if (Array.isArray(filePath)) {
      await cli.exec('npx', ['mocha', ...filePath, '--timeout', '60000'])
  } else {
      await cli.exec('npx', ['mocha', filePath, '--timeout', '60000'])
  }
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