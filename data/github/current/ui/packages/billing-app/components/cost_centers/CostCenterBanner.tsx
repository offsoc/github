import {Box, Text} from '@primer/react'

export default function CostCenterBanner() {
  return (
    <Box sx={{mt: 2, mb: 4}}>
      <Text sx={{color: 'fg.muted'}}>
        Cost centers can consist of organizations and repositories for usage-based products like Actions. For
        license-based products (Copilot, Advanced Security, and GitHub Enterprise), cost centers can include users.
      </Text>
    </Box>
  )
}
