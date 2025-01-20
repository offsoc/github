import {Heading} from '@primer/react'
import styles from './MergeBoxSectionHeader.module.css'
import {clsx} from 'clsx'
import {ExpandableSectionIcon} from './ExpandableSectionIcon'

interface MergeBoxSectionHeaderProps {
  /**
   * The title of the section
   */
  title: JSX.Element | string | undefined
  /**
   * The optional title of the section
   */
  subtitle?: JSX.Element | string
  /**
   * An optional icon to display
   */
  icon?: JSX.Element
  /**
   * When passed, the section will be expandable and the toggle will render. This cannot be combined with `rightSideContent`.
   */
  expandableProps?: {
    isExpanded: boolean
    ariaLabel: string
    onToggle: () => void
  }
  /**
   * The content to render under the title and subtitle
   */
  children?: React.ReactNode
  /**
   * The content to render to the right of the title and subtitle
   */
  rightSideContent?: JSX.Element
}

/**
 * Shared header for sections in the merge box. When `expandableProps` is passed, the section will be expandable and the toggle will render. This cannot be combined with `rightSideContent`.
 */
export const MergeBoxSectionHeader = ({
  title,
  subtitle,
  icon,
  expandableProps,
  children,
  rightSideContent,
}: MergeBoxSectionHeaderProps) => {
  if (expandableProps && rightSideContent) {
    throw new Error('MergeBoxSectionHeader: rightSideContent is not supported when expandableProps exist')
  }
  const {isExpanded, ariaLabel, onToggle} = expandableProps || {}

  return (
    <div
      className={clsx(
        styles.wrapper,
        expandableProps && styles.wrapperCanExpand,
        !expandableProps && `flex-column flex-sm-row flex-items-center flex-sm-items-start flex-justify-between`,
      )}
    >
      <div className="d-flex width-full">
        {icon && <div className="mr-2 flex-shrink-0">{icon}</div>}
        <div className="d-flex flex-1 flex-column flex-sm-row gap-2">
          <div className="flex-1">
            <Heading as="h3" sx={{fontSize: 2}}>
              {title}
            </Heading>
            <p className="fgColor-muted mb-0">{subtitle}</p>
            {children}
          </div>
          {rightSideContent}
        </div>
      </div>
      {expandableProps && (
        <>
          <button
            aria-label={ariaLabel}
            type="button"
            className={styles.button}
            onClick={onToggle}
            aria-expanded={isExpanded}
          />
          <div className="fgColor-muted pr-2 pt-2">
            <ExpandableSectionIcon isExpanded={Boolean(isExpanded)} />
          </div>
        </>
      )}
    </div>
  )
}
