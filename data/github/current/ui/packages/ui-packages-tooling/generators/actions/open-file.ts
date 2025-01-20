import {resolve as resolvePath} from 'path'
import {runCommand} from './run-command'
import type {CustomActionFunction} from 'plop'

export interface OpenFileConfig {
  type: 'openFile'
  path: string
}

export const openFile: CustomActionFunction = (answers, config, plop) => {
  const relativePath = plop.renderString(config.path, answers)
  const filePath = resolvePath(plop.getPlopfilePath(), relativePath)

  return runCommand(
    answers,
    {
      type: 'runCommand',
      cmd: 'code',
      args: [filePath],
      abortOnFail: false,
    },
    plop,
  )
}
