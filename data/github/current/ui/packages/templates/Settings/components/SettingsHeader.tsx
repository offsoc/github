import {Text} from '@primer/react'
import {PageHeader} from '@primer/react/drafts'

interface SettingsHeaderProps {
  title: string
  description?: string
  divider?: boolean
  isChild?: boolean
  parentLink?: string
  trailingAction?: React.ReactNode
  //todo add action
  //todo add leadingaction / isChild
}

const SettingsHeader = ({title, description, divider = false, trailingAction}: SettingsHeaderProps) => {
  return (
    <PageHeader
      sx={{
        pb: divider ? 2 : 0,
        borderBottom: divider ? '1px solid' : 0,
        borderColor: 'border.muted',
      }}
    >
      <PageHeader.TitleArea>
        <PageHeader.Title as="h1" sx={{fontSize: 3}}>
          {title}
        </PageHeader.Title>
      </PageHeader.TitleArea>
      {trailingAction && <PageHeader.Actions>{trailingAction}</PageHeader.Actions>}
      {description && (
        <PageHeader.Description>
          <Text
            sx={{
              fontSize: 2,
              color: 'fg.muted',
            }}
          >
            {description}
          </Text>
        </PageHeader.Description>
      )}
    </PageHeader>
  )
}

export default SettingsHeader
