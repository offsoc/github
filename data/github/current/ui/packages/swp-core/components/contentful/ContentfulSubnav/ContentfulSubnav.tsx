import {SubNav} from '@primer/react-brand'
import {useEffect, useState} from 'react'

import {isLink} from '../../../schemas/contentful/contentTypes/link'
import type {PrimerComponentSubnav} from '../../../schemas/contentful/contentTypes/primerComponentSubnav'
import {isCurrentLink} from './utils'

export type ContentfulSubnavProps = {
  component: PrimerComponentSubnav

  hasShadow?: boolean
  className?: string
  'data-color-mode'?: string
}

export function ContentfulSubnav({component, ...props}: ContentfulSubnavProps) {
  const [actualUrl, setActualUrl] = useState<string | undefined>(undefined)

  useEffect(() => {
    setActualUrl(window.location.href)
  }, [])

  return (
    <div data-color-mode={props['data-color-mode']}>
      <SubNav className={props.className} hasShadow={props.hasShadow}>
        <SubNav.Heading
          data-ref={`subnav-heading-link-${component.fields.heading.sys.id}`}
          href={component.fields.heading.fields.href}
        >
          {component.fields.heading.fields.text}
        </SubNav.Heading>

        {component.fields.links.map(linkOrLinkGroup => {
          if (isLink(linkOrLinkGroup)) {
            const {href, text} = linkOrLinkGroup.fields

            const isCurrent = isCurrentLink({url: href, actual: actualUrl})

            return (
              <SubNav.Link
                data-ref={`subnav-link-${linkOrLinkGroup.sys.id}`}
                key={linkOrLinkGroup.sys.id}
                href={href}
                {...(isCurrent ? {'aria-current': 'page'} : {})}
              >
                {text}
              </SubNav.Link>
            )
          }

          /**
           * If we're here, it means we have a link group.
           */
          const {heading, links = []} = linkOrLinkGroup.fields

          return (
            <SubNav.Link
              key={heading.sys.id}
              href={heading.fields.href}
              {...(isCurrentLink({url: heading.fields.href, actual: actualUrl}) ? {'aria-current': 'page'} : {})}
            >
              {heading.fields.text}

              {links.length > 0 && (
                <SubNav.SubMenu>
                  {links.map(link => (
                    <SubNav.Link
                      key={link.sys.id}
                      href={link.fields.href}
                      data-ref={`subnav-submenu-link-${link.sys.id}`}
                      {...(isCurrentLink({url: link.fields.href, actual: actualUrl}) ? {'aria-current': 'page'} : {})}
                    >
                      {link.fields.text}
                    </SubNav.Link>
                  ))}
                </SubNav.SubMenu>
              )}
            </SubNav.Link>
          )
        })}

        {component.fields.cta !== undefined && (
          <SubNav.Action
            href={component.fields.cta.fields.href}
            data-ref={`subnav-cta-action-${component.fields.cta.sys.id}`}
          >
            {component.fields.cta.fields.text}
          </SubNav.Action>
        )}
      </SubNav>
    </div>
  )
}
