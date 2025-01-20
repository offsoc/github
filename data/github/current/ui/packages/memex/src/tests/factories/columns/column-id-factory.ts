import {Factory} from 'fishery'

export const columnIdFactory = Factory.define<number>(({sequence}) => sequence)
