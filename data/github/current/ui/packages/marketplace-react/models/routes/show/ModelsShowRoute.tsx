import {useSearchParams} from '@github-ui/use-navigate'
import type React from 'react'
import {useEffect, useState} from 'react'
import {ModelLayout, type ModelLayoutTab} from '../playground/components/GettingStartedDialog/ModelLayout'
import {Evaluation} from './components/Evaluation'
import {ModelsPlaygroundRoute} from '../playground/ModelsPlaygroundRoute'
import {Readme} from './components/Readme'
import {License} from './components/License'
import {Transparency} from './components/Transparency'

export function ModelsShowRoute() {
  const [searchParams] = useSearchParams()
  const selectedTabFromUrl = (searchParams.get('tab') || 'readme') as ModelLayoutTab
  const [selectedTab, setSelectedTab] = useState<ModelLayoutTab>(selectedTabFromUrl)

  const selectTab = (
    tab: ModelLayoutTab,
    e: React.KeyboardEvent<HTMLAnchorElement> | React.MouseEvent<HTMLAnchorElement, MouseEvent>,
  ) => {
    const url = new URL('', window.location.href)
    url.searchParams.set('tab', tab)
    history.pushState(null, '', url)
    setSelectedTab(tab)
    e.preventDefault()
  }

  // When using browser back/forward, set state from popstate
  useEffect(() => {
    function handlePopState() {
      setSelectedTab((searchParams.get('tab') || 'readme') as ModelLayoutTab)
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [searchParams])

  const renderTab = (tab: ModelLayoutTab): JSX.Element => {
    switch (tab) {
      case 'readme':
        return <Readme />
      case 'evaluation':
        return <Evaluation />
      case 'license':
        return <License />
      case 'transparency':
        return <Transparency />
      case 'playground':
        return <ModelsPlaygroundRoute />
    }
  }

  return (
    <ModelLayout activeTab={selectedTab} selectTab={selectTab}>
      {renderTab(selectedTab)}
    </ModelLayout>
  )
}
