import {testIdProps} from '@github-ui/test-id-props'
import {clsx} from 'clsx'
import type {ReactElement} from 'react'

import type {NestedListViewHeaderSectionFilterLink} from './SectionFilterLink'
import styles from './SectionFilters.module.css'

export type NestedListViewHeaderSectionFiltersLinks = Array<ReactElement<typeof NestedListViewHeaderSectionFilterLink>>

type NestedListViewHeaderSectionFiltersProps = {
  links: NestedListViewHeaderSectionFiltersLinks
  className?: string
}

export const NestedListViewHeaderSectionFilters = ({links, className}: NestedListViewHeaderSectionFiltersProps) => {
  if (links.length < 1) return null

  return (
    <div {...testIdProps('nested-list-view-section-filters')}>
      <ul className={clsx(styles.list, className)}>
        {links.map((sectionFilterLink, index) => (
          <li key={`section-filter-${index}`} {...testIdProps(`nested-list-view-section-filter-${index}`)}>
            {sectionFilterLink}
          </li>
        ))}
      </ul>
    </div>
  )
}
