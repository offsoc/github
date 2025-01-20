import {render} from '@github-ui/react-core/test-utils'
import {screen, waitFor} from '@testing-library/react'
import {ContentfulLogoSuite} from '../../../../components/contentful/ContentfulLogoSuite/ContentfulLogoSuite'

const companies = ['Fidelity', 'Philips', 'Telus']
const companiesWithNonExistent = [...companies, 'non-existent']

describe('ContentfulLogoSuite', () => {
  it('Renders the Logo Suite while ignoring non-existent logos', async () => {
    render(
      <ContentfulLogoSuite
        component={{
          sys: {id: 'foo', contentType: {sys: {id: 'primerComponentLogoSuite'}}},
          fields: {
            heading: 'Example Logo Suite Heading',
            logos: companiesWithNonExistent,
          },
        }}
      />,
    )

    const heading = screen.getByText('Example Logo Suite Heading')
    expect(heading).toBeInTheDocument()

    // Renders "real" logos while ignoring "false" ones
    const nope = screen.queryByTitle('non-existent')
    expect(nope).toBeNull()

    for (const co of companies) {
      await waitFor(() => {
        const logo = screen.getByTitle(co)
        expect(logo).toBeInTheDocument()
      })
    }
  })
})
