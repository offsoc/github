import safeStorage from '@github-ui/safe-storage'

const experimentsLocalStorageKey = 'copilot_experiments'

export function getCopilotExperiments(): string[] {
  const experiments = safeStorage('localStorage').getItem(experimentsLocalStorageKey)
  if (!experiments) return []

  return experiments.split(',')
}

export function setCopilotExperiments(experiments: string[]): void {
  safeStorage('localStorage').setItem(experimentsLocalStorageKey, experiments.join(','))
}
