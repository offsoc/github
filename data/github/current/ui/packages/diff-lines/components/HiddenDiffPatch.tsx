import {clsx} from 'clsx'
import {Button, Link} from '@primer/react'
import styles from './HiddenDiffPatch.module.css'

function HiddenDiffPatch({
  children,
  helpText,
  helpUrl,
  onLoadDiff,
}: React.PropsWithChildren<{helpText?: string; helpUrl?: string; onLoadDiff: () => void}>) {
  const showLink = helpUrl && helpText
  return (
    <div className="px-3 py-4 fgColor-muted">
      <div className={clsx(styles.gridColumnTemplate)}>
        <svg
          aria-hidden
          height="84"
          style={{maxWidth: '340px'}}
          viewBox="0 0 340 84"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            clipPath="url(#diff-placeholder)"
            d="M0 0h340v84H0z"
            fillRule="evenodd"
            style={{fill: 'var(--bgColor-muted, var(--color-canvas-subtle))'}}
          />
        </svg>{' '}
        <div className="d-flex flex-justify-center flex-column flex-column text-center">
          <Button className="h4 mx-auto" variant={'invisible'} onClick={() => onLoadDiff()}>
            Load Diff
          </Button>
          <span className="fgColor-muted mt-1">
            {children}
            {showLink && (
              <Link inline={true} href={helpUrl}>
                {helpText}
              </Link>
            )}
          </span>
        </div>
      </div>
    </div>
  )
}

export default HiddenDiffPatch
