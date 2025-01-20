import {formatQuery} from '../../client/components/automation/helpers/search-constants'

describe('formatQuery', () => {
  it('should separate content type qualifiers from other types of qualifiers', () => {
    const query = 'is:closed,issue,merged label:bug'

    expect(formatQuery(query)).toEqual('is:issue is:closed,merged label:bug')
  })

  it('should replace content type qualifiers with empty string if both content types are selected', () => {
    const query = 'label:bug is:pr,merged,issue'

    expect(formatQuery(query)).toEqual('label:bug is:merged')
  })

  it('should format all occurrences of the `is` qualifier correctly', () => {
    const query = 'is:pr,merged is:closed,issue is:cat'

    expect(formatQuery(query)).toEqual('is:pr is:merged is:issue is:closed is:cat')
  })

  it('should remove content types if both are selected', () => {
    const query = 'is:issue,pr label:bug'

    expect(formatQuery(query)).toEqual('label:bug')
  })

  it('should keep the correct content type qualifer', () => {
    const query = 'is:issue label:bug'

    expect(formatQuery(query)).toEqual('is:issue label:bug')
  })
})
