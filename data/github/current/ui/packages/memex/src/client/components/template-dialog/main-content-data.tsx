export function infoContentMap(name: string): {title: string; description: string} {
  if (name === 'table') {
    return {
      title: 'New table',
      description:
        'Start with a powerful spreadsheet style table to filter, sort and group your issues and pull requests. Easily switch to a board or roadmap layout at any time.',
    }
  }
  if (name === 'board') {
    return {
      title: 'New board',
      description:
        'Start with a board to spread your issues and pull requests across customizable columns. Easily switch to a table or roadmap layout at any time.',
    }
  }
  if (name === 'roadmap') {
    return {
      title: 'New roadmap',
      description:
        'Start with a roadmap for a high-level visualization of your project over time. Easily switch to a table or board layout at any time.',
    }
  }

  return {title: '', description: ''}
}
