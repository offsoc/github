import {AnchorNav} from '@primer/react-brand'
import type {PrimerComponentAnchorNav} from '../../../schemas/contentful/contentTypes/primerComponentAnchorNav'

export type ContentfulAnchorNavProps = {
  component: PrimerComponentAnchorNav

  /**
   * The props below do not have a corresponding field in Contentful:
   */
  className?: string
}

export const ContentfulAnchorNav = ({component, className = 'py-3'}: ContentfulAnchorNavProps) => {
  const {links, action} = component.fields
  return (
    <AnchorNav className={className}>
      {links.map(item => (
        <AnchorNav.Link
          key={item.fields.id}
          href={`#${item.fields.id}`}
          aria-label={`Jump to ${item.fields.text}`}
          data-testid={`${item.fields.id}-anchor-link`}
        >
          {item.fields.text}
        </AnchorNav.Link>
      ))}

      {action && <AnchorNav.Action href={action.fields.href}>{action.fields.text}</AnchorNav.Action>}
    </AnchorNav>
  )
}
