import CopilotIconAnimation from '@github-ui/copilot-chat/CopilotIconAnimation'
import {CopilotIcon} from '@primer/octicons-react'
import {Link, LinkButton} from '@primer/react'
import {Banner} from '@primer/react/experimental'

import styles from './Unlicensed.module.css'

export function Unlicensed() {
  return (
    <div className={styles.Container}>
      <div className={styles.Top}>
        <CopilotIconAnimation />
      </div>
      <div className={styles.Bottom}>
        <Banner
          variant="upsell"
          title="Upgrade"
          hideTitle
          icon={<CopilotIcon />}
          description={<span>Accelerate your development speed with Copilot</span>}
          primaryAction={
            <LinkButton as="a" href="https://github.com/features/copilot#pricing">
              Upgrade
            </LinkButton>
          }
        />
        <p className={styles.Info}>
          Discover all the{' '}
          <Link href="https://github.com/features/copilot" inline>
            benefits
          </Link>{' '}
          of the world’s leading AI developer tool.
        </p>
      </div>
    </div>
  )
}
