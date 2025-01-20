import {documentToReactComponents} from '@contentful/rich-text-react-renderer'
import {BLOCKS} from '@contentful/rich-text-types'
import {Card, type ImageAspectRatio} from '@primer/react-brand'

import type {PrimerComponentCard} from '../../../schemas/contentful/contentTypes/primerComponentCard'
import {getPrimerIcon} from '../../../lib/utils/icons'

export type ContentfulCardProps = {
  component: PrimerComponentCard

  /**
   * The props below do not have a corresponding field in Contentful:
   */
  hasBorder?: boolean
  className?: string
  fullWidth?: boolean
  imageAspectRatio?: ImageAspectRatio
}

export const ContentfulCard = ({
  component,
  hasBorder = false,
  fullWidth = false,
  imageAspectRatio,
  className,
}: ContentfulCardProps) => {
  const Octicon = getPrimerIcon(component.fields.icon)
  const image = component.fields.image
  const iconColor = component.fields.iconColor || 'default'
  const hasBackground = component.fields.iconBackground
  const variant = component.fields.variant

  return (
    <Card
      data-ref={`card-action-${component.sys.id}`}
      href={component.fields.href}
      ctaText={component.fields.ctaText}
      className={className}
      hasBorder={hasBorder}
      fullWidth={fullWidth}
      variant={variant}
    >
      {Octicon && (
        <Card.Icon
          data-testid={`${component.fields.icon}-${component.fields.href}`}
          icon={<Octicon />}
          color={iconColor}
          hasBackground={hasBackground}
        />
      )}

      <Card.Heading>{component.fields.heading}</Card.Heading>

      {image ? (
        <Card.Image
          src={`${image.fields.file.url}?w=800`}
          alt={image.fields.description || ''}
          aspectRatio={imageAspectRatio}
        />
      ) : null}

      {component.fields.label && <Card.Label>{component.fields.label}</Card.Label>}

      {component.fields.description &&
        documentToReactComponents(component.fields.description, {
          renderNode: {
            [BLOCKS.PARAGRAPH]: (_, children: React.ReactNode) => <Card.Description>{children}</Card.Description>,
          },
        })}
    </Card>
  )
}
