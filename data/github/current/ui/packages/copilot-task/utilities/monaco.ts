import {loader} from '@monaco-editor/react'
// eslint-disable-next-line import/no-namespace
import * as monaco from 'monaco-editor'

import {getWorkerUrl} from './webpack-worker'

let monacoConfigured = false
/**
 * Monaco is a special snowflake and requires some special configuration.
 *
 * Can't use useEffect() because
 * 1. we want it to run before rendering
 * 2. we want it to run only once regardless of react dev mode being tricksy
 */
export function configureMonaco() {
  if (monacoConfigured) {
    return
  }
  monacoConfigured = true

  self.MonacoEnvironment = {
    getWorker(workerId: string, label: string) {
      return new Worker(getWorkerUrl(label))
    },
  }

  loader.config({monaco})
}
