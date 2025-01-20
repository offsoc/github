// a comma, or space, followed by an optional operator, followed by the value

import memoize from 'lodash-es/memoize'

// visual chart: https://regexper.com/#%2F%28%5B%5Cs%2C%3A%22%5D*%3F%29%28%28%3F%3A%3E%7C%3C%7C%3E%3D%7C%3C%3D%29*%5B%5Cw%5C-_%22'%3F%2F%5C%5C.%3D%2B!%40%23%24%25%5E%26*%28%29%3B%5D*%29%24%2Fg
export const getLastDelimiterRegex = memoize((valueDelimiter: string) => {
  return new RegExp(
    `([\\s${valueDelimiter}"]*?)((?:>|<|>=|<=)*[\\w\\d\\-_"'?/\\.=+!@#$%^&*);:\\p{Extended_Pictographic}]*)$`,
    'gu',
  )
})
