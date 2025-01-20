import {Breadcrumbs} from '@primer/react-brand'
import {getAnalyticsEvent} from '@github-ui/swp-core/lib/utils/analytics'
import {
  BreadcrumbSeoSchema,
  type BreadcrumbListItem,
} from '@github-ui/swp-core/components/structuredData/BreadcrumbSeoSchema'

type BreadcrumbProps = {
  items: BreadcrumbListItem[]
}

export const BreadcrumbsList = ({items}: BreadcrumbProps) => {
  return (
    <>
      <Breadcrumbs>
        {items.map(({name, url}, index) => {
          return (
            <Breadcrumbs.Item
              key={`${name}-${index}`}
              href={url}
              {...getAnalyticsEvent({
                action: name,
                tag: 'link',
                context: 'breadcrumb',
                location: 'header',
              })}
              data-ref={`article-breadcrumb-link-${name}`}
            >
              {name}
            </Breadcrumbs.Item>
          )
        })}
      </Breadcrumbs>
      <BreadcrumbSeoSchema items={items} />
    </>
  )
}
