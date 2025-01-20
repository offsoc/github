import {Box} from '@primer/react'

import {containerStyle, tableStyle, theadStyle, trStyle} from './style'

import BillingJobTableRow from './BillingJobTableRow'

import type {BillingJobTableRowData} from './BillingJobTableRow'

interface Props {
  headers: BillingJobTableRowData
  data: BillingJobTableRowData[]
}

export default function BillingJobTable({headers, data}: Props) {
  return (
    <Box sx={containerStyle}>
      <Box sx={tableStyle}>
        <Box sx={theadStyle}>
          <BillingJobTableRow data={headers} style={trStyle} />
        </Box>
        <div>
          {data.map((row, index) => (
            <BillingJobTableRow data={row} key={index} />
          ))}
        </div>
      </Box>
    </Box>
  )
}
