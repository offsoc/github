import {useCallback, useEffect, useRef, useState} from 'react'
import {Box, Dialog, Link, Pagination, Text} from '@primer/react'
import {testIdProps} from '@github-ui/test-id-props'
import {verifiedFetch} from '@github-ui/verified-fetch'
import type {Dependency} from './types'

interface DependenciesDialogBoxProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  dependencyCount: number
  orgName: string
  sponsorableName: string
}

const DependenciesDialogBox = ({
  isOpen,
  setIsOpen,
  dependencyCount,
  orgName,
  sponsorableName,
}: DependenciesDialogBoxProps) => {
  // This PAGE_SIZE setting originates from this default setting: https://github.com/github/github/blob/169dea9cdeb71905654fbff385eb1fe6bb2272a9/app/controllers/sponsors/shared_dependencies_controller_methods.rb#L12
  // Since this is inherited from Rails, we're hardcoding it here, and it cannot be overridden via this React file.
  // To override this setting, do it in the `sponsors/represented_dependencies_controller` filter_set.
  const PAGE_SIZE = 8
  const [dependencies, setDependencies] = useState<Dependency[]>([])
  const [currentPaginatedPage, setCurrentPaginatedPage] = useState<number>(1)
  const returnFocusRef = useRef(null)
  const onPageChange: Parameters<typeof Pagination>['0']['onPageChange'] = (e, page) => {
    setCurrentPaginatedPage(page)
    e.preventDefault()
  }

  const getDependencies = useCallback(async () => {
    const url = `/sponsors/${sponsorableName}/represented-dependencies?account=${orgName}&page=${currentPaginatedPage}&format=json`
    const res = await verifiedFetch(url, {
      method: 'GET',
    })
    if (res?.ok) {
      const paginatedRepositories = await res.json()
      setDependencies(paginatedRepositories)
    }
  }, [currentPaginatedPage, orgName, sponsorableName])

  useEffect(() => {
    if (isOpen) {
      getDependencies()
    }
  }, [isOpen, getDependencies])

  return (
    <Dialog
      title="Repository List"
      onDismiss={() => {
        setIsOpen(false)
      }}
      isOpen={isOpen}
      {...testIdProps('dialog-box')}
      returnFocusRef={returnFocusRef}
      sx={{overflowY: 'auto'}}
    >
      <div>
        <Dialog.Header id="header">Repository List</Dialog.Header>
        <Box sx={{fontSize: 1}}>
          <Box sx={{padding: 3, borderBottom: '1px solid', borderColor: 'border.subtle'}}>
            <Text sx={{fontWeight: 'bold'}}>{orgName}</Text>
            <span>&nbsp;depends on {dependencyCount} repositories</span>
            <Text sx={{fontWeight: 'bold'}}>&nbsp;{sponsorableName}</Text>
            <span>&nbsp;owns or maintains</span>
          </Box>
          <div>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: 1,
                paddingBottom: 1,
                paddingLeft: 3,
                paddingRight: 3,
              }}
            >
              <Text sx={{fontSize: 0, fontWeight: 'bold', color: 'fg.subtle'}}>Repository Name</Text>
            </Box>
            <div>
              {/* TODO: Add loading state and empty/error state*/}
              {dependencies.map((dep: Dependency, index: number) => {
                return (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      borderTop: '1px solid',
                      borderColor: 'border.subtle',
                      padding: 3,
                    }}
                  >
                    <span>
                      <Link href={`https://github.com/${dep.fullRepoName}`}>{dep.name}</Link>
                    </span>
                  </Box>
                )
              })}
              {dependencies.length > PAGE_SIZE && (
                <Box
                  sx={{
                    borderTop: '1px solid',
                    borderColor: 'border.subtle',
                  }}
                >
                  <Pagination
                    pageCount={Math.ceil(dependencyCount / PAGE_SIZE)}
                    currentPage={currentPaginatedPage}
                    onPageChange={onPageChange}
                    showPages={{
                      narrow: false,
                    }}
                  />
                </Box>
              )}
            </div>
          </div>
        </Box>
      </div>
    </Dialog>
  )
}

export default DependenciesDialogBox
