/* eslint filenames/match-regex: off */
import {documentToReactComponents} from '@contentful/rich-text-react-renderer'
import type {Document} from '@contentful/rich-text-types'
import {BLOCKS, INLINES} from '@contentful/rich-text-types'
import {
  Box,
  Grid,
  Heading,
  InlineLink,
  Label,
  OrderedList,
  Stack,
  Text,
  ThemeProvider,
  UnorderedList,
} from '@primer/react-brand'

import GlowCircleBackground from './components/Background/GlowCircleBackground'
import type {ContactSalesPage} from '../../lib/types/contentful'
import {Highlight} from './components/Highlight'
import {ContactSalesForm} from './components/Form'

type ContactSalesTemplateProps = {
  page: ContactSalesPage
}

export function ContactSalesTemplate({page}: ContactSalesTemplateProps) {
  const {
    fields: {template},
  } = page

  return (
    <ThemeProvider
      className="ContactSales__Page position-relative ws-pre-wrap"
      colorMode="dark"
      style={{backgroundColor: 'var(--brand-color-canvas-default)'}}
    >
      <Grid fullWidth className="ContactSales__DesktopBackground height-full position-absolute p-0">
        <GlowCircleBackground branding={template.fields.branding} />

        <Grid.Column span={{xsmall: 12, medium: 6}} start={{xsmall: 1, medium: 7}} className="position-relative">
          <ThemeProvider
            className="height-full"
            colorMode={page.fields.settings?.fields.colorMode ?? 'light'}
            style={{backgroundColor: 'var(--brand-color-canvas-default)'}}
          />
        </Grid.Column>
      </Grid>

      <Grid className="position-relative p-0 mt-0">
        <Grid.Column span={{medium: 6}}>
          <Box
            padding={24}
            paddingBlockStart={{narrow: 64, regular: 128, wide: 48}}
            paddingBlockEnd={{narrow: 24, regular: 80}}
            marginBlockStart={{wide: 128}}
            className="pr-xl-0 position-sticky top-0"
          >
            <Stack direction="vertical" gap="none" padding="none" alignItems="flex-start">
              <Stack direction="vertical" padding="none" gap={16} alignItems="flex-start">
                {template.fields.label && <Label>{template.fields.label}</Label>}

                <Heading as="h1" size="3" className="mb-4">
                  {template.fields.headline}
                </Heading>
              </Stack>

              {template.fields.body ? (
                <Stack direction="vertical" gap={'none'} padding="none" alignItems="flex-start">
                  {documentToReactComponents(template.fields.body, {
                    renderNode: {
                      [BLOCKS.HEADING_2]: (_, children) => (
                        <Heading as="h2" className="pb-2 pt-6" size="subhead-medium">
                          {children}
                        </Heading>
                      ),
                      [BLOCKS.PARAGRAPH]: (_, children) => (
                        <Text as="p" className="mb-4">
                          {children}
                        </Text>
                      ),
                      [BLOCKS.UL_LIST]: node => {
                        const unTagged = documentToReactComponents(node as Document, {
                          renderNode: {
                            [BLOCKS.UL_LIST]: (_, children) => children,
                            [BLOCKS.PARAGRAPH]: (_, children) => children,
                            [BLOCKS.LIST_ITEM]: (_, children) => (
                              <UnorderedList.Item leadingVisualFill="#A371F7">{children}</UnorderedList.Item>
                            ),
                          },
                        })
                        return (
                          <UnorderedList variant="checked" className="mb-4">
                            {unTagged}
                          </UnorderedList>
                        )
                      },
                      [BLOCKS.OL_LIST]: node => {
                        const unTagged = documentToReactComponents(node as Document, {
                          renderNode: {
                            [BLOCKS.OL_LIST]: (_, children) => children,
                            [BLOCKS.PARAGRAPH]: (_, children) => children,
                            [BLOCKS.LIST_ITEM]: (_, children) => <OrderedList.Item>{children}</OrderedList.Item>,
                          },
                        })
                        return <OrderedList className="mb-4">{unTagged}</OrderedList>
                      },
                      [INLINES.HYPERLINK]: (node, children) => <InlineLink href={node.data.uri}>{children}</InlineLink>,
                    },
                  })}
                </Stack>
              ) : null}

              {template.fields.highlight ? <Highlight entry={template.fields.highlight} /> : null}
            </Stack>
          </Box>
        </Grid.Column>

        <Grid.Column span={{medium: 6}} start={{xlarge: 8}}>
          <ThemeProvider
            colorMode={page.fields.settings?.fields.colorMode ?? 'light'}
            style={{backgroundColor: 'var(--brand-color-canvas-default)'}}
          >
            <Box
              padding={24}
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
              className="pl-xl-0"
            >
              <ContactSalesForm />
            </Box>
          </ThemeProvider>
        </Grid.Column>
      </Grid>
    </ThemeProvider>
  )
}
