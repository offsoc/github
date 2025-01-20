export function joinOxford(arr: Array<string>, conjunction = 'and') {
  if (arr.length <= 2) {
    return arr.join(` ${conjunction} `)
  } else {
    const last = arr.pop()
    arr.push(`${conjunction} ${last}`)
    return arr.join(', ')
  }
}
