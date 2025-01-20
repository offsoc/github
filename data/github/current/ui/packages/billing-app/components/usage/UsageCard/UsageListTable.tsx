/* eslint eslint-comments/no-use: off */
/* eslint-disable primer-react/no-system-props */
import {GitHubAvatar} from '@github-ui/github-avatar'
import {Box, Text} from '@primer/react'
import {Grid, Stack} from '@primer/react-brand'

import ColoredBullet from '../../common/ColoredBullet'

import {COLORS} from '../../../constants'
import {UsageCardVariant} from '../../../enums'
import {formatMoneyDisplay} from '../../../utils/money'

import type {RepoUsageLineItem} from '../../../types/usage'

interface Props {
  allOtherUsage?: number
  usage: RepoUsageLineItem[]
  variant: UsageCardVariant
}

const usageRowStyle = {
  display: 'flex',
  py: 2,
}

// TODO: This should be handled via CSS
const usageRowStyleWithBottomBorder = {
  ...usageRowStyle,
  borderBottomWidth: 1,
  borderBottomStyle: 'solid',
  borderBottomColor: 'border.default',
}

const listTextStyle = {
  fontSize: 1,
}

interface TableRowProps {
  nameElement: JSX.Element
  billedAmountElement: JSX.Element
}

function TableRow({nameElement, billedAmountElement}: TableRowProps): JSX.Element {
  return (
    <Grid style={{padding: 0, margin: 0, minWidth: '100%'}}>
      <Grid.Column span={6}>{nameElement}</Grid.Column>
      <Grid.Column className="text-right" span={3} />
      <Grid.Column className="text-right" span={3}>
        {billedAmountElement}
      </Grid.Column>
    </Grid>
  )
}

interface UsageRowItemProps {
  name: string
  amount: number
  color?: string
  avatarSrc?: string
}

function UsageRowItem({name, amount, color, avatarSrc}: UsageRowItemProps): JSX.Element {
  return (
    <TableRow
      nameElement={
        <Stack gap="none" padding="none" direction="horizontal" alignItems="center">
          <ColoredBullet color={color ?? 'border.default'} sx={{mr: 2, display: 'inline-block'}} />
          {avatarSrc && <GitHubAvatar square src={avatarSrc} size={16} sx={{mr: 2}} />}
          <Text sx={listTextStyle}>{name}</Text>
        </Stack>
      }
      billedAmountElement={<Text sx={listTextStyle}>{formatMoneyDisplay(amount)}</Text>}
    />
  )
}

export default function UsageListTable({usage, allOtherUsage, variant}: Props) {
  const otherText = variant === UsageCardVariant.ORG ? 'All other orgs' : 'All other repositories'
  const hasOtherUsage = !!allOtherUsage && allOtherUsage > 0

  const getName = (item: RepoUsageLineItem): string => {
    return variant === UsageCardVariant.ORG ? item.org.name : `${item.org.name}/${item.repo.name}`
  }

  const getTableHeader = (): string => (variant === UsageCardVariant.ORG ? 'Organization' : 'Repository')

  const displayBottomBorder = (index: number): boolean => {
    if (hasOtherUsage) return true
    return index + 1 !== usage.length
  }

  return (
    <Box sx={{display: 'flex', flexDirection: 'column'}}>
      <TableRow
        nameElement={<Text sx={{color: 'fg.subtle'}}>{getTableHeader()}</Text>}
        billedAmountElement={<Text sx={{...listTextStyle, color: 'fg.subtle'}}>Gross amount</Text>}
      />
      {usage.map((usageInformation, index) => (
        <Box
          key={`${getName(usageInformation)}-usage-${index}`}
          sx={displayBottomBorder(index) ? usageRowStyleWithBottomBorder : usageRowStyle}
          data-testid={`${getName(usageInformation)}-usage-list-item`}
        >
          <UsageRowItem
            name={getName(usageInformation)}
            amount={usageInformation.billedAmount}
            color={COLORS[index]}
            avatarSrc={variant === UsageCardVariant.ORG ? usageInformation.org.avatarSrc : ''}
          />
        </Box>
      ))}
      {hasOtherUsage && (
        <Box sx={usageRowStyle} data-testid="usage-list-table-other-usage">
          <UsageRowItem name={otherText} amount={allOtherUsage ?? 0} />
        </Box>
      )}
    </Box>
  )
}
