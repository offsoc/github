import {useState, useRef} from 'react'
import {Text, Box, Button, Link} from '@primer/react'
import {Dialog} from '@primer/react/experimental'
import type {PricingDetails} from '../../types/pricings'
import {URLS} from '../../constants'
import {useNavigate} from 'react-router-dom'
import {Spacing, listStyle} from '../../utils'

interface Props {
  pricingDetails: PricingDetails
}

export default function PricingDetailsDialog({pricingDetails}: Props) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const returnFocusRef = useRef(null)
  const navigate = useNavigate()

  const skuQueryURL = `webevents%0D%0A%7C+where+data.sku%3D%3D"${pricingDetails.sku}"%0D%0A`

  return (
    <div data-testid="pricing-details-list-dialog-container">
      <Button sx={{p: 3, fontSize: 16}} variant="invisible" onClick={() => setIsDialogOpen(true)}>
        {pricingDetails.sku.replace(/_/g, ' ')}
      </Button>

      {isDialogOpen && (
        <Dialog
          onClose={() => setIsDialogOpen(false)}
          title={pricingDetails.sku.replace(/_/g, ' ')}
          subtitle={<Link href={`/stafftools/audit_log?query=${skuQueryURL}`}>View SKU related events</Link>}
          returnFocusRef={returnFocusRef}
          aria-labelledby="header"
          sx={{overflowY: 'auto'}}
          footerButtons={[
            {
              content: 'Edit',
              onClick: () =>
                navigate(`${URLS.STAFFTOOLS_PRODUCTS}/${pricingDetails.product}/pricings/${pricingDetails.sku}/edit`),
              sx: {mr: 2},
            },
          ]}
        >
          <Box sx={{p: Spacing.StandardPadding}}>
            <ul className="mt-0 pt-0">
              <Box
                as="li"
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
                data-testid="pricing-sku"
              >
                <Text sx={{flex: 'auto', overflow: 'auto'}}>Pricing SKU:</Text>
                <Text sx={{fontWeight: 'bold'}}>{pricingDetails.sku}</Text>
              </Box>

              <Box as="li" sx={{...listStyle, mt: '6px'}} data-testid="pricing-friendly-name">
                <Text sx={{flex: 'auto', overflow: 'auto'}}>Pricing friendly name:</Text>
                <Text sx={{fontWeight: 'bold'}}>{pricingDetails.friendlyName}</Text>
              </Box>

              <Box as="li" sx={{...listStyle, mt: '6px'}} data-testid="pricing-product">
                <Text sx={{flex: 'auto', overflow: 'auto'}}>Product:</Text>
                <Text sx={{fontWeight: 'bold'}}>{pricingDetails.product}</Text>
              </Box>

              <Box as="li" sx={{...listStyle, mt: '6px'}} data-testid="pricing-public-repo">
                <Text sx={{flex: 'auto', overflow: 'auto'}}>Free for Public Repositories:</Text>
                <Text sx={{fontWeight: 'bold'}}>{String(pricingDetails.freeForPublicRepos)}</Text>
              </Box>

              <Box as="li" sx={{...listStyle, mt: '6px'}} data-testid="pricing-price">
                <Text sx={{flex: 'auto', overflow: 'auto'}}>Price:</Text>
                <Text sx={{fontWeight: 'bold'}}>${String(pricingDetails.price)}</Text>
              </Box>

              <Box as="li" sx={{...listStyle, mt: '6px'}} data-testid="pricing-unit-type">
                <Text sx={{flex: 'auto', overflow: 'auto'}}>Unit type:</Text>
                <Text sx={{fontWeight: 'bold'}}>{String(pricingDetails.unitType)}</Text>
              </Box>

              <Box as="li" sx={{...listStyle, mt: '6px'}} data-testid="pricing-meter-type">
                <Text sx={{flex: 'auto', overflow: 'auto'}}>Meter type:</Text>
                <Text sx={{fontWeight: 'bold'}}>{String(pricingDetails.meterType)}</Text>
              </Box>

              <Box as="li" sx={{...listStyle, mt: '6px'}} data-testid="pricing-effective-at">
                <Text sx={{flex: 'auto', overflow: 'auto'}}>Effective at:</Text>
                <Text sx={{fontWeight: 'bold'}}>{new Date(pricingDetails.effectiveAt * 1000).toLocaleString()}</Text>
              </Box>

              <Box as="li" sx={{...listStyle, mt: '6px'}} data-testid="pricing-azure-id">
                <Text sx={{flex: 'auto', overflow: 'auto'}}>Azure meter ID:</Text>
                <Text sx={{fontWeight: 'bold'}}>{String(pricingDetails.azureMeterId)}</Text>
              </Box>

              {pricingDetails.effectiveDatePrices && pricingDetails.effectiveDatePrices.length > 0 && (
                <Box as="li" sx={{...listStyle, mt: '6px'}} data-testid="pricing-historical-prices">
                  <Text sx={{flex: 'auto', overflow: 'auto'}}>Historical prices:</Text>
                  <Text sx={{fontWeight: 'bold', width: '60%'}}>
                    {pricingDetails.effectiveDatePrices &&
                      pricingDetails.effectiveDatePrices.map((effectiveDatePrice, index) => (
                        <div key={index}>
                          <Box sx={{display: 'flex', mt: '6px'}} data-testid={`pricing-start-date-${index}`}>
                            <Text sx={{flex: 'auto', overflow: 'auto'}}>Start date:</Text>
                            <span>{effectiveDatePrice.startDate}</span>
                          </Box>
                          <Box sx={{display: 'flex', mt: '6px'}} data-testid={`pricing-end-date-${index}`}>
                            <Text sx={{flex: 'auto', overflow: 'auto'}}>End date:</Text>
                            <span>{effectiveDatePrice.endDate}</span>
                          </Box>
                          <Box sx={{display: 'flex', mt: '6px'}} data-testid={`pricing-date-price-${index}`}>
                            <Text sx={{flex: 'auto', overflow: 'auto'}}>Price:</Text>
                            <span>{effectiveDatePrice.price}</span>
                          </Box>
                          <br />
                        </div>
                      ))}
                  </Text>
                </Box>
              )}
            </ul>
          </Box>
        </Dialog>
      )}
    </div>
  )
}
