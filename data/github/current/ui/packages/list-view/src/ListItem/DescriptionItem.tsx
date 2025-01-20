import {testIdProps} from '@github-ui/test-id-props'
import {Box, type BoxProps} from '@primer/react'
import {clsx} from 'clsx'
import {useEffect, useRef} from 'react'

import {useListViewVariant} from '../ListView/VariantContext'
import type {StylableProps} from '../types'
import {useListItemDescription} from './DescriptionContext'
import styles from './DescriptionItem.module.css'

export function ListItemDescriptionItem({children, className, ...props}: Omit<BoxProps, 'sx'> & StylableProps) {
  const {variant} = useListViewVariant()
  const {setDescription} = useListItemDescription()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current) {
      // Compose the ListItem description from the aria-label property of the DescriptionItem children
      const childrenAriaLabels = ref.current?.querySelectorAll('[aria-label]')
      let description = Array.from(childrenAriaLabels).reduce((metadataLabel: string, element: Element) => {
        return metadataLabel + element.getAttribute('aria-label')?.trim()
      }, '')
      if (!description && ref.current.textContent) description = ref.current.textContent.trim()
      setDescription(description)
    }
  }, [setDescription])

  return (
    <Box
      ref={ref}
      {...testIdProps('list-view-item-descriptionitem')}
      {...props}
      className={clsx(styles.default, variant === 'compact' && styles.compact, className)}
    >
      {children}
    </Box>
  )
}
