import {useState, useRef} from 'react'
import {Text, Box, Button} from '@primer/react'
import {Dialog} from '@primer/react/experimental'
import type {CustomerSelection} from '../../types/usage'
import {formatMoneyDisplay} from '../../utils/money'
import {listStyle, Fonts, Spacing} from '../../utils/style'

interface Props {
  customerSelections: CustomerSelection[]
  totalUsage: number
  usageMap: Record<string, number>
}

export default function UsageOverviewListDialog({customerSelections, totalUsage, usageMap}: Props) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const returnFocusRef = useRef(null)

  return (
    <div data-testid="usage-overview-list-dialog-container">
      <Button variant="invisible" onClick={() => setIsDialogOpen(true)} sx={{fontSize: Fonts.FontSizeSmall}}>
        More details
      </Button>

      {isDialogOpen && (
        <Dialog
          onClose={() => setIsDialogOpen(false)}
          title="Current metered usage"
          returnFocusRef={returnFocusRef}
          aria-labelledby="header"
          sx={{overflowY: 'auto'}}
        >
          <Box sx={{p: Spacing.StandardPadding}}>
            <div>
              <Text sx={{fontSize: 4}} data-testid="total-usage">
                {formatMoneyDisplay(totalUsage)}
              </Text>
            </div>
            <ul className="mt-0 pt-0">
              {customerSelections.map(selection => {
                return (
                  <Box
                    as="li"
                    sx={listStyle}
                    key={`usage-selection-${selection.id}`}
                    data-testid={`usage-selection-${selection.id}`}
                  >
                    <Text
                      as="p"
                      sx={{
                        flex: 'auto',
                        overflow: 'auto',
                      }}
                    >
                      {selection.displayText}
                    </Text>
                    <Text as="p" sx={{fontWeight: 'bold'}}>
                      {formatMoneyDisplay(usageMap[selection.id] || 0)}
                    </Text>
                  </Box>
                )
              })}
            </ul>
          </Box>
        </Dialog>
      )}
    </div>
  )
}
