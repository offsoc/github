import {Box, Heading, Link} from '@primer/react'

import {formatMoneyDisplay} from '../../utils/money'
import {ENTERPRISE_LICENSING_BASE_ROUTE} from '../../routes'
import useRoute from '../../hooks/use-route'
import {boxStyle, Fonts} from '../../utils/style'

import type {VolumeLicensesCardProps} from './VolumeLicensesCard'

const cardStyle = {
  ...boxStyle,
  display: 'flex',
  flexDirection: 'column',
  gap: 1,
}

const cardHeadingStyle = {
  fontSize: Fonts.FontSizeNormal,
  fontWeight: 'normal',
  color: 'fg.default',
}

export default function VolumeLicensesCardSeparate({ghe, ghas, IsInvoiced}: VolumeLicensesCardProps) {
  const {path: enterpriseLicensingPath} = useRoute(ENTERPRISE_LICENSING_BASE_ROUTE)
  return (
    <Box sx={cardStyle} data-testid="volume-licenses-card-separate">
      <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
        <Heading as="h3" sx={cardHeadingStyle}>
          Spend on pre-purchased user licenses
        </Heading>

        <Link href={enterpriseLicensingPath} sx={{fontSize: Fonts.FontSizeSmall}}>
          Manage licenses
        </Link>
      </Box>

      {IsInvoiced && (
        <Box sx={{color: 'fg.muted', fontSize: Fonts.FontSizeSmall}}>
          Does not include user license discounts. Where applicable, discounts will appear on your bill.
        </Box>
      )}

      <Box sx={{fontSize: 4, display: 'flex'}}>
        <Box sx={{flexGrow: 1, pt: 3, fontSize: 4}}>
          {`${formatMoneyDisplay(ghe.spend)} `}
          <Box as="span" sx={{fontSize: 1}}>
            {ghe.period}
          </Box>
          <Box sx={{color: 'fg.muted', fontSize: Fonts.FontSizeSmall}}>
            For{' '}
            <Box as="span" sx={{fontWeight: 'bold'}}>
              GitHub Enterprise
            </Box>
          </Box>
        </Box>
        <span className="vertical-separator" />
        <Box sx={{flexGrow: 1, pt: 3, pl: 3}}>
          {`${formatMoneyDisplay(ghas.spend)} `}
          <Box as="span" sx={{fontSize: 1}}>
            {ghas.period}
          </Box>
          <Box sx={{color: 'fg.muted', fontSize: Fonts.FontSizeSmall}}>
            For{' '}
            <Box as="span" sx={{fontWeight: 'bold'}}>
              GitHub Advanced Security
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
