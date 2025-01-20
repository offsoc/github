// Return the thread name corrected to show in the menu
export const threadNameText = (thread: string) => {
  switch (thread) {
    case 'PullRequest':
      return 'Pull requests'
    case 'SecurityAlert':
      return 'Security alerts'
    default:
      return `${thread}s`
  }
}
