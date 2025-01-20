import {ListView} from '@github-ui/list-view'
import {ListItem} from '@github-ui/list-view/ListItem'
import {ListItemDescription} from '@github-ui/list-view/ListItemDescription'
import {ListItemLeadingVisual} from '@github-ui/list-view/ListItemLeadingVisual'
import {ListItemMainContent} from '@github-ui/list-view/ListItemMainContent'
import {ListItemTitle} from '@github-ui/list-view/ListItemTitle'
import {ListViewMetadata} from '@github-ui/list-view/ListViewMetadata'
import {ProjectTemplateIcon} from '@primer/octicons-react'
import {Box, Text} from '@primer/react'

import type {CustomTemplate} from '../../api/common-contracts'
import {sanitizeTextInputHtmlString} from '../../helpers/sanitize'
import {Link} from '../../router'
import {useTemplateLink} from './hooks/use-template-link'

function TemplateListItem({template}: {template: CustomTemplate}) {
  const to = useTemplateLink({type: 'custom', template})

  return (
    <ListItem
      sx={{
        // Adjusted grid spacing to make the list denser
        columnGap: 2,
        rowGap: 0,
        pl: 2,
        // We are overwriting the hover styling so that the background color on hover
        // doesn't overlap with the rounded border
        '&:hover': {backgroundColor: 'transparent'},
      }}
      title={
        <ListItemTitle
          value={sanitizeTextInputHtmlString(template.projectTitle)}
          href={'#' /* this will be replaced by `to` */}
          linkProps={{as: Link, to}}
          headingSx={{fontSize: 1, mt: 1}}
        />
      }
    >
      <ListItemLeadingVisual icon={ProjectTemplateIcon} color="fg.muted" />
      <ListItemMainContent>
        {template.projectShortDescription && (
          <ListItemDescription>{template.projectShortDescription}</ListItemDescription>
        )}
      </ListItemMainContent>
    </ListItem>
  )
}

export function TemplateList({
  title,
  templates,
  metadata,
}: {
  /** accessible name for the list view */
  title: string
  templates: Array<CustomTemplate>
  metadata?: React.ReactNode
}) {
  return (
    <Box sx={{borderWidth: 1, borderStyle: 'solid', borderRadius: 2, borderColor: 'border.default'}}>
      <ListView
        title={title}
        metadata={
          <ListViewMetadata
            title={
              <Text
                sx={{
                  fontWeight: 'bold',
                  color: 'fg.muted',
                }}
              >
                {title}
              </Text>
            }
            sx={{backgroundColor: 'canvas.subtle', pl: '12px', fontSize: 0, py: 2, borderBottomColor: 'border.default'}}
          >
            {metadata}
          </ListViewMetadata>
        }
      >
        {templates.map(template => (
          <TemplateListItem key={template.projectNumber} template={template} />
        ))}
      </ListView>
    </Box>
  )
}
