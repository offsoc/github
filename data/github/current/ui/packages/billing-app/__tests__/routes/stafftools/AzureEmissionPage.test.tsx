import {render} from '@github-ui/react-core/test-utils'
import {screen, waitFor} from '@testing-library/react'

import type {AzureEmissionPayload} from '../../../routes/stafftools'
import {AzureEmissionPage} from '../../../routes/stafftools'
import {getAzureEmissionsRequest} from '../../../services/azure_emissions'
import type {AzureEmission} from '../../../types/azure-emissions'

import {mockAzureEmission} from '../../../test-utils/mock-data'

function azureEmissionRoutePayload({
  slug = 'test',
  azureEmissions = [mockAzureEmission],
}: {
  slug?: string
  azureEmissions: AzureEmission[]
}): AzureEmissionPayload {
  return {
    slug,
    azureEmissions,
  }
}
jest.mock('../../../services/azure_emissions', () => ({
  getAzureEmissionsRequest: jest.fn(),
}))

describe('Azure Emissions exist', () => {
  describe('When emissions exist', () => {
    it('displays the emissions for this customer', async () => {
      ;(getAzureEmissionsRequest as jest.Mock).mockResolvedValueOnce({
        statusCode: 200,
        azureEmissions: [mockAzureEmission],
      })
      const routePayload = azureEmissionRoutePayload({
        azureEmissions: [mockAzureEmission],
        slug: 'test',
      })
      const {user} = render(<AzureEmissionPage />, {routePayload})

      expect(screen.getByRole('heading', {level: 2})).toHaveTextContent('Azure Emissions')
      const DatePickerButton = screen.getByRole('button')
      await user.click(DatePickerButton)

      await waitFor(() => expect(screen.getByRole('table')).toHaveTextContent(mockAzureEmission.azurePartitionKey))
    })

    describe('When emissions dont exist', () => {
      it('displays the blankslate', async () => {
        ;(getAzureEmissionsRequest as jest.Mock).mockResolvedValueOnce({
          statusCode: 200,
          azureEmissions: [],
        })
        const routePayload = azureEmissionRoutePayload({
          azureEmissions: [],
          slug: 'test',
        })
        const {user} = render(<AzureEmissionPage />, {routePayload})

        expect(screen.getByRole('heading', {level: 2})).toHaveTextContent('Azure Emissions')
        const DatePickerButton = screen.getByRole('button')
        await user.click(DatePickerButton)

        await waitFor(() =>
          expect(screen.getByTestId('blankslate-container')).toHaveTextContent(
            'Customer has no Azure Emissions for this date.',
          ),
        )
      })
    })
  })
})
