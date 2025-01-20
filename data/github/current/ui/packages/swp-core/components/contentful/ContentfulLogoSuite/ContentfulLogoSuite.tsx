import {documentToReactComponents} from '@contentful/rich-text-react-renderer'
import {BLOCKS, INLINES} from '@contentful/rich-text-types'
import {InlineLink, LogoSuite, Text, Box, AnimationProvider} from '@primer/react-brand'

import type {PrimerComponentLogoSuite} from '../../../schemas/contentful/contentTypes/primerComponentLogoSuite'
import {Logo} from './Logo'

export type ContentfulLogoSuiteProps = {
  component: PrimerComponentLogoSuite
  shouldAnimate?: boolean
}

export function ContentfulLogoSuite({component, shouldAnimate = false}: ContentfulLogoSuiteProps) {
  const fields = component.fields
  const useMarquee = fields.marquee === 'slow' || fields.marquee === 'normal'
  const speed = fields.marquee === 'slow' || fields.marquee === 'normal' ? fields.marquee : 'normal'

  return (
    <AnimationProvider visibilityOptions={0.5}>
      <LogoSuite align={fields.align || 'center'} hasDivider={fields.hasDivider}>
        <LogoSuite.Heading visuallyHidden={Boolean(fields.visuallyHideHeading)}>{fields.heading}</LogoSuite.Heading>
        {component.fields.description ? (
          <LogoSuite.Description>
            {documentToReactComponents(component.fields.description, {
              renderNode: {
                [BLOCKS.PARAGRAPH]: (_, children) => <Text>{children}</Text>,
                [INLINES.HYPERLINK]: (node, children) => <InlineLink href={node.data.uri}>{children}</InlineLink>,
              },
            })}
          </LogoSuite.Description>
        ) : null}
        <LogoSuite.Logobar variant={fields.variant || 'emphasis'} marqueeSpeed={speed} marquee={useMarquee}>
          {fields.logos.map(logo =>
            shouldAnimate ? <AnimatedLogo logo={logo} key={logo} /> : <Logo key={logo} name={logo} />,
          )}
        </LogoSuite.Logobar>
      </LogoSuite>
    </AnimationProvider>
  )
}

const AnimatedLogo = ({logo}: {logo: string}) => {
  return (
    <Box animate="slide-in-right">
      <Logo name={logo} />
    </Box>
  )
}
