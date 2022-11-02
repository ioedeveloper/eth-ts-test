import * as core from '@actions/core'
import { ethers } from './ethers'
import * as fs from 'fs/promises'

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
    const testFileContent = await fs.readFile(filePath, 'utf8')
    const importIndex = testFileContent.search(/import\s+['"]ethers['"]/)

    console.log('importIndex: ', importIndex)

    console.log(testFileContent)
  } catch (error) {
    core.setFailed(error.message)
  }
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