import {PipelineBanner} from './PipelineBanner'

export function PipelineBannerListItem() {
  // Not wrapping this in a li will raise an a11y error since all children of a ul should be li elements
  // The exception being if role="listitem" is set, but it can't be set to that on a <section /> element.
  return (
    <li>
      <PipelineBanner isListItem />
    </li>
  )
}
