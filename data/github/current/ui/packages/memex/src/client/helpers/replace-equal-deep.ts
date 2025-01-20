/**
 * This function returns `a` if `b` is deeply equal.
 * If not, it will replace any deeply equal children of `b` with those of `a`.
 * This can be used for structural sharing between JSON values for example.
 *
 * modified from https://github.com/TanStack/query
 */
export function replaceEqualDeep<T>(a: unknown, b: T): T {
  if (a === b) {
    return a as T
  }

  const array = isPlainArray(a) && isPlainArray(b)

  if (array || (isPlainObject(a) && isPlainObject(b))) {
    const aSize = array ? a.length : Object.keys(a).length
    const bItems = array ? b : Object.keys(b)
    const bSize = bItems.length
    const copy = array ? ([] as T) : ({} as T)

    let equalItems = 0

    for (let i = 0; i < bSize; i++) {
      const key = array ? i : bItems[i]
      // @ts-expect-error key in object checks fail on any
      copy[key] = replaceEqualDeep(a[key], b[key])
      // @ts-expect-error key in object checks fail on any
      if (copy[key] === a[key]) {
        equalItems++
      }
    }

    return aSize === bSize && equalItems === aSize ? (a as T) : copy
  }

  return b
}

/**
 *  Copied from: https://github.com/TanStack/query
 */
function isPlainArray(value: unknown): value is Array<unknown> {
  return Array.isArray(value) && value.length === Object.keys(value).length
}

// Modified from: https://github.com/jonschlinkert/is-plain-object
export function isPlainObject(o: any): o is object {
  if (!hasObjectPrototype(o)) {
    return false
  }

  // If has modified constructor
  const ctor = o.constructor
  if (typeof ctor === 'undefined') {
    return true
  }

  const prot = ctor.prototype
  if (
    // If has modified prototype
    !hasObjectPrototype(prot) ||
    // If constructor does not have an Object-specific method
    !hasConstructorObjectSpecificMethod(prot)
  ) {
    return false
  }

  // Most likely a plain Object
  return true
}

function hasObjectPrototype(o: any): o is object {
  return Object.prototype.toString.call(o) === '[object Object]'
}

function hasConstructorObjectSpecificMethod(o: any): o is object {
  return Object.prototype.hasOwnProperty.call(o, 'isPrototypeOf')
}
