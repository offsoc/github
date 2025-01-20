import {ActionList, Box, Text} from '@primer/react'
import {CheckIcon, NoEntryIcon} from '@primer/octicons-react'

import {getAllUsedClusters} from './utils'
import type {TraceData} from './types'
import {isClusterDisabled, toggleClusterState} from './index'

type ClustersDisablerProps = {
  traces: TraceData
}

export const ClustersDisabler = ({traces}: ClustersDisablerProps) => {
  const usedClusters = getAllUsedClusters(traces)

  return (
    <ActionList>
      {usedClusters.map((cluster, index) => (
        <ActionList.Item key={index} onSelect={() => toggleClusterState(cluster)}>
          <Box sx={{display: 'flex'}}>
            <Text sx={{flex: 1, mr: 2}}>{cluster}</Text>
            {isClusterDisabled(cluster) ? <NoEntryIcon /> : <CheckIcon />}
          </Box>
        </ActionList.Item>
      ))}
    </ActionList>
  )
}
