import safeStorage from '@github-ui/safe-storage'

const {getItem, setItem, removeItem} = safeStorage('localStorage')
const REACT_PROFILING_ENABLED = 'REACT_PROFILING_ENABLED'

interface ReactProfilingModeMethods {
  enable: () => void
  disable: () => void
  isEnabled: () => boolean
}

const ReactProfilingMode: ReactProfilingModeMethods = {
  enable: () => setItem(REACT_PROFILING_ENABLED, 'true'),
  disable: () => removeItem(REACT_PROFILING_ENABLED),
  isEnabled: () => !!getItem(REACT_PROFILING_ENABLED),
}

export default ReactProfilingMode
