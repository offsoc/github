import safeStorage from '@github-ui/safe-storage'

const HADRON_COPILOT_THREAD_MAP = 'hadron-copilot-thread-map'

function getSafeLocalStorage() {
  return safeStorage('localStorage', {
    throwQuotaErrorsOnSet: false,
    ttl: 1000 * 60 * 60 * 24,
  })
}

function getThreadMap(): Record<string, string> {
  const threadMap = getSafeLocalStorage().getItem(HADRON_COPILOT_THREAD_MAP)
  if (threadMap) {
    return JSON.parse(threadMap)
  }
  return {}
}

function setThreadMap(threadMap: Record<string, string>) {
  getSafeLocalStorage().setItem(HADRON_COPILOT_THREAD_MAP, JSON.stringify(threadMap))
}

/**
 * Save the Copilot chat thread id for the given PR in local storage
 */
export function getSelectedThreadID(owner: string, repo: string, prID: string): string | null {
  const threadMap = getThreadMap()
  const threadID = threadMap[`${owner}/${repo}:${prID}`]
  return threadID || null
}

/**
 * Get the Copilot chat thread id for the given PR from local storage
 */
export function setSelectedThreadID(owner: string, repo: string, prID: string, threadID: string | null) {
  const threadMap = getThreadMap()
  if (threadID) {
    threadMap[`${owner}/${repo}:${prID}`] = threadID
  } else {
    delete threadMap[`${owner}/${repo}:${prID}`]
  }
  setThreadMap(threadMap)
}
