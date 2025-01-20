/**
 * Returns the type of the elements in the given array type.
 */
export type ArrayElement<ArrayType> = ArrayType extends readonly unknown[] ? ArrayType[number] : never
