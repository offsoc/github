import {Factory} from 'fishery'

export const memexItemIdFactory = Factory.define<number>(({sequence}) => sequence)
