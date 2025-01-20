function jsonToFormData(obj: Record<string, any>, parts: Array<string>, parentKey = '', parentIsArray = false) {
  const objIsArray = Array.isArray(obj)
  // loosely based on implementation here: https://stackoverflow.com/a/42241875
  for (const key in obj) {
    const value = obj[key]
    if (value === undefined) {
      continue
    }
    const valueIsArray = Array.isArray(value)
    const valueIsObj = typeof value === 'object'
    let constructedKey = parentKey ? parentKey : ''

    if (parentIsArray) {
      constructedKey += '[]'
    }
    if (!parentKey) {
      constructedKey += key
    } else {
      if (!objIsArray) {
        constructedKey += `[${key}]`
      }
    }

    if (valueIsArray && value.length === 0) {
      parts.push(`${constructedKey}[]`)
    } else if (valueIsObj) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      jsonToFormData(value, parts, constructedKey, valueIsArray)
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      parts.push(`${constructedKey}=${encodeURIComponent(obj[key])}`)
    }
  }
}

/**
 * Encodes an object to be sent to the server with the header
 * Content-Type: application/x-www-form-urlencoded
 * in the request.
 * @param obj the object to encode
 */
export function formEncodeObject(obj: Record<string, any>) {
  const parts: Array<string> = []
  jsonToFormData(obj, parts)
  return parts.join('&')
}
