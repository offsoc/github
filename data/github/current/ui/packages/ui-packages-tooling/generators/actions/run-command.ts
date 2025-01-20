import {spawn} from 'child_process'
import type {CustomActionFunction} from 'plop'
import {resolve as resolvePath} from 'node:path'

export interface RunCommandConfig {
  type: 'runCommand'
  cmd: string
  args?: string[]
  cwd?: string
  ignoreFailure?: boolean
}

const didSucceed = (code: number | null) => `${code}` === '0'
const baseDir = resolvePath(__dirname, '../../../../../')

export const runCommand: CustomActionFunction = (_, config) => {
  if (process.env.NODE_ENV === 'test') {
    return 'Skipping action for tests'
  }

  const {cmd, args = [], cwd = baseDir, ignoreFailure = false} = config as unknown as RunCommandConfig
  const cmdString = `${cmd} ${args.join(' ')}`

  return new Promise((resolve, reject) => {
    const command = spawn(cmd, args, {cwd})

    command.on('close', code => {
      if (ignoreFailure || didSucceed(code)) {
        resolve(`${cmdString} finished`)
      } else {
        reject(new Error(`${cmdString} exited with ${code}`))
      }
    })
  })
}
