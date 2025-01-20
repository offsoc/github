// eslint-disable-next-line import/no-namespace
import * as Primer from '@primer/octicons-react'

import {documentToReactComponents} from '@contentful/rich-text-react-renderer'
import {BLOCKS} from '@contentful/rich-text-types'

import {Pillar, Box} from '@primer/react-brand'
import type {PrimerComponentPillar} from '../../../schemas/contentful/contentTypes/primerComponentPillar'

const toTitleCase = (str: string) => {
  return `${str
    .toLowerCase()
    .split('-')
    .map(function (word) {
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join('')}Icon`
}

const nameToPrimerIcon = (name: string = ''): Primer.Icon | undefined => {
  const titleCaseName = toTitleCase(name)
  const iconMap: {[key: string]: Primer.Icon} = Primer
  return iconMap[titleCaseName] ? iconMap[titleCaseName] : undefined
}

export type ContentfulPillarProps = {
  component: PrimerComponentPillar

  /**
   * The props below do not have a corresponding field in Contentful:
   */
  className?: string
  asCard?: boolean
}

export const ContentfulPillarContent = ({component: {fields}, className, asCard}: ContentfulPillarProps) => {
  const {align, icon, heading, description, link} = fields
  const Octicon = nameToPrimerIcon(icon)

  return (
    <Pillar className={className} align={align}>
      {Octicon && <Pillar.Icon data-testid={`${icon}-${heading}`} icon={<Octicon />} />}

      <Pillar.Heading>{heading}</Pillar.Heading>

      {documentToReactComponents(description, {
        renderNode: {
          [BLOCKS.PARAGRAPH]: (_, children: React.ReactNode) => (
            <Pillar.Description className={asCard && !link ? 'mb-0' : ''}>{children}</Pillar.Description>
          ),
        },
      })}

      {link && (
        <Pillar.Link href={link.fields.href} data-ref={`pillar-link-${link.sys.id}`}>
          {link.fields.text}
        </Pillar.Link>
      )}
    </Pillar>
  )
}

export const ContentfulPillar = ({component, className, asCard}: ContentfulPillarProps) => {
  return asCard ? (
    <Box
      borderRadius="large"
      paddingBlockStart={32}
      paddingBlockEnd={40}
      backgroundColor="subtle"
      style={{height: '100%', paddingInlineStart: 32, paddingInlineEnd: 32}}
    >
      <ContentfulPillarContent component={component} className={className} asCard />
    </Box>
  ) : (
    <ContentfulPillarContent component={component} className={className} />
  )
}
