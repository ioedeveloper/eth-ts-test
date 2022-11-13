import * as core from '@actions/core'
import * as fs from 'fs/promises'
import { existsSync } from 'fs'
import * as path from 'path'
import * as cli from '@actions/exec'

async function execute () {
  const testPath = core.getInput('test-path')
  const artifactPath = core.getInput('artifact-path')
  const isTestPathDirectory = (await fs.stat(testPath)).isDirectory()

  await core.group("Run tests", async () => {
    if (isTestPathDirectory) {
      const testFiles = await fs.readdir(testPath)

      for (const testFile of testFiles) {
        await main(`${testPath}/${testFile}`)
      }
    } else {
      await main(testPath)
    }
  })
}

async function main (filePath: string) {
  try {
    let testFileContent = await fs.readFile(filePath, 'utf8')

    testFileContent = `import { ethersRemix } from './ethers_remix' \n${testFileContent}`
    const importIndex = testFileContent.search('describe')

    if (importIndex === -1) {
      throw new Error(`No describe function found in ${filePath}. Please wrap your tests in a describe function.`)
    } else {
      testFileContent = `${testFileContent.slice(0, importIndex)}\n ethers = ethersRemix; \n${testFileContent.slice(importIndex)}`
      await fs.writeFile(filePath, testFileContent)
      await setupRunEnv()
      runTest(filePath)
    }

    console.log('importIndex: ', importIndex)

    console.log(testFileContent)
  } catch (error) {
    core.setFailed(error.message)
  }
}

async function setupRunEnv () {
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

async function runTest (filePath: string) {
  await cli.exec('npx', ['mocha', filePath])
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