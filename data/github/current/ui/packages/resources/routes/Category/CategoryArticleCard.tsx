import {Box, Card} from '@primer/react-brand'
import {BLOCKS, type Document} from '@contentful/rich-text-types'
import {documentToReactComponents, type Options} from '@contentful/rich-text-react-renderer'
import styles from './CategoryPage.module.css'
import {getAnalyticsEvent} from '@github-ui/swp-core/lib/utils/analytics'

type CategoryArticleCardProps = {
  path: string
  imageUrl?: string
  imageDescription?: string
  title: string
  excerpt: Document
  analyticsId: string
}

type ExcerptProps = {
  content: Document
}

const Excerpt = ({content}: ExcerptProps) => {
  const option: Options = {
    renderNode: {
      [BLOCKS.PARAGRAPH]: (_, children) => {
        return children
      },
    },
  }

  return <>{documentToReactComponents(content, option)}</>
}

export function CategoryArticleCard({
  path,
  imageUrl,
  imageDescription,
  title,
  excerpt,
  analyticsId,
}: CategoryArticleCardProps) {
  return (
    <Box animate="fade-in">
      <Card
        {...getAnalyticsEvent({
          action: 'learn_more',
          tag: 'card',
          context: title,
          location: 'resource_category_cards',
        })}
        data-ref={`article-card-${analyticsId}`}
        href={path}
        variant="minimal"
        className={styles.articleCard}
        fullWidth
      >
        <Card.Image
          src={
            imageUrl ? `${imageUrl}?w=1000&fm=jpg&fl=progressive` : '/images/modules/site/contentful/default/md.webp'
          }
          alt={imageDescription || ''}
          className={styles.articleCardImage}
        />
        <Card.Heading>{title}</Card.Heading>
        <Card.Description>
          <Excerpt content={excerpt} />
        </Card.Description>
      </Card>
    </Box>
  )
}
