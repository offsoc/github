import React, {useState, useRef, Fragment} from 'react'
import {Text, Box, Button} from '@primer/react'
import {Dialog} from '@primer/react/experimental'
import {DiscountTargetType, DiscountType} from '../../enums'
import {formatMoneyDisplay} from '../../utils/money'
import {getTextForDiscount} from '../../utils/discount'
import {listStyle, Fonts, Spacing} from '../../utils/style'

import type {DiscountAmountsMap} from '../../types/discounts'

interface Props {
  discountTargetAmounts: DiscountAmountsMap
  totalDiscount: number
  isOrganization: boolean
}

export default function CurrentDiscountsListDialog({discountTargetAmounts, totalDiscount, isOrganization}: Props) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const returnFocusRef = useRef(null)

  return (
    <div data-testid="current-discounts-list-dialog-container">
      <Button variant="invisible" onClick={() => setIsDialogOpen(true)} sx={{fontSize: Fonts.FontSizeSmall}}>
        More details
      </Button>

      {isDialogOpen && (
        <Dialog
          onClose={() => setIsDialogOpen(false)}
          title="Current included usage"
          returnFocusRef={returnFocusRef}
          aria-labelledby="header"
          sx={{overflowY: 'auto'}}
        >
          <Box sx={{p: Spacing.StandardPadding}}>
            <div>
              <Text sx={{fontSize: 4}} data-testid="total-discount">
                {formatMoneyDisplay(totalDiscount)}
              </Text>
            </div>
            <Text
              as="p"
              sx={{
                color: 'fg.muted',
                borderTopColor: 'border.default',
                borderTopWidth: 1,
              }}
            >
              {isOrganization
                ? 'Showing currently applied discounts for your organization.'
                : 'Showing currently applied discounts for your enterprise.'}
            </Text>
            <Box as="ul" sx={{mb: Spacing.SmallPadding, overflowY: 'hidden'}}>
              {Object.values(DiscountTargetType).map(targetType => {
                const coercedTargetType = targetType as DiscountTargetType
                if (!discountTargetAmounts[coercedTargetType]) return

                const fixedDiscountAmount = discountTargetAmounts[coercedTargetType][DiscountType.FixedAmount]
                const percentageDiscountAmounts = discountTargetAmounts[coercedTargetType][DiscountType.Percentage]

                return (
                  <Fragment key={`${targetType}`}>
                    {fixedDiscountAmount && (
                      <Box
                        as="li"
                        sx={{
                          ...listStyle,
                        }}
                        key={`${coercedTargetType}-fixed-discount`}
                        data-testid={`${coercedTargetType}-fixed-discount`}
                      >
                        <Box sx={{flex: 1}}>
                          {getTextForDiscount(fixedDiscountAmount, coercedTargetType, DiscountType.FixedAmount).map(
                            (text, index) => (
                              <React.Fragment key={`${coercedTargetType}-fixed-discount-${index}`}>
                                {text}
                                <br />
                              </React.Fragment>
                            ),
                          )}
                        </Box>
                        <div>
                          <Text as="p" sx={{fontWeight: 'bold'}}>
                            {formatMoneyDisplay(fixedDiscountAmount.appliedAmount)}
                          </Text>
                        </div>
                      </Box>
                    )}
                    {percentageDiscountAmounts?.map((discountAmount, index) => {
                      return (
                        <Box
                          as="li"
                          sx={{...listStyle}}
                          key={`${coercedTargetType}-percentage-discount-${index}`}
                          data-testid={`${coercedTargetType}-percentage-discount-${index}`}
                        >
                          <Text
                            as="p"
                            sx={{
                              flex: 'auto',
                            }}
                          >
                            {getTextForDiscount(discountAmount, coercedTargetType, DiscountType.Percentage).join(' ')}
                          </Text>
                          <Text as="p" sx={{fontWeight: 'bold'}}>
                            {formatMoneyDisplay(discountAmount.appliedAmount)}
                          </Text>
                        </Box>
                      )
                    })}
                  </Fragment>
                )
              })}
            </Box>
            <Text
              as="p"
              sx={{
                color: 'fg.muted',
              }}
            >
              * As per current pricing
            </Text>
          </Box>
        </Dialog>
      )}
    </div>
  )
}
