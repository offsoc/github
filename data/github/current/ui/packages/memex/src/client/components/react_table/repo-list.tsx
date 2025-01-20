import {testIdProps} from '@github-ui/test-id-props'
import {Box, Spinner, Text, useRefObjectAsForwardedRef} from '@primer/react'
import {forwardRef, useRef} from 'react'

import type {SuggestedRepository} from '../../api/repository/contracts'
import {getInitialState} from '../../helpers/initial-state'
import type {FuzzyFilterPositionData} from '../../helpers/suggester'
import type {GetItemPropsAdditionalHandlers} from '../../hooks/common/use-autocomplete'
import {usePrefixedId} from '../../hooks/common/use-prefixed-id'
import {HighlightedText} from '../common/highlighted-text'
import {PickerItem, PickerList, useAdjustPickerPosition} from '../common/picker-list'
import {Portal} from '../common/portal'
import {RepositoryIcon} from '../fields/repository/repository-icon'

interface RepoListProps extends React.HTMLAttributes<HTMLUListElement> {
  isOpen: boolean
  loading: boolean
  repositories: Array<SuggestedRepository>
  positionDataMap: WeakMap<SuggestedRepository, FuzzyFilterPositionData>
  inputRef: React.RefObject<HTMLInputElement>
  getItemProps: (
    item: SuggestedRepository,
    index: number,
    additionalHandlers?: GetItemPropsAdditionalHandlers,
  ) => React.LiHTMLAttributes<HTMLLIElement>
}

export const RepoList = forwardRef<HTMLUListElement, RepoListProps>(
  ({isOpen, loading, repositories, getItemProps, positionDataMap, inputRef, ...listProps}, forwardedRef) => {
    const ref = useRef<HTMLUListElement>(null)
    useRefObjectAsForwardedRef(forwardedRef, ref)

    const {adjustPickerPosition} = useAdjustPickerPosition(inputRef, ref, isOpen, [loading])

    const portalId = usePrefixedId('__omnibarPortalRoot__')
    return (
      <Portal id={portalId} onMount={adjustPickerPosition}>
        <PickerList
          {...listProps}
          {...testIdProps('repo-searcher-list')}
          className={`repo-searcher-list omnibar-picker ${
            !isOpen || (!loading && !repositories.length) ? 'hidden' : 'visible'
          }`}
          ref={ref}
          hidden={!isOpen || (!loading && !repositories.length)}
          aria-label="Repository suggestions"
        >
          {loading ? (
            <Box sx={{justifyContent: 'center', my: 4, display: 'flex'}}>
              <Spinner size="medium" />
            </Box>
          ) : (
            repositories.map((repository, index) => (
              <RepoItem
                {...getItemProps(repository, index)}
                {...testIdProps('repo-searcher-item')}
                positionData={positionDataMap.get(repository)}
                key={repository.id}
                repository={repository}
              />
            ))
          )}
        </PickerList>
      </Portal>
    )
  },
)

RepoList.displayName = 'RepoList'

interface RepoItemProps extends React.LiHTMLAttributes<HTMLLIElement> {
  repository: SuggestedRepository
  positionData: FuzzyFilterPositionData | undefined
}

const RepoItem: React.FC<RepoItemProps> = ({repository, positionData, ...itemProps}) => {
  const {projectOwner} = getInitialState()
  const chunks = positionData?.chunks ?? []
  const repoOwner = repository.nameWithOwner.split('/')[0]
  const ownerText = repoOwner?.toLowerCase() !== projectOwner?.login.toLowerCase() ? repoOwner : ''
  return (
    <PickerItem {...itemProps}>
      <RepositoryIcon repository={repository} />
      <Text sx={{ml: 2}}>{ownerText ? `${ownerText}/` : ''}</Text>
      <HighlightedText text={repository.name} chunks={chunks} />
    </PickerItem>
  )
}
