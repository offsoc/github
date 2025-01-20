type SetOptions<T> = T extends Set<infer U> ? U : never
