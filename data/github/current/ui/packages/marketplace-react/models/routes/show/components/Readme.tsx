import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {Box} from '@primer/react'
import type {ShowModelPayload, Model} from '../../../../types'

import {SafeHTMLBox} from '@github-ui/safe-html'
import {PUBLISHER} from '../../../../utilities/normalize-model-strings'

export function Readme() {
  const {model, modelReadme} = useRoutePayload<ShowModelPayload>()

  return (
    <>
      <MarkdownPublisherHeroImage model={model} />
      <SafeHTMLBox html={modelReadme} className="p-3" />
    </>
  )
}

function MarkdownPublisherHeroImage({model}: {model: Model}) {
  const lowercaseKey = model.model_family.toLowerCase()

  const MarkdownHero = ({src, webp, alt}: {src: string; webp: string; alt: string}) => {
    return (
      <Box
        sx={{
          maxWidth: '100%',
          px: [2, 3, 3],
          pt: [2, 3, 3],
          aspectRatio: '830 / 272',
          img: {
            bg: 'canvas.subtle',
            borderRadius: 2,
            width: '100%',
          },
        }}
      >
        <picture>
          <source srcSet={webp} type="image/webp" />
          <img src={src} alt={alt} />
        </picture>
      </Box>
    )
  }

  switch (lowercaseKey) {
    case PUBLISHER.Cohere:
    case PUBLISHER.Core42:
      return (
        <MarkdownHero
          src="/images/modules/marketplace/models/families/cohere-hero.jpg"
          webp="/images/modules/marketplace/models/families/cohere-hero.webp"
          alt={model.publisher}
        />
      )
    case PUBLISHER.Meta:
      return (
        <MarkdownHero
          src="/images/modules/marketplace/models/families/meta-hero.jpg"
          webp="/images/modules/marketplace/models/families/meta-hero.webp"
          alt={model.publisher}
        />
      )
    case PUBLISHER.Microsoft:
      return (
        <MarkdownHero
          src="/images/modules/marketplace/models/families/microsoft-hero.jpg"
          webp="/images/modules/marketplace/models/families/microsoft-hero.webp"
          alt={model.publisher}
        />
      )
    case PUBLISHER.Mistral:
    case PUBLISHER.MistralAI:
      return (
        <MarkdownHero
          src="/images/modules/marketplace/models/families/mistral-hero.jpg"
          webp="/images/modules/marketplace/models/families/mistral-hero.webp"
          alt={model.publisher}
        />
      )
    case PUBLISHER.AI21Labs:
      return (
        <MarkdownHero
          src="/images/modules/marketplace/models/families/ai21labs-hero.jpg"
          webp="/images/modules/marketplace/models/families/ai21labs-hero.webp"
          alt={model.publisher}
        />
      )
    case PUBLISHER.OpenAI:
    case PUBLISHER.OpenAIEVault:
      return (
        <MarkdownHero
          src="/images/modules/marketplace/models/families/openai-hero.jpg"
          webp="/images/modules/marketplace/models/families/openai-hero.webp"
          alt={model.publisher}
        />
      )
    default:
      return null
  }
}
