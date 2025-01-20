import {Stack} from '@primer/react/drafts'

import styles from './LabelWithLink.module.css'

interface LabelWithLinkProps {
  label: React.ReactNode
  link?: React.ReactNode
}

/** Render a `Label` with an optional link adjacent. */
export const LabelWithLink = ({label, link}: LabelWithLinkProps) => (
  <>
    {link ? (
      <Stack direction="horizontal" gap="condensed" align="baseline" className={styles.labelWithLink}>
        {label} {link}
      </Stack>
    ) : (
      label
    )}
  </>
)
