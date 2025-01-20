export function getCommitsCountText(value: number) {
  return `${value} ${value === 1 ? 'commit' : 'commits'}`
}
