import styles from '../../../../marketplace.module.css'

import {Heading, Label} from '@primer/react'
import type {Model} from '../../../../types'

import {normalizeModelPublisher} from '../../../../utilities/normalize-model-strings'

interface ModelItemProps {
  model: Model
  isFeatured?: boolean
}

export default function ModelItem(props: ModelItemProps) {
  const {model, isFeatured} = props
  const listingUrl = `/marketplace/models/${model.registry}/${model.name}`
  // Jamba logo has some padding so we need to adjust the size
  const isJamba = model.name === 'AI21-Jamba-Instruct'
  const jambaStyle = isJamba ? {width: '36px', height: '36px'} : {}
  return (
    <div
      className={`position-relative border rounded-2 d-flex ${styles['marketplace-item']} ${
        isFeatured ? 'flex-column flex-items-center p-4' : 'gap-3 p-3'
      }`}
      data-testid="marketplace-item"
    >
      <div data-testid="logo" className={`flex-shrink-0 rounded-3 overflow-hidden ${styles['marketplace-logo']}`}>
        <img
          src={model.logo_url}
          alt={`${model.publisher} logo`}
          className={styles['marketplace-logo-img']}
          style={jambaStyle}
        />
      </div>
      {isFeatured ? (
        <div
          className="d-flex flex-column flex-items-center height-full width-full text-center"
          data-testid="featured-item"
        >
          <Heading as="h3" className="mt-3 d-flex f4 lh-condensed">
            <a href={listingUrl} className={`fgColor-default line-clamp-1 ${styles['marketplace-item-link']}`}>
              {model.friendly_name}
            </a>
          </Heading>
          <p className="mt-2 mb-auto text-small fgColor-muted line-clamp-2">
            by {normalizeModelPublisher(model.publisher)}
          </p>
          {model.summary && <p className="mt-2 text-small fgColor-muted line-clamp-2">{model.summary}</p>}
          <Label
            variant="secondary"
            size="large"
            data-testid="listing-type-label"
            className="position-absolute"
            sx={{top: '1rem', right: '1rem'}}
          >
            Model
          </Label>
        </div>
      ) : (
        <div className="flex-1" data-testid="non-featured-item">
          <div className="d-flex flex-justify-between flex-items-start gap-3">
            <h3 className="d-flex f4 lh-condensed">
              <a href={listingUrl} className={`${styles['marketplace-item-link']} line-clamp-1`}>
                {model.friendly_name}
              </a>
            </h3>
            <Label variant="secondary">Model</Label>
          </div>
          {model.summary && <p className="mt-1 mb-0 text-small fgColor-muted line-clamp-2">{model.summary}</p>}
          {!model.summary && (
            <p className="mt-1 mb-0 text-small fgColor-muted line-clamp-2">
              {normalizeModelPublisher(model.publisher)}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
