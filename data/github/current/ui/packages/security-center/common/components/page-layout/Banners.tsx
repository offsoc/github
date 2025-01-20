import {Box} from '@primer/react'

type Props = unknown

function Banners({children}: React.PropsWithChildren<Props>): JSX.Element {
  return <Box sx={{mb: 2}}>{children}</Box>
}

Banners.displayName = 'PageLayout.Banners'

export default Banners
