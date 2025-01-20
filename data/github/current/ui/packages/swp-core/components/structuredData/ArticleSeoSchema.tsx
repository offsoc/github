type ArticleSeoSchemaProps = {
  title: string
  imageUrl?: string
  dataTestId?: string
}

export const ArticleSeoSchema = ({title, imageUrl, dataTestId}: ArticleSeoSchemaProps) => {
  // The following image links are the aspect ratios 16:9, 4:3, and 1:1 that Google recommends.
  const imageLinks = imageUrl
    ? [
        `https:${imageUrl}?w=2560&h=1440&fm=webp`,
        `https:${imageUrl}?w=1280&h=960&fm=webp`,
        `https:${imageUrl}?w=1000&h=1000&fm=webp`,
      ]
    : undefined

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    image: imageLinks,
    publisher: {
      '@type': 'Organization',
      name: 'GitHub',
      logo: 'https://github.githubassets.com/images/modules/open_graph/github-logo.png',
    },
    author: {
      '@type': 'Organization',
      name: 'GitHub',
      url: 'https://www.github.com',
    },
  }

  const jsonLd = JSON.stringify(structuredData)

  /* eslint-disable-next-line react/no-danger */
  return <script data-testid={dataTestId} type="application/ld+json" dangerouslySetInnerHTML={{__html: jsonLd}} />
}
