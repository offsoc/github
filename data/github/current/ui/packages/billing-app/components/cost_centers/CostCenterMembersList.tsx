import {useEffect, useState} from 'react'
import {fetchQuery, useRelayEnvironment, readInlineData} from 'react-relay'
import {GitHubAvatar} from '@github-ui/github-avatar'
import {Heading} from '@primer/react'
import {ResourceType} from '../../enums/cost-centers'
import {UserPickerUserFragment, UserPickerInitialUsersQuery} from '../pickers/UserPicker'
import ResourcePaginator from '../pickers/ResourcePaginator'
import {Fonts, Spacing} from '../../utils/style'
import {SelectedRows} from '../pickers/SelectedRows'
import {ErrorBanner} from '../common/ErrorBanner'
import type {Pagination} from '@primer/react'
import type {Resource} from '../../types/cost-centers'
import type {Item} from '../../types/common'
import type {UserPickerInitialUsersQuery as UserPickerInitialUsersQueryType} from '../pickers/__generated__/UserPickerInitialUsersQuery.graphql'
import type {
  UserPickerUserFragment$key,
  UserPickerUserFragment$data as User,
} from '../pickers/__generated__/UserPickerUserFragment.graphql'

interface Props {
  resources: Resource[]
}

export default function CostCenterMembersList({resources}: Props) {
  const pageSize = 10
  const environment = useRelayEnvironment()
  const [currentMembers, setCurrentMembers] = useState<Array<Item<string>>>([])
  const [loadingMembers, setLoadingMembers] = useState(false)
  const [loadMembersError, setLoadMembersError] = useState('')
  const [pageCount, setPageCount] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [pagedMembersData, setPagedMembersData] = useState<Array<Item<string>>>([])

  const onPageChange: Parameters<typeof Pagination>['0']['onPageChange'] = (e, page) => {
    e.preventDefault()
    setCurrentPage(page)
  }

  const convertToItemProps = (item: User) => {
    return {
      id: item.id,
      text: item.login,
      description: item.name ?? '',
      leadingVisual: () => <GitHubAvatar square src={item.avatarUrl} alt="User login" />,
      rowLeadingVisual: () => <GitHubAvatar square src={item.avatarUrl} alt="User login" />,
      viewOnly: true,
    }
  }

  const resourceByUser = resources.filter(resource => resource.type === ResourceType.User).map(resource => resource.id)

  useEffect(() => {
    setLoadingMembers(true)

    /*
    queries have an argument limit of 100 node ids so we are batching them to fetch all organizations
    https://github.com/github/github/blob/0aeff718576cfc236cdcf082ab0bb68cbd35dca3/lib/platform/objects/query.rb#L86
    */
    const BATCH_SIZE = 100
    const chunks: string[][] = []

    for (let i = 0; i < resourceByUser.length; i += BATCH_SIZE) {
      chunks.push(resourceByUser.slice(i, i + BATCH_SIZE))
    }

    const promises = chunks.map(chunk => {
      return new Promise<Array<Item<string>>>((resolve, reject) => {
        fetchQuery<UserPickerInitialUsersQueryType>(environment, UserPickerInitialUsersQuery, {
          ids: chunk,
        }).subscribe({
          next: data => {
            const nodes = (data.nodes || []).flatMap(node =>
              // eslint-disable-next-line no-restricted-syntax
              node ? [readInlineData<UserPickerUserFragment$key>(UserPickerUserFragment, node)] : [],
            )
            const members = nodes.map(n => convertToItemProps(n))

            resolve(members)
          },
          error: (err: Error) => {
            reject(err)
          },
        })
      })
    })

    const loadUsers = async () => {
      try {
        const results = await Promise.all<Array<Item<string>>>(promises)
        const members = results.flat()
        setCurrentMembers(members)
        const updatePagedData = async () => {
          setPageCount(Math.ceil(members.length / (1.0 * pageSize)) || 1)
          setPagedMembersData(members.slice((currentPage - 1) * pageSize, currentPage * pageSize))
        }
        updatePagedData()
        setLoadingMembers(false)
      } catch (error) {
        setLoadMembersError('Unable to load members')
        setLoadingMembers(false)
      }
    }

    loadUsers()
    // including the missing dependency `resourceByUser` causes an infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [environment, currentPage])

  return (
    <div className="Box">
      <div className="Box-row" data-testid="members-list-wrapper">
        <Heading
          as="h4"
          sx={{mb: Spacing.StandardPadding, fontSize: Fonts.CardHeadingFontSize}}
          data-testid="members-list-header"
        >
          Members
        </Heading>
        <SelectedRows
          loading={loadingMembers}
          removeOption={() => {}}
          selected={pagedMembersData}
          totalCount={currentMembers.length}
        />
        {loadMembersError && <ErrorBanner message={loadMembersError} sx={{mt: 2, mb: 0}} />}
        <ResourcePaginator
          totalResources={currentMembers.length}
          pageCount={pageCount}
          pageSize={pageSize}
          currentPage={currentPage}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  )
}
