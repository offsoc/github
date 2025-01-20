/**
 * based loosely on https://github.com/victorteokw/query-string-parser/blob/master/query_string_parser.es6
 */

import {not_typesafe_nonNullAssertion} from '../../client/helpers/non-null-assertion'

const QUERY_KEY_PATH_REGEX = /\[([^\]]*)\]/gi
const QUERY_ROOT_KEY_REGEX = /^([^[\]]+)/

function hashCanBeMerged(hash: Record<string, any>, nextKey: string, keyPath: Array<string>) {
  if (!hash[nextKey]) {
    return true
  }
  let nest = hash[nextKey]
  for (let i = 0, len = keyPath.length; i < len; i++) {
    nest = nest[not_typesafe_nonNullAssertion(keyPath[i])]
    if (!nest) {
      return true
    }
  }

  return false
}

function fillValue(obj: Record<string, any>, key: string, keyPaths: Array<string>, value: string) {
  if (keyPaths.length === 0) {
    if (key.length === 0) {
      if (value === undefined && obj.length === 0) {
        return
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      obj.push(value)
    } else {
      obj[key] = value
    }
    return
  }

  // safe to assert this because we know keyPaths.length > 0
  const nextKey = not_typesafe_nonNullAssertion(keyPaths.shift())

  /**
   * the current item and next by keys are both arrays
   */
  if (key.length === 0 && nextKey.length === 0) {
    if (!(obj[obj.length - 1] && Array.isArray(obj[obj.length - 1]))) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      obj.push([])
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    fillValue(obj[obj.length - 1], nextKey, keyPaths, value)
    return
  }

  /**
   * The current item is an array and the next item is an object
   */
  if (key.length === 0 && nextKey.length > 0) {
    if (obj.length === 0 || Array.isArray(obj[obj.length - 1]) || typeof obj[obj.length - 1] !== 'object') {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      obj.push({})
    }
    let lastHash = obj[obj.length - 1]

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    if (!hashCanBeMerged(lastHash, nextKey, keyPaths)) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      obj.push({})
      lastHash = obj[obj.length - 1]
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    fillValue(lastHash, nextKey, keyPaths, value)
    return
  }

  /**
   * The current item is an object and the next item is an array
   */
  if (key.length > 0 && nextKey.length === 0) {
    if (!obj[key]) {
      obj[key] = []
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    fillValue(obj[key], nextKey, keyPaths, value)
    return
  }

  /**
   * Both the current item and the next item are objects
   */
  if (key.length > 0 && nextKey.length > 0) {
    if (!obj[key]) {
      obj[key] = {}
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    fillValue(obj[key], nextKey, keyPaths, value)
  }
}

/**
 * Given a type, returns a type where scalar value types
 * are converted to string.
 */
type DeepTransformValuesToString<T> = T extends string
  ? T
  : T extends number
    ? string
    : T extends boolean
      ? 'true' | 'false'
      : T extends Array<infer U>
        ? Array<DeepTransformValuesToString<U>>
        : T extends object
          ? {[K in keyof T]: DeepTransformValuesToString<T[K]>}
          : never

/**
 * This method should only be used in test/dev environments to parse
 * requests handled through the `MockServer`
 *
 * Given a nested set of url_form_encoded data in a format Rack parses
 * return an object with the same structure, where each of the values are strings
 */
export function formDecodeToObject<T = unknown>(query: string): DeepTransformValuesToString<T> {
  const tokens = query.split(/[?&;] */)
  const retval: Record<string, any> = {}
  for (let i = 0, len = tokens.length; i < len; i++) {
    const token = not_typesafe_nonNullAssertion(tokens[i])
    if (token.length >= 0) {
      const [key, value] = token.split('=').map(t => decodeURIComponent(t))
      if (key !== undefined) {
        const keyPaths: Array<string> = []
        let result
        while ((result = QUERY_KEY_PATH_REGEX.exec(key))) {
          keyPaths.push(not_typesafe_nonNullAssertion(result[1]))
        }
        const rootKey = QUERY_ROOT_KEY_REGEX.exec(key)
        if (rootKey) {
          fillValue(retval, not_typesafe_nonNullAssertion(rootKey[1]), keyPaths, not_typesafe_nonNullAssertion(value))
        }
      }
    }
  }
  return retval as DeepTransformValuesToString<T>
}
