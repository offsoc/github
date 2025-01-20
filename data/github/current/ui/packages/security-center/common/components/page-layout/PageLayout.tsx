import {Box, PageLayout as PrimerPageLayout} from '@primer/react'
import {useSlots} from '@primer/react/drafts'
import type React from 'react'

import Banners from './Banners'
import Content from './Content'
import DatePicker from './DatePicker'
import ExportButton from './ExportButton'
import Filter from './Filter'
import FilterBar from './FilterBar'
import FilterRevert from './FilterRevert'
import Footer from './Footer'
import Header from './Header'
import LimitedRepoWarning from './LimitedRepoWarning'
import Nav from './Nav'

type Props = unknown

function PageLayout({children}: React.PropsWithChildren<Props>): JSX.Element {
  const [slots] = useSlots(children, {
    banners: Banners,
    header: Header,
    filterBar: FilterBar,
    exportButton: ExportButton,
    limitedRepoWarning: LimitedRepoWarning,
    nav: Nav,
    content: Content,
    footer: Footer,
  })

  return (
    <PrimerPageLayout sx={{padding: 'none'}}>
      <PrimerPageLayout.Header>
        {slots.banners}
        {slots.header}
      </PrimerPageLayout.Header>
      <PrimerPageLayout.Content as="div">
        {(slots.filterBar || slots.exportButton) && (
          <Box className="d-flex flex-justify-between mb-4" sx={{gap: '1em'}}>
            {slots.filterBar}
            {slots.exportButton}
          </Box>
        )}
        {slots.limitedRepoWarning}
        {slots.nav}
        {slots.content}
      </PrimerPageLayout.Content>
      <PrimerPageLayout.Footer sx={{padding: 'none'}}>{slots.footer}</PrimerPageLayout.Footer>
    </PrimerPageLayout>
  )
}

PageLayout.Banners = Banners
PageLayout.Header = Header
PageLayout.FilterBar = FilterBar
PageLayout.Filter = Filter
PageLayout.DatePicker = DatePicker
PageLayout.FilterRevert = FilterRevert
PageLayout.ExportButton = ExportButton
PageLayout.LimitedRepoWarning = LimitedRepoWarning
PageLayout.Nav = Nav
PageLayout.Content = Content
PageLayout.Footer = Footer

export default PageLayout
