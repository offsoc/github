import {useRoadmapIterationMarkersSize, useRoadmapMilestoneMarkersSize} from '../components/roadmap-markers-in-range'

// The marker header is only shown if there are iterations or milestones as they're the only markers that have a header.
export const useRoadmapShowMarkersHeader = () => {
  const milestonesCount = useRoadmapMilestoneMarkersSize()
  const iterationsCount = useRoadmapIterationMarkersSize()

  return iterationsCount > 0 || milestonesCount > 0
}
