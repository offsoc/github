import {Box, Heading, Link, Text} from '@primer/react'

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

export default function VolumeLicensesCardCombined({gheAndGhas, IsInvoiced}: VolumeLicensesCardProps) {
  const {path: enterpriseLicensingPath} = useRoute(ENTERPRISE_LICENSING_BASE_ROUTE)
  return (
    <Box sx={cardStyle} data-testid="volume-licenses-card-combined">
      <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
        <Heading as="h3" sx={cardHeadingStyle}>
          Spend on pre-purchased user licenses
        </Heading>

        <Link href={enterpriseLicensingPath} sx={{fontSize: Fonts.FontSizeSmall}}>
          Manage licenses
        </Link>
      </Box>

      <Box sx={{fontSize: 4}}>
        {`${formatMoneyDisplay(gheAndGhas.spend)} `}
        <Box as="span" sx={{fontSize: 1}}>
          {gheAndGhas.period}
        </Box>
      </Box>

      <Text sx={{mb: 0, color: 'fg.muted', fontSize: Fonts.FontSizeSmall}}>
        For <Text sx={{fontWeight: 'bold'}}> GitHub Enterprise</Text> and{' '}
        <Text sx={{fontWeight: 'bold'}}>Advanced Security</Text>.{' '}
        {IsInvoiced && (
          <>Does not include user license discounts. Where applicable, discounts will appear on your bill.</>
        )}
      </Text>
    </Box>
  )
}
