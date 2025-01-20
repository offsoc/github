import {LABELS} from '../constants/labels'

export type NoResultsProps = {
  id?: string
  ariaLabel?: string
}

export const NoResults = ({id, ariaLabel}: NoResultsProps) => (
  <div id={id} className="blankslate" role="region" aria-label={ariaLabel} aria-live="polite" aria-atomic="true">
    <h3 className="blankslate-heading">{LABELS.noResultsTitle}</h3>
    <p>{LABELS.noResultsDescription}</p>
  </div>
)
