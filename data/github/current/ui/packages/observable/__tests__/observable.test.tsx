import {ObservableMap, ObservableSet, ObservableValue} from '../observable'

describe('ObservableValue', () => {
  it('notifies subscribers when its value changes', () => {
    const observable = new ObservableValue(1)
    const onChange = jest.fn()
    observable.subscribe(onChange)

    observable.value = 2
    expect(onChange).toHaveBeenCalledWith(2)
  })

  it('does not notify subscribers when its value does not change', () => {
    const observable = new ObservableValue(1)
    const onChange = jest.fn()
    observable.subscribe(onChange)

    observable.value = 1
    expect(onChange).not.toHaveBeenCalled()
  })

  it('does not notify subscribers after they unsubscribe', () => {
    const observable = new ObservableValue(1)
    const onChange = jest.fn()
    const unsubscribe = observable.subscribe(onChange)

    unsubscribe()
    observable.value = 2
    expect(onChange).not.toHaveBeenCalled()
  })
})

describe('ObservableSet', () => {
  it('notifies subscribers when an element is added', () => {
    const observable = new ObservableSet()
    const onChange = jest.fn()
    observable.subscribe(onChange)

    observable.add(1)
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls[0][0].size).toBe(1)
  })

  it('notifies subscribers when an element is removed', () => {
    const observable = new ObservableSet([1, 2, 3])
    const onChange = jest.fn()
    observable.subscribe(onChange)

    observable.delete(2)
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls[0][0].size).toBe(2)
  })

  it('notifies subscribers when the contents are cleared', () => {
    const observable = new ObservableSet([1, 2, 3])
    const onChange = jest.fn()
    observable.subscribe(onChange)

    observable.clear()
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls[0][0].size).toBe(0)
  })

  it('does not notify subscribers for no-op changes', () => {
    const observable = new ObservableSet([1, 2, 3])
    const onChange = jest.fn()
    observable.subscribe(onChange)

    observable.add(1)
    expect(onChange).not.toHaveBeenCalled()

    observable.delete(4)
    expect(onChange).not.toHaveBeenCalled()
  })

  describe('has', () => {
    it('returns an observable that is notified of changes', () => {
      const observable = new ObservableSet([1, 2, 3])
      const hasObservable = observable.has(2)
      const onChange = jest.fn()
      hasObservable.subscribe(onChange)

      observable.delete(2)
      expect(onChange).toHaveBeenCalledWith(false)

      observable.add(2)
      expect(onChange).toHaveBeenCalledWith(true)

      onChange.mockReset()
      observable.add(2)
      expect(onChange).not.toHaveBeenCalled() // 2 is already in the set

      observable.add(4)
      expect(onChange).not.toHaveBeenCalled() // we are only subscribed to 2

      observable.clear()
      expect(onChange).toHaveBeenCalledWith(false)
    })
  })
})

describe('ObservableMap', () => {
  it('notifies subscribers when an element is added', () => {
    const observable = new ObservableMap<string, number>()
    const onChange = jest.fn()
    observable.subscribe(onChange)

    observable.set('foo', 1)
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls[0][0].size).toBe(1)
  })

  it('notifies subscribers when an value is updated', () => {
    const observable = new ObservableMap<string, number>([
      ['foo', 1],
      ['bar', 2],
      ['baz', 3],
    ])
    const onChange = jest.fn()
    observable.subscribe(onChange)

    observable.set('bar', 4)
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('notifies subscribers when an element is removed', () => {
    const observable = new ObservableMap<string, number>([
      ['foo', 1],
      ['bar', 2],
      ['baz', 3],
    ])
    const onChange = jest.fn()
    observable.subscribe(onChange)

    observable.delete('bar')
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls[0][0].size).toBe(2)
  })

  it('notifies subscribers when the contents are cleared', () => {
    const observable = new ObservableMap<string, number>([
      ['foo', 1],
      ['bar', 2],
      ['baz', 3],
    ])
    const onChange = jest.fn()
    observable.subscribe(onChange)

    observable.clear()
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls[0][0].size).toBe(0)
  })

  it('does not notify subscribers for no-op changes', () => {
    const observable = new ObservableMap<string, number>([
      ['foo', 1],
      ['bar', 2],
      ['baz', 3],
    ])
    const onChange = jest.fn()
    observable.subscribe(onChange)

    observable.set('foo', 1)
    expect(onChange).not.toHaveBeenCalled()

    observable.delete('not in the map')
    expect(onChange).not.toHaveBeenCalled()
  })

  describe('has', () => {
    it('returns an observable that is notified of changes', () => {
      const observable = new ObservableMap<string, number>([
        ['foo', 1],
        ['bar', 2],
        ['baz', 3],
      ])
      const hasObservable = observable.has('bar')
      const onChange = jest.fn()
      hasObservable.subscribe(onChange)

      observable.delete('bar')
      expect(onChange).toHaveBeenCalledWith(false)

      observable.set('bar', 5)
      expect(onChange).toHaveBeenCalledWith(true)

      onChange.mockReset()
      observable.set('bar', 5)
      expect(onChange).not.toHaveBeenCalled() // 'bar' already has the value 5

      observable.set('baz', 4)
      expect(onChange).not.toHaveBeenCalled() // we are only subscribed to 'bar
    })
  })

  describe('get', () => {
    it('returns an observable that is notified of changes', () => {
      const observable = new ObservableMap<string, number>([
        ['foo', 1],
        ['bar', 2],
        ['baz', 3],
      ])
      const hasObservable = observable.get('bar')
      const onChange = jest.fn()
      hasObservable.subscribe(onChange)

      observable.delete('bar')
      expect(onChange).toHaveBeenCalledWith(undefined)

      observable.set('bar', 5)
      expect(onChange).toHaveBeenCalledWith(5)

      onChange.mockReset()
      observable.set('bar', 5)
      expect(onChange).not.toHaveBeenCalled() // 'bar' already has the value 5

      observable.set('baz', 4)
      expect(onChange).not.toHaveBeenCalled() // we are only subscribed to 'bar
    })
  })
})
