import {Button, Flash} from '@primer/react'
import {Blankslate} from '@primer/react/drafts'
import {Link} from '@github-ui/react-core/link'
import {ListView} from '@github-ui/list-view'
import {ListViewMetadata} from '@github-ui/list-view/ListViewMetadata'
import {RecursiveGroup} from '../components/RecursiveGroup'
import {Layout} from '../components/Layout'
import {useGroupTreeContext} from '../contexts/GroupTreeContext'
import {PAGE} from '../types'
import {useCallback, useState} from 'react'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import {useBasePath} from '../contexts/BasePathContext'
import {useNavigate, useSearchParams} from '@github-ui/use-navigate'

export function List() {
  const basePath = useBasePath()
  const groupTree = useGroupTreeContext()
  const [searchParams] = useSearchParams()
  const [errorMessage, setErrorMessage] = useState('')
  const navigate = useNavigate()

  const tree = groupTree?.tree
  const groups = groupTree?.groups || []

  const onRemoveGroup = useCallback(
    async (id: number) => {
      setErrorMessage('')
      const response = await verifiedFetchJSON(`${basePath}/${id}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        searchParams.set('removed', `${id}`)
        navigate(`${basePath}?${searchParams.toString()}`)
      } else {
        const error = await response.json()
        setErrorMessage(error.message || 'Failed to remove group')
      }
    },
    [basePath, searchParams, navigate],
  )

  return (
    <Layout page={PAGE.List}>
      <div className="d-flex flex-column gap-3">
        {errorMessage ? <Flash variant="danger">{errorMessage}</Flash> : null}
        <ListView
          title="List of groups of repositories for this organization"
          variant="default"
          pluralUnits="groups"
          singularUnits="group"
          totalCount={groups.length}
          metadata={
            <ListViewMetadata
              title={
                <span className="font-bold">
                  {groups.length} {groups.length === 1 ? 'group' : 'groups'}
                </span>
              }
            >
              <Button as={Link} to="./new">
                New group
              </Button>
            </ListViewMetadata>
          }
        >
          {tree ? (
            <RecursiveGroup tree={tree} onRemoveGroup={onRemoveGroup} />
          ) : (
            <li>
              <Blankslate>Your groups are in another castle</Blankslate>
            </li>
          )}
        </ListView>
      </div>
    </Layout>
  )
}
