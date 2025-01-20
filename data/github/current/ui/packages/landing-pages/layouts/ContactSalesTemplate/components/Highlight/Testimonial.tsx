import {ContentfulTestimonial} from '@github-ui/swp-core/components/contentful/ContentfulTestimonial'
import type {PrimerComponentTestimonial} from '@github-ui/swp-core/schemas/contentful/contentTypes/primerComponentTestimonial'
import {Box} from '@primer/react-brand'

export function Testimonial({component}: {component: PrimerComponentTestimonial}) {
  return (
    <Box borderRadius="medium" padding={32} style={{backgroundColor: 'rgba(255, 255, 255, 0.12)'}}>
      <ContentfulTestimonial component={component} quoteMarkColor="default" />
    </Box>
  )
}
