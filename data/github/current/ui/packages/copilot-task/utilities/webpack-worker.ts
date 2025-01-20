import {FakeWorker as Worker} from './fake-worker'

/**
 * Gets the URL to use for a Monaco worker.
 */
export function getWorkerUrl(label: string) {
  const worker = getWorker(label)
  // fix the URL to match the actual host name so we don't run into cross-origin problems.
  return new URL(worker.url.toString().replace(/^([^/]*\/){3}/, ''), window.location.origin)
}

/**
 * Webpack thinks we're making a real worker here, so it gives us the right URL.
 */
function getWorker(label: string) {
  switch (label) {
    case 'json':
      return new Worker(new URL('monaco-editor/esm/vs/language/json/json.worker', import.meta.url))
    case 'css':
      return new Worker(new URL('monaco-editor/esm/vs/language/css/css.worker', import.meta.url))
    case 'html':
      return new Worker(new URL('monaco-editor/esm/vs/language/html/html.worker', import.meta.url))
    case 'typescript':
    case 'javascript':
      return new Worker(new URL('monaco-editor/esm/vs/language/typescript/ts.worker', import.meta.url))
    default:
      return new Worker(new URL('monaco-editor/esm/vs/editor/editor.worker.js', import.meta.url))
  }
}
