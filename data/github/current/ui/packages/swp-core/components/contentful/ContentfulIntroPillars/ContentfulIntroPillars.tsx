import {Box, Grid, SectionIntro} from '@primer/react-brand'
import type {IntroPillars} from '../../../schemas/contentful/contentTypes/introPillars'
import {ContentfulPillar} from '@github-ui/swp-core/components/contentful/ContentfulPillar'
import styles from './ContentfulIntroPillars.module.css'

export function ContentfulIntroPillars({component}: {component: IntroPillars}) {
  const {headline, pillars} = component.fields

  return (
    <>
      <Grid>
        <Grid.Column span={{medium: 8}}>
          <Box marginBlockEnd={40}>
            <SectionIntro fullWidth align="start">
              <SectionIntro.Heading>{headline}</SectionIntro.Heading>
            </SectionIntro>
          </Box>
        </Grid.Column>
      </Grid>
      <Box
        marginBlockEnd={{
          narrow: 16,
          regular: 16,
          wide: 48,
        }}
      >
        <Grid>
          {pillars?.map(pillar => (
            <Grid.Column span={{medium: 4}} key={pillar.sys.id}>
              <ContentfulPillar component={pillar} className={styles.pillar} />
            </Grid.Column>
          ))}
        </Grid>
      </Box>
    </>
  )
}
