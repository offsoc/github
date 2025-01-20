import {useReplaceSearchParams} from '../hooks/UseReplaceSearchParams'
import {useState} from 'react'
import {TextInput, Link} from '@primer/react'
import {GitHubAvatar} from '@github-ui/github-avatar'
import {SearchIcon} from '@primer/octicons-react'
import {DataTable, Table} from '@primer/react/experimental'
import type {FilterOptionProps} from '../components/FilterOption'
import {SortButton} from '../components/SortButton'
import {FilterOption} from '../components/FilterOption'

export interface RequestsTableProps {
  title: string
  description: string
  filters?: FilterOptionProps[]
  rows: RequestTableRow[]
  page_size: number
  total_count: number
  variant?: string
  placeholder_text?: string
  pagination_text?: string
}

export interface RequestTableRow {
  id: number
  name: string
  total_requests: string
  rate_limited_requests: string
  last_rate_limited: string
  description: string
  href?: string
  icon_url?: string
  square_icon?: boolean
}

type CustomRowFunction = (row: RequestTableRow) => JSX.Element

const requestsCustomRow: CustomRowFunction = row => {
  return (
    <div className="d-flex flex-row flex-items-center gap-2">
      {row.icon_url && <GitHubAvatar src={row.icon_url} size={32} square={row.square_icon} />}
      <div className="d-flex flex-column">
        <Link href={row.href || '#'} className="f5 text-bold fgColor-default">
          {row.name}
        </Link>
        <span className="f6 fgColor-muted text-normal">{row.description}</span>
      </div>
    </div>
  )
}
const routesCustomRow: CustomRowFunction = row => {
  return (
    <div className="d-flex flex-column">
      <span className="f5 text-bold fgColor-default">{row.name}</span>
      <span className="f6 fgColor-muted text-normal">{row.description}</span>
    </div>
  )
}
type Variants = {
  [key: string]: CustomRowFunction
}
const rowVariants: Variants = {
  requests: requestsCustomRow,
  routes: routesCustomRow,
}

export function RequestsTable({
  variant = 'requests',
  title,
  description,
  filters,
  rows,
  page_size,
  total_count,
  placeholder_text,
  pagination_text,
}: RequestsTableProps) {
  const {searchParams, replaceSearchParams} = useReplaceSearchParams()
  const [value, setValue] = useState('')
  const currentPage = parseInt(searchParams.get('p') || '1', 10) - 1
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value)
  }
  return (
    <div className="d-flex flex-column gap-3 mt-3">
      <div className="d-flex flex-column">
        <h3 className="h4 m-0">{title}</h3>
        <p className="m-0 fgColor-muted">{description}</p>
      </div>
      <div className="d-flex flex-column flex-lg-row gap-2">
        <TextInput
          aria-label={placeholder_text || 'Search'}
          placeholder={placeholder_text || 'Search'}
          className="flex-1"
          onKeyDown={event => {
            // This is not a hotkey, submits the search input
            // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
            if (event.key === 'Enter') {
              replaceSearchParams('q', value)
            }
          }}
          trailingAction={
            <TextInput.Action
              onClick={() => {
                replaceSearchParams('q', value)
              }}
              icon={SearchIcon}
              aria-label="Search"
              className="rounded-0 borderColor-default border-0 border-left"
            />
          }
          value={value}
          onChange={handleChange}
        />
        {filters &&
          filters.map(filter => {
            return <FilterOption key={filter.group.query_param} {...filter} />
          })}
      </div>
      <Table.Container>
        <DataTable
          aria-labelledby="actors"
          aria-describedby="actors-subtitle"
          data={rows}
          columns={[
            {
              header: () => {
                return <SortButton title="Name" query_param="n" />
              },
              rowHeader: true,
              field: 'name',
              renderCell: rowVariants[variant],
            },
            {
              header: () => {
                return <SortButton title="Total requests" query_param="tr" />
              },
              field: 'total_requests',
              renderCell: row => {
                return <span className="f5 px-1">{row.total_requests}</span>
              },
            },
            {
              header: () => {
                return <SortButton title="Rate-limited requests" query_param="rlr" />
              },
              field: 'rate_limited_requests',
              renderCell: row => {
                return <span className="f5 px-1">{row.rate_limited_requests}</span>
              },
            },
            {
              header: () => {
                return <SortButton title="Last rate limited" query_param="lrl" />
              },
              field: 'last_rate_limited',
              renderCell: row => {
                return <span className="f5 px-1">{row.last_rate_limited}</span>
              },
            },
          ]}
        />
        <Table.Pagination
          aria-label={pagination_text || 'Pagination'}
          pageSize={page_size}
          totalCount={total_count}
          defaultPageIndex={currentPage}
          onChange={({pageIndex}) => {
            replaceSearchParams('p', (pageIndex + 1).toString())
          }}
        />
      </Table.Container>
    </div>
  )
}
