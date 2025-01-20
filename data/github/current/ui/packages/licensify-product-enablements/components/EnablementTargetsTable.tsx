import {Box} from '@primer/react'
import type {ProductEnablement} from '../types'

interface EnablementTargetsTableProps {
  enablements: ProductEnablement[]
  editable?: boolean
}
export function EnablementTargetsTable({enablements}: EnablementTargetsTableProps) {
  return (
    <Box as="table" className="width-full mt-2 mb-2" sx={{textAlign: 'left'}}>
      <thead>
        <tr>
          <th>Product</th>
          <th>Type</th>
          <th>ID</th>
          <th>Global ID</th>
          <th>Enabled at</th>
        </tr>
      </thead>
      <tbody className="pt-3">
        {enablements.map((et, idx) => (
          <EnablementTargetRow key={idx} enablement={et} />
        ))}
      </tbody>
    </Box>
  )
}
interface EnablementTargetRowProps {
  enablement: ProductEnablement
}
function EnablementTargetRow({enablement}: EnablementTargetRowProps) {
  return (
    <tr>
      <td>{enablement.product}</td>
      <td>{enablement.enablementType}</td>
      <td>{enablement.enablementId}</td>
      <td>{enablement.globalId}</td>
      <td>{enablement.enabledAt}</td>
    </tr>
  )
}
