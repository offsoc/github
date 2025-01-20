// This file contains only base type mocks. What do we see as a base type? Anything which is required to
// render a page successfully and requires a special format but not a special value. For example,
// the graphql type DateTime would be mocked by default as `mock-value-for-datetime` which does represent a date
// therefore we just return a date which is in the correct format.
// PLEASE dont add any mocks here which are required for
// a indiviual test to pass. These should be defined next to the test implementation.
import type {MockResolverContext} from 'relay-test-utils/lib/RelayMockPayloadGenerator'

// return a data string for a DateTime field in the correct format
const DateTime = () => '2021-01-01T00:00:00Z'

const String = (context: MockResolverContext) => {
  // return a a hex color string for a color field
  if (context.name === 'color') {
    return 'ff0000'
  }
}

const URI = (context: MockResolverContext) => {
  // return a URI for an avatarUrl field
  if (context.name === 'avatarUrl') {
    return 'https://avatars.githubusercontent.com/u/9919?v=4&size=48'
  }
}

export const DefaultMocks = {
  DateTime,
  String,
  URI,
}
