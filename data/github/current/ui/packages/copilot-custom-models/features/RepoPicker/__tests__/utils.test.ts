import {formatQueryWithOrg} from '../utils'

describe('formatQueryWithOrg', () => {
  it('removes any improperly injected query and injects correct one', () => {
    const org = 'added'
    const query = 'prefix OrG:injected my-repo'
    const formatted = formatQueryWithOrg({org, query})

    expect(formatted).toEqual('org:added prefix my-repo')
  })

  it('removes extraneous spaces', () => {
    const org = 'added  '
    const query = ' prefix   org:injected   my-repo  '
    const formatted = formatQueryWithOrg({org, query})

    expect(formatted).toEqual('org:added prefix my-repo')
  })

  it('returns org when query is empty', () => {
    const org = 'added'
    const query = '  '
    const formatted = formatQueryWithOrg({org, query})

    expect(formatted).toEqual('org:added')
  })
})
