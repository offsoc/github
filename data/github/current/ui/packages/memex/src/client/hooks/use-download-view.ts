import {useCallback} from 'react'

import {useSearch} from '../components/filter-bar/search-context'
import {useCopyPaste} from '../components/react_table/hooks/use-copy-paste'
import {ContentType} from '../platform/content-type'
import {useProjectDetails} from '../state-providers/memex/use-project-details'
import {useMemexItems} from '../state-providers/memex-items/use-memex-items'
import {useViews} from './use-views'

const escapeFileName = (str: string) => str.replace(/[\\/:"*?<>|]/g, '')

export const useDownloadView = () => {
  const {itemsToCsv} = useCopyPaste()
  const {currentView} = useViews()
  const {matchesSearchQuery} = useSearch()
  const {items} = useMemexItems()
  const projectName = useProjectDetails().title

  return useCallback(() => {
    if (!currentView) return

    const visibleItems = items.filter(item => matchesSearchQuery(item))
    const content = itemsToCsv(visibleItems, {withHeaders: true})
    if (!content) return

    const name = `${escapeFileName(projectName)} - ${escapeFileName(currentView.name)}.tsv`
    const blob = new Blob([content], {
      type: ContentType.CSV,
    })

    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.style.display = 'none'
    a.href = url
    a.download = name
    document.body.appendChild(a)
    a.click()

    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }, [currentView, items, itemsToCsv, matchesSearchQuery, projectName])
}
