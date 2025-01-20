import {Image} from '@primer/react-brand'
import type {TemplateFreeFormSection} from '../../../lib/types/contentful'

export function SectionBackgroundImage({fields}: Pick<TemplateFreeFormSection, 'fields'>) {
  if (!fields.image) return null

  const {image, imageMaxWidth} = fields
  const maxWidth = imageMaxWidth || '100%'
  const base = `${image.fields.file.url}?fm=webp`
  const srcSet = `${base}&w=768 768w, ${imageMaxWidth ? `${base}&w=${imageMaxWidth} ${imageMaxWidth}w` : `${base} 1x`}`

  return (
    <div className="top-0 right-0 left-0 bottom-0 position-absolute width-full" style={{maxWidth, margin: '0 auto'}}>
      <Image src={base} srcSet={srcSet} alt="" />
    </div>
  )
}
