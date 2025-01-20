import {Bento, Box, Link} from '@primer/react-brand'
import type {FeaturedBentoType} from '../../../schemas/contentful/contentTypes/featuredBento'
import {getPrimerIcon} from '../../../lib/utils/icons'
import {BLOCKS, MARKS} from '@contentful/rich-text-types'
import {documentToReactComponents} from '@contentful/rich-text-react-renderer'

type BentoHeadingProps = React.ComponentProps<typeof Bento.Heading>
type BentoItemProps = React.ComponentProps<typeof Bento.Item>
type BentoContentrops = React.ComponentProps<typeof Bento.Content>
type LinkProps = React.ComponentProps<typeof Link>
type BoxProps = React.ComponentProps<typeof Box>
type ContentfulFeaturedBentoProps = {
  itemFlow?: BentoItemProps['flow']
  itemRowSpan?: BentoItemProps['rowSpan']
  contentPadding?: BentoContentrops['padding']
  component: FeaturedBentoType
  linkSize?: LinkProps['size']
  boxPaddingBlockEnd?: BoxProps['paddingBlockEnd']
  boxPaddingBlockStart?: BoxProps['paddingBlockStart']
  headingSize?: BentoHeadingProps['size']
}

export function ContentfulFeaturedBento({
  component,
  itemFlow = {
    xsmall: 'row',
    small: 'row',
    medium: 'column',
    large: 'column',
    xlarge: 'column',
    xxlarge: 'column',
  },
  itemRowSpan = 5,
  contentPadding = {
    xsmall: 'normal',
    small: 'spacious',
  },
  linkSize = 'medium',
  boxPaddingBlockEnd = 128,
  boxPaddingBlockStart = 64,
  headingSize = '4',
}: ContentfulFeaturedBentoProps) {
  const {heading, link, icon, image, iconColor} = component.fields
  const Octicon = getPrimerIcon(icon)
  const extraContentProps = Octicon ? {leadingVisual: <Octicon fill={iconColor} />} : {}
  const extraLinkProps = link.fields.openInNewTab
    ? {
        target: '_blank',
      }
    : {}
  return (
    <Box paddingBlockEnd={boxPaddingBlockEnd} paddingBlockStart={boxPaddingBlockStart}>
      <Bento>
        <Bento.Item flow={itemFlow} rowSpan={itemRowSpan}>
          <Bento.Content padding={contentPadding} {...extraContentProps}>
            <Bento.Heading size={headingSize}>
              {documentToReactComponents(heading, {
                renderNode: {
                  [BLOCKS.PARAGRAPH]: (_, children) => children,
                },
                renderMark: {
                  [MARKS.ITALIC]: (text: React.ReactNode) => <em>{text}</em>,
                },
              })}
            </Bento.Heading>
            <Link size={linkSize} href={link.fields.href} variant="default" {...extraLinkProps}>
              {link.fields.text}
            </Link>
          </Bento.Content>
          {image ? (
            <Bento.Visual position="50% 100%" padding="normal">
              <img alt={image.fields.description} src={image.fields.file.url} />
            </Bento.Visual>
          ) : null}
        </Bento.Item>
      </Bento>
    </Box>
  )
}
