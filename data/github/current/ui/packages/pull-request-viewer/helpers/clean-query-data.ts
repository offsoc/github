type RawData<T> = {
  readonly edges?:
    | ReadonlyArray<
        | {
            readonly node?: T | null
          }
        | null
        | undefined
      >
    | null
    | undefined
}

export default function cleanData<T>(data: RawData<T>): readonly T[] {
  return (data.edges || []).flatMap(a => (a && a.node ? [a.node] : []))
}
