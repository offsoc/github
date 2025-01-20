import {createContext, useContext} from 'react'

type RoadmapDateFieldsMenuContextValue = {
  /* Whether the date fields configuration menu is open */
  isDateConfigurationMenuOpen: boolean

  /* Toggles the date fields configuration menu */
  setOpenDateConfigurationMenu: (isOpen: boolean) => void
}
export const RoadmapDateFieldsMenuContext = createContext<RoadmapDateFieldsMenuContextValue | null>(null)

export const useRoadmapDateFieldsMenu = () => {
  const context = useContext(RoadmapDateFieldsMenuContext)
  if (context === null) {
    throw new Error('useRoadmapDateFieldsMenu must be used within a RoadmapDateFieldsMenuContext')
  }

  return context
}
