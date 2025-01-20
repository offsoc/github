# SWP Core Library and Storybook

SWP maintains the [SWP Core Library](https://github.com/github/github/tree/master/ui/packages/swp-core) that wraps Primer Brand components using Contentful schemas to allow for a statically-typed Contentful-aware approach to building out our FE templates.

Each component within the library consumes a Primer Brand component, along with any relevant sub-components and style tweaks that are necessary to match the expected design for our templates.

This library exports individual React components using the `Contentful` prefix, some useful utilities, and each of the static types that go along with the Contentful React components.

## Schema modeling

Schemas for Contentful content types are created manually using the Zod npm module, and then exported as a TS type using `z.infer<typeof T>`. A typical schema file might look [like this](https://github.com/github/github/blob/master/ui/packages/swp-core/schemas/contentful/contentTypes/primerComponentAnchorNav.ts):

```ts
// import Zod, utility functions, related schemas
import {z} from 'zod'
import {buildEntrySchemaFor} from '../entry'
import {PrimerComponentAnchorLinkSchema} from './primerComponentAnchorLink'
import {LinkSchema} from './link'

// fields object that corresponds to expected values from Contentful
export const PrimerComponentAnchorNavSchema = buildEntrySchemaFor('primerComponentAnchorNav', {
  fields: z.object({
    links: z.array(PrimerComponentAnchorLinkSchema),
    action: LinkSchema.optional(),
  }),
})

// TS type to be used to model props for React component
export type PrimerComponentAnchorNav = z.infer<typeof PrimerComponentAnchorNavSchema>
```

## Using schemas in React components

Once we have used Zod to create a static type for our expected Contentful schema, we import that type and compose it with other component props. We then write a new React component using the composed type and Primer Brand component along with custom styles and sub-components.

For an example, the SWP Core library is consuming the Primer Brand `AnchorNav` component to map our Contentful schema and other props into [`ContentfulAnchorNav`](https://github.com/github/github/blob/master/ui/packages/swp-core/components/contentful/ContentfulAnchorNav/ContentfulAnchorNav.tsx):

```tsx
// import Primer Brand component and Zod/Contentful Schema
import {AnchorNav} from '@primer/react-brand'
import type {PrimerComponentAnchorNav} from '../../../schemas/contentful/contentTypes/primerComponentAnchorNav'

// compose our prop types together
export type ContentfulAnchorNavProps = {
  component: PrimerComponentAnchorNav

  /**
   * The props below do not have a corresponding field in Contentful:
   */
  className?: string
}

// export Contentful-ified implementation of Primer Brand AnchorNav
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

```

## Adding and Updating Contentful Schemas

When a new Contentful content type is created, or an old one is modified, it will change the expected schema of the props received by the consuming React template. As such, it's the responsibility of MPS engineers to maintain the fields and structure of Contentful content types, and to update this package when content types are added or updated.

Presently, schemas are created by hand. When adding a new content type, create a new file for the type in [/contentTypes](https://github.com/github/github/blob/master/ui/packages/swp-core/schemas/contentful/contentTypes/). Documentation for Zod can be [found here](https://zod.dev/).

Because our Contentful content type migrations are done through a different release process in a [separate repository](https://github.com/github/contentful), be mindful when deprecating schema fields or types.

After modifications have been made, be sure that your relevant components, utils, and schemas are being exported from the SWP-Core [package.json file](https://github.com/github/github/blob/master/ui/packages/swp-core/package.json).

## Viewing in Storybook

Currently no project-level storybook deployment or script exists, but the SWP-Core library storybook can be viewed by running `bin/npm run storybook` from the root in `github/github`.

Once storybook builds, the components can be found at `Others/Mkt/Swp/Contentful`.
