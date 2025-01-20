import {useRoadmapShowMarkersHeader} from './use-roadmap-show-markers-header'

const ROADMAP_HEADER_MARKERS_HEIGHT = 88
const ROADMAP_HEADER_DEFAULT_HEIGHT = 64

export const useRoadmapHeaderHeight = () => {
  const showMarkersHeader = useRoadmapShowMarkersHeader()

  return showMarkersHeader ? ROADMAP_HEADER_MARKERS_HEIGHT : ROADMAP_HEADER_DEFAULT_HEIGHT
}
