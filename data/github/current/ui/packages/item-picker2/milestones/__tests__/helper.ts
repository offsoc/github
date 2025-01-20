export const MockMilestone = (index: number) => {
  return {
    id: `milestone-${index}`,
    title: `milestone ${index}`,
    state: 'OPEN',
  }
}

export const mockMilestonesResolvers = (itemsCount: number = 4, hasSelectedMilestone: boolean = true) => ({
  Repository() {
    return {
      issue: {
        milestone: hasSelectedMilestone ? MockMilestone(0) : null,
      },
      milestones: {
        edges: Array.from({length: itemsCount}, (_, index) => MockMilestone(index)).map(node => ({node})),
      },
    }
  },
})
