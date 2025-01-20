export type BreadcrumbListItem = {
  name: string
  url: string
}

type BreadcrumbSeoSchemaProps = {
  items: BreadcrumbListItem[]
  dataTestId?: string
}

export const BreadcrumbSeoSchema = ({items, dataTestId}: BreadcrumbSeoSchemaProps) => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map(({name, url: item}, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name,
      item,
    })),
  }

  const jsonLd = JSON.stringify(structuredData)

  /* eslint-disable-next-line react/no-danger */
  return <script data-testid={dataTestId} type="application/ld+json" dangerouslySetInnerHTML={{__html: jsonLd}} />
}
