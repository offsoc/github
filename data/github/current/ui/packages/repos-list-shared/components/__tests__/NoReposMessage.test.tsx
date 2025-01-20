import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'

import {NoReposMessage, type UserInfo} from '../NoReposMessage'

const users = {
  admin: {admin: true, canCreateRepository: true, directOrTeamMember: true} satisfies UserInfo,
  member: {admin: false, canCreateRepository: false, directOrTeamMember: true} satisfies UserInfo,
  nonMember: {admin: false, canCreateRepository: false, directOrTeamMember: false} satisfies UserInfo,
  adminNoCreate: {admin: true, canCreateRepository: false, directOrTeamMember: true} satisfies UserInfo,
  anonymous: undefined,
}

const sampleProps = {currentPage: 1, pageCount: 4, userInfo: users.admin}

describe('NoReposMessage', () => {
  it('no matches if filtering', () => {
    render(<NoReposMessage {...sampleProps} filtered={true} />)

    expect(screen.getByText('No repositories matched your search.')).toBeInTheDocument()
  })

  it('no more repos if current page is greater than total pages', () => {
    render(<NoReposMessage {...sampleProps} currentPage={5} />)
    expect(screen.getByText('No more repositories. Visit a lower page.')).toBeInTheDocument()
  })

  it('no repos for member', () => {
    render(<NoReposMessage {...sampleProps} userInfo={users.member} />)
    expect(screen.getByText("Your teams don't have access to any repositories.")).toBeInTheDocument()
  })

  it('no repos for admin', () => {
    render(<NoReposMessage {...sampleProps} userInfo={users.admin} />)
    expect(screen.getByText('This organization has no repositories.')).toBeInTheDocument()
    expect(screen.getByRole('link', {name: 'New repository'})).toBeInTheDocument()
  })

  it('no repos for admin (cannot create on this page)', () => {
    render(<NoReposMessage {...sampleProps} userInfo={users.adminNoCreate} />)
    expect(screen.getByText('This organization has no repositories.')).toBeInTheDocument()
    expect(screen.queryByRole('link', {name: 'New repository'})).not.toBeInTheDocument()
  })

  it('no repos for non-member', () => {
    render(<NoReposMessage {...sampleProps} userInfo={users.nonMember} />)
    expect(screen.getByText('This organization has no public repositories.')).toBeInTheDocument()
  })

  it('no repos for anonymou', () => {
    render(<NoReposMessage {...sampleProps} userInfo={users.anonymous} />)
    expect(screen.getByText('This organization has no public repositories.')).toBeInTheDocument()
  })
})
