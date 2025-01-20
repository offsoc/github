import safeStorage from './safe-storage'

export const {getItem, setItem, removeItem} = safeStorage('sessionStorage')
