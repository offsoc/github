import {testIdProps} from '@github-ui/test-id-props'
import {clsx} from 'clsx'

import type {ListViewSectionFilterLinks} from './SectionFilterLink'
import styles from './SectionFilters.module.css'

type ListViewSectionFiltersProps = {
  links: ListViewSectionFilterLinks
}

export const ListViewSectionFilters = ({links}: ListViewSectionFiltersProps) => {
  if (links.length < 1) return null

  return (
    <div {...testIdProps('list-view-section-filters')}>
      <ul className={clsx('list-style-none', styles.container)}>
        {links.map((sectionFilterLink, index) => (
          <li key={`section-filter-${index}`} {...testIdProps(`list-view-section-filter-${index}`)}>
            {sectionFilterLink}
          </li>
        ))}
      </ul>
    </div>
  )
}
