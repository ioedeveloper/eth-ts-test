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
        await cli.exec('ls')
        const remixEthers = await fs.readFile(path.resolve('', 'ethers_remix.ts'), 'utf8')
        const remixEthersScript = transpileScript(remixEthers)

        console.log('remixEthersScript.outputText: ', remixEthersScript.outputText)
        await fs.writeFile('ethers_remix.js', remixEthersScript.outputText)
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

    testFileContent = `import { ethersRemix } from './ethers_remix' \n${testFileContent}`
    const importIndex = testFileContent.search('describe')

    if (importIndex === -1) {
      throw new Error(`No describe function found in ${filePath}. Please wrap your tests in a describe function.`)
    } else {
      testFileContent = `${testFileContent.slice(0, importIndex)}\n ethers = ethersRemix; \n${testFileContent.slice(importIndex)}`
      const testFile = transpileScript(testFileContent)

      filePath = filePath.replace('.ts', '.js')
      await fs.writeFile(filePath, testFile.outputText)
      await setupRunEnv()
      runTest(filePath)
    }

    console.log('importIndex: ', importIndex)

    console.log(testFileContent)
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