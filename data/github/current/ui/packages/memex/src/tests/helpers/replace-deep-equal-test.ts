import {replaceEqualDeep} from '../../client/helpers/replace-equal-deep'

//https://github.com/TanStack/query
describe('replaceEqualDeep', () => {
  it('should return the previous value when the next value is an equal primitive', () => {
    expect(replaceEqualDeep(1, 1)).toBe(1)
    expect(replaceEqualDeep('1', '1')).toBe('1')
    expect(replaceEqualDeep(true, true)).toBe(true)
    expect(replaceEqualDeep(false, false)).toBe(false)
    expect(replaceEqualDeep(null, null)).toBe(null)
    expect(replaceEqualDeep(undefined, undefined)).toBe(undefined)
  })
  it('should return the next value when the previous value is a different value', () => {
    const date1 = new Date()
    const date2 = new Date()
    expect(replaceEqualDeep(1, 0)).toBe(0)
    expect(replaceEqualDeep(1, 2)).toBe(2)
    expect(replaceEqualDeep('1', '2')).toBe('2')
    expect(replaceEqualDeep(true, false)).toBe(false)
    expect(replaceEqualDeep(false, true)).toBe(true)
    expect(replaceEqualDeep(date1, date2)).toBe(date2)
  })

  it('should return the next value when the previous value is a different type', () => {
    const array = [1]
    const object = {a: 'a'}
    expect(replaceEqualDeep(0, undefined)).toBe(undefined)
    expect(replaceEqualDeep(undefined, 0)).toBe(0)
    expect(replaceEqualDeep(2, undefined)).toBe(undefined)
    expect(replaceEqualDeep(undefined, 2)).toBe(2)
    expect(replaceEqualDeep(undefined, null)).toBe(null)
    expect(replaceEqualDeep(null, undefined)).toBe(undefined)
    expect(replaceEqualDeep({}, undefined)).toBe(undefined)
    expect(replaceEqualDeep([], undefined)).toBe(undefined)
    expect(replaceEqualDeep(array, object)).toBe(object)
    expect(replaceEqualDeep(object, array)).toBe(array)
  })

  it('should return the previous value when the next value is an equal array', () => {
    const prev = [1, 2]
    const next = [1, 2]
    expect(replaceEqualDeep(prev, next)).toBe(prev)
  })

  it('should return a copy when the previous value is a different array subset', () => {
    const prev = [1, 2]
    const next = [1, 2, 3]
    const result = replaceEqualDeep(prev, next)
    expect(result).toEqual(next)
    expect(result).not.toBe(prev)
    expect(result).not.toBe(next)
  })

  it('should return a copy when the previous value is a different array superset', () => {
    const prev = [1, 2, 3]
    const next = [1, 2]
    const result = replaceEqualDeep(prev, next)
    expect(result).toEqual(next)
    expect(result).not.toBe(prev)
    expect(result).not.toBe(next)
  })

  it('should return the previous value when the next value is an equal empty array', () => {
    const prev: Array<any> = []
    const next: Array<any> = []
    expect(replaceEqualDeep(prev, next)).toBe(prev)
  })

  it('should return the previous value when the next value is an equal empty object', () => {
    const prev = {}
    const next = {}
    expect(replaceEqualDeep(prev, next)).toBe(prev)
  })

  it('should return the previous value when the next value is an equal object', () => {
    const prev = {a: 'a'}
    const next = {a: 'a'}
    expect(replaceEqualDeep(prev, next)).toBe(prev)
  })

  it('should replace different values in objects', () => {
    const prev = {a: {b: 'b'}, c: 'c'}
    const next = {a: {b: 'b'}, c: 'd'}
    const result = replaceEqualDeep(prev, next)
    expect(result).toEqual(next)
    expect(result).not.toBe(prev)
    expect(result).not.toBe(next)
    expect(result.a).toBe(prev.a)
    expect(result.c).toBe(next.c)
  })

  it('should replace different values in arrays', () => {
    const prev = [1, {a: 'a'}, {b: {b: 'b'}}, [1]] as const
    const next = [1, {a: 'a'}, {b: {b: 'c'}}, [1]] as const
    const result = replaceEqualDeep(prev, next)
    expect(result).toEqual(next)
    expect(result).not.toBe(prev)
    expect(result).not.toBe(next)
    expect(result[0]).toBe(prev[0])
    expect(result[1]).toBe(prev[1])
    expect(result[2]).not.toBe(next[2])
    expect(result[2].b.b).toBe(next[2].b.b)
    expect(result[3]).toBe(prev[3])
  })

  it('should replace different values in arrays when the next value is a subset', () => {
    const prev = [{a: 'a'}, {b: 'b'}, {c: 'c'}]
    const next = [{a: 'a'}, {b: 'b'}]
    const result = replaceEqualDeep(prev, next)
    expect(result).toEqual(next)
    expect(result).not.toBe(prev)
    expect(result).not.toBe(next)
    expect(result[0]).toBe(prev[0])
    expect(result[1]).toBe(prev[1])
    expect(result[2]).toBeUndefined()
  })

  it('should replace different values in arrays when the next value is a superset', () => {
    const prev = [{a: 'a'}, {b: 'b'}]
    const next = [{a: 'a'}, {b: 'b'}, {c: 'c'}]
    const result = replaceEqualDeep(prev, next)
    expect(result).toEqual(next)
    expect(result).not.toBe(prev)
    expect(result).not.toBe(next)
    expect(result[0]).toBe(prev[0])
    expect(result[1]).toBe(prev[1])
    expect(result[2]).toBe(next[2])
  })

  it('should copy objects which are not arrays or objects', () => {
    const prev = [{a: 'a'}, {b: 'b'}, {c: 'c'}, 1]
    const next = [{a: 'a'}, new Map(), {c: 'c'}, 2]
    const result = replaceEqualDeep(prev, next)
    expect(result).not.toBe(prev)
    expect(result).not.toBe(next)
    expect(result[0]).toBe(prev[0])
    expect(result[1]).toBe(next[1])
    expect(result[2]).toBe(prev[2])
    expect(result[3]).toBe(next[3])
  })

  it('should support equal objects which are not arrays or objects', () => {
    const map = new Map()
    const prev = [map, [1]]
    const next = [map, [1]]
    const result = replaceEqualDeep(prev, next)
    expect(result).toBe(prev)
  })

  it('should support non equal objects which are not arrays or objects', () => {
    const map1 = new Map()
    const map2 = new Map()
    const prev = [map1, [1]]
    const next = [map2, [1]]
    const result = replaceEqualDeep(prev, next)
    expect(result).not.toBe(prev)
    expect(result).not.toBe(next)
    expect(result[0]).toBe(next[0])
    expect(result[1]).toBe(prev[1])
  })

  it('should support objects which are not plain arrays', () => {
    const prev = Object.assign([1, 2], {a: {b: 'b'}, c: 'c'})
    const next = Object.assign([1, 2], {a: {b: 'b'}, c: 'c'})
    const result = replaceEqualDeep(prev, next)
    expect(result).toBe(next)
  })

  it('should replace all parent objects if some nested value changes', () => {
    const prev = {
      todo: {id: '1', meta: {createdAt: 0}, state: {done: false}},
      otherTodo: {id: '2', meta: {createdAt: 0}, state: {done: true}},
    }
    const next = {
      todo: {id: '1', meta: {createdAt: 0}, state: {done: true}},
      otherTodo: {id: '2', meta: {createdAt: 0}, state: {done: true}},
    }
    const result = replaceEqualDeep(prev, next)
    expect(result).toEqual(next)
    expect(result).not.toBe(prev)
    expect(result).not.toBe(next)
    expect(result.todo).not.toBe(prev.todo)
    expect(result.todo).not.toBe(next.todo)
    expect(result.todo.id).toBe(next.todo.id)
    expect(result.todo.meta).toBe(prev.todo.meta)
    expect(result.todo.state).not.toBe(next.todo.state)
    expect(result.todo.state.done).toBe(next.todo.state.done)
    expect(result.otherTodo).toBe(prev.otherTodo)
  })

  it('should replace all parent arrays if some nested value changes', () => {
    const prev = {
      todos: [
        {id: '1', meta: {createdAt: 0}, state: {done: false}},
        {id: '2', meta: {createdAt: 0}, state: {done: true}},
      ],
    }
    const next = {
      todos: [
        {id: '1', meta: {createdAt: 0}, state: {done: true}},
        {id: '2', meta: {createdAt: 0}, state: {done: true}},
      ],
    }
    const result = replaceEqualDeep(prev, next)
    expect(result).toEqual(next)
    expect(result).not.toBe(prev)
    expect(result).not.toBe(next)
    expect(result.todos).not.toBe(prev.todos)
    expect(result.todos).not.toBe(next.todos)
    expect(result.todos[0]).not.toBe(prev.todos[0])
    expect(result.todos[0]).not.toBe(next.todos[0])
    expect(result.todos[0]?.id).toBe(next.todos[0]?.id)
    expect(result.todos[0]?.meta).toBe(prev.todos[0]?.meta)
    expect(result.todos[0]?.state).not.toBe(next.todos[0]?.state)
    expect(result.todos[0]?.state.done).toBe(next.todos[0]?.state.done)
    expect(result.todos[1]).toBe(prev.todos[1])
  })
})
