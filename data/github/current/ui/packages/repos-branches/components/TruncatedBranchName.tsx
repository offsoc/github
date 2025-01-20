import {BranchName, Truncate} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {ScreenSize, useScreenSize} from '@github-ui/screen-size'
import type {Branch} from '../types'
import useIsBranchProtected from '../hooks/use-is-branch-protected'

interface TruncatedBranchNameProps
  extends Pick<Branch, 'name' | 'path' | 'rulesetsPath' | 'protectedByBranchProtections'> {
  sx?: BetterSystemStyleObject
}

const TRUNCATION_SIZE_MAP = {
  [ScreenSize.small]: 200,
  [ScreenSize.medium]: 200,
  [ScreenSize.large]: 225,
  [ScreenSize.xlarge]: 250,
  [ScreenSize.xxlarge]: 460,
  [ScreenSize.xxxlarge]: 530,
  [ScreenSize.xxxxlarge]: 540,
}

const getMaxWidth = (screenSize: ScreenSize) => {
  return TRUNCATION_SIZE_MAP[screenSize] ?? TRUNCATION_SIZE_MAP[ScreenSize.small]
}

export default function TruncatedBranchName({sx = {}, ...branch}: TruncatedBranchNameProps) {
  const {screenSize} = useScreenSize()
  const {isProtected} = useIsBranchProtected(branch)
  const modifier = isProtected ? -32 : 0

  return (
    <BranchName href={branch.path} sx={sx}>
      <Truncate title={branch.name} maxWidth={getMaxWidth(screenSize) + modifier}>
        {branch.name}
      </Truncate>
    </BranchName>
  )
}
