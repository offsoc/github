import styles from '../marketplace.module.css'
import {Box, Heading} from '@primer/react'
import {ArrowUpRightIcon} from '@primer/octicons-react'

export function CallToActionItem() {
  return (
    <Box
      sx={{
        position: 'relative',
        backgroundColor: 'var(--bgColor-upsell-muted)',
        border: '1px solid var(--borderColor-upsell-muted)',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        p: 3,
        boxShadow: 'var(--shadow-resting-small, var(--color-shadow-small))',
        transition: 'background-color .3s',
        ':hover': {
          cursor: 'pointer',
          backgroundColor: 'var(--borderColor-upsell-muted)',
        },
      }}
    >
      <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
        <Heading as="h3" className="f4">
          <a href={'/marketplace/models/waitlist'} className={`${styles['marketplace-item-link']}`}>
            Get early access to our playground for models
          </a>
        </Heading>
        <ArrowUpRightIcon />
      </Box>
      <p className="mt-2 mb-auto text-small fgColor-muted">
        Join our limited beta waiting list today and be among the first to try out an easy way to test models.
      </p>
    </Box>
  )
}
