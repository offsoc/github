import safeStorage from '@github-ui/safe-storage'

const experimentsLocalStorageKey = 'blackbird_experiments'
const experimentsDebugScoringKey = 'blackbird_debug_scoring'

export function getBlackbirdExperiments(): string[] {
  const experiments = safeStorage('localStorage').getItem(experimentsLocalStorageKey)
  if (!experiments) return []

  return experiments.split(',')
}

export function setBlackbirdExperiments(experiments: string[]): void {
  safeStorage('localStorage').setItem(experimentsLocalStorageKey, experiments.join(','))
}

export function debugScoringInfoEnabled(): boolean {
  const enabled = safeStorage('localStorage').getItem(experimentsDebugScoringKey)
  return enabled !== null
}

export function setDebugScoringInfoEnabled(enabled: boolean): void {
  if (enabled) {
    safeStorage('localStorage').setItem(experimentsDebugScoringKey, '1')
  } else {
    safeStorage('localStorage').removeItem(experimentsDebugScoringKey)
  }
}
