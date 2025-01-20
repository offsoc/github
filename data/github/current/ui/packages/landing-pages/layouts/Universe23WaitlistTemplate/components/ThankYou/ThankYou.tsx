import {documentToReactComponents} from '@contentful/rich-text-react-renderer'
import {BLOCKS, INLINES} from '@contentful/rich-text-types'
import {Box, Button, Heading, InlineLink, Stack, Text} from '@primer/react-brand'

import type {TemplateUniverse23Waitlist} from '../../../../lib/types/contentful'

type ThankYouProps = {
  template: TemplateUniverse23Waitlist
  userLoggedIn?: boolean
}

export function ThankYou({template, userLoggedIn}: ThankYouProps) {
  const DEFAULT_HEADLINE = 'Thank you for your interest'
  const DEFAULT_BODY = 'Your request was successfully sent.'
  const DEFAULT_CTA_TEXT = 'Start a free trial'
  const DEFAULT_CTA_HREF = 'https://github.com/enterprise/trial/start'

  const ctaContext = userLoggedIn
    ? template.fields.thankYouCta?.fields.text ?? DEFAULT_CTA_TEXT
    : template.fields.thankYouLoggedOutCta?.fields.text ?? DEFAULT_CTA_TEXT

  return (
    <Box
      padding={{
        narrow: 24,
        wide: 'none',
      }}
      paddingBlockStart={{
        narrow: 64,
        regular: 128,
        wide: 48,
      }}
      paddingBlockEnd={{
        narrow: 24,
        regular: 80,
      }}
      marginBlockStart={{
        wide: 128,
      }}
    >
      <Stack direction="vertical" alignItems="center" justifyContent="center" padding="none">
        <img src="/images/modules/site/landing-pages/universe-23-waitlist/check.png" width={64} alt="" />

        <Heading as="h2" size="5" style={{textAlign: 'center'}}>
          {template.fields.thankYouHeadline ?? DEFAULT_HEADLINE}
        </Heading>

        {template.fields.thankYouBody !== undefined ? (
          documentToReactComponents(template.fields.thankYouBody, {
            renderNode: {
              [BLOCKS.PARAGRAPH]: (_, children) => (
                <Text as="p" size="200" style={{color: 'var(--brand-color-text-subtle)', textAlign: 'center'}}>
                  {children}
                </Text>
              ),
              [INLINES.HYPERLINK]: (node, children) => <InlineLink href={node.data.uri}>{children}</InlineLink>,
            },
          })
        ) : (
          <Text as="p" size="200" style={{color: 'var(--brand-color-text-subtle)', textAlign: 'center'}}>
            {DEFAULT_BODY}
          </Text>
        )}
        <Button as="a" href={template.fields.thankYouCta?.fields.href ?? DEFAULT_CTA_HREF} className="mt-3">
          {ctaContext}
        </Button>
      </Stack>
    </Box>
  )
}
