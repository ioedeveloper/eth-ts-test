import * as core from '@actions/core'
import { ethers } from './ethers'
import * as fs from 'fs/promises'

async function execute () {
  const testPath = core.getInput('test-path')
  const artifactPath = core.getInput('artifact-path')

  await core.group("Run tests", async () => {
    const testFileContent = await fs.readFile(testPath, 'utf8')

    console.log('testFileContent: ', testFileContent)
  })
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