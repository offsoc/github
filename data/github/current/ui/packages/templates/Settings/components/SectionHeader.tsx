import {Text} from '@primer/react'
import {PageHeader} from '@primer/react/drafts'

interface SectionsHeaderProps {
  title: string
  description?: string
  divider?: boolean
  //todo add action here
  //
}

const SectionHeader = ({title, description, divider = false}: SectionsHeaderProps) => {
  return (
    <PageHeader sx={{borderBottom: divider ? '1px solid' : 0, borderColor: 'border.muted', pb: 1}}>
      <PageHeader.TitleArea>
        <PageHeader.Title sx={{fontSize: 2}}>{title}</PageHeader.Title>
      </PageHeader.TitleArea>
      {description && (
        <PageHeader.Description>
          <Text
            sx={{
              fontSize: 1,
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

export default SectionHeader
