import {Box, Checkbox, FormControl, Link, Text, Label} from '@primer/react'

type ItemContentProps = {
  name: string
  slug: string
  externalGroupId: number | null
}

const ItemContent = ({name, slug, externalGroupId}: ItemContentProps) => {
  return (
    <>
      <Link
        href={`teams/${slug}/members`}
        sx={{
          color: 'fg.default',
          fontWeight: 'normal',
          unicodeBidi: 'bidi-override',
          ':hover': {
            color: 'accent.fg',
          },
        }}
        aria-label={`link-to-${slug}`}
        data-testid={`link-to-${slug}`}
      >
        {name}
      </Link>
      {externalGroupId && (
        <Link
          href={`external_group_members/${externalGroupId}`}
          sx={{
            ml: 2,
            color: 'fg.default',
            fontWeight: 'normal',
            ':hover': {
              color: 'accent.fg',
            },
          }}
          aria-label={`link-to-external-group-${externalGroupId}`}
          data-testid={`link-to-external-group-${externalGroupId}`}
        >
          <Label>IdP Group</Label>
        </Link>
      )}
    </>
  )
}

type TeamListItemProps = ItemContentProps & {members: number} & (
    | {checkable?: false}
    | {checkable: true; checked: boolean}
  )

export const TeamListItem = (props: TeamListItemProps) => {
  const {name, slug, members, externalGroupId, checkable} = props

  const pluralize = (count: number, noun: string, suffix = 's') => `${count} ${noun}${count !== 1 ? suffix : ''}`
  return (
    // eslint-disable-next-line github/a11y-role-supports-aria-props
    <Box
      sx={{
        borderBottom: '1px solid',
        px: 3,
        py: 2,
        borderBottomColor: 'border.muted',
        display: 'flex',
        justifyContent: 'space-between',
      }}
      aria-labelledby={`checkbox-for-team-${slug} link-for-team-${slug}`}
    >
      {checkable ? (
        <FormControl aria-describedby={`row-for-${slug}`} sx={{display: 'flex', alignItems: 'center'}}>
          <Checkbox
            aria-describedby={`checkbox-for-${slug}`}
            value={slug}
            checked={props.checked}
            data-testid={`checkbox-for-${slug}`}
          />
          <FormControl.Label aria-describedby={`label-for-team-${slug}`} id={slug}>
            <ItemContent slug={slug} name={name} externalGroupId={externalGroupId} />
          </FormControl.Label>
        </FormControl>
      ) : (
        <ItemContent name={name} slug={slug} externalGroupId={externalGroupId} />
      )}
      <Text
        aria-describedby={`member-count-for-${slug}`}
        data-testid={`member-count-for-${slug}`}
        sx={{position: 'relative', right: 30}}
      >
        {pluralize(members, 'member')}
      </Text>
    </Box>
  )
}
