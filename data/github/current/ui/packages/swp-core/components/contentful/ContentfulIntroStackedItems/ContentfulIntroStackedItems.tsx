import {Box, Grid, Heading, Link, Stack, Text} from '@primer/react-brand'
import {BLOCKS, MARKS, type Document} from '@contentful/rich-text-types'
import {documentToReactComponents, type Options} from '@contentful/rich-text-react-renderer'
import type {IntroStackedItems} from '../../../schemas/contentful/contentTypes/introStackedItems'
import styles from './ContentfulIntroStackedItems.module.css'

type StackedItemProps = {
  content: Document
}

const StackedItem = ({content}: StackedItemProps) => {
  const option: Options = {
    renderNode: {
      [BLOCKS.PARAGRAPH]: (_, children) => {
        return children
      },
    },
    renderMark: {
      [MARKS.BOLD]: children => <Text variant="default">{children}</Text>,
    },
  }
  return <>{documentToReactComponents(content, option)}</>
}

export function ContentfulIntroStackedItems({component}: {component: IntroStackedItems}) {
  const {headline, items, link} = component.fields

  return (
    <Box marginBlockEnd={40}>
      <Grid>
        <Grid.Column span={{medium: 5}}>
          <Box className={styles.sectionIntro}>
            <Box marginBlockEnd={24}>
              <Heading as="h2" size="3">
                {headline}
              </Heading>
            </Box>

            {link && <Link href={link.fields.href}>{link.fields.text}</Link>}
          </Box>
        </Grid.Column>
        <Grid.Column span={{medium: 6}} start={{medium: 7}}>
          <Stack direction="vertical" padding="none" gap={24}>
            {items.map(item => (
              <Text key={item.sys.id} as="p" variant="muted">
                <StackedItem content={item.fields.text} />
              </Text>
            ))}
          </Stack>
        </Grid.Column>
      </Grid>
    </Box>
  )
}
