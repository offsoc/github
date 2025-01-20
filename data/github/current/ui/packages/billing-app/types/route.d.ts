type Route<Path extends string, FullPath extends string> = {
  path: Path
  pathWithChildPaths: string
  fullPath: FullPath
  fullPathWithChildPaths: string
  generatePath(args: ExtractRouteParams<Path>): string
  generateFullPath(args: {
    [K in keyof ExtractRouteParams<FullPath>]: string | number
  }): string
  matchPath(pathToMatch: string): PathMatch<ParamParseKey<Path>> | null
  matchFullPath(pathToMatch: string): PathMatch<ParamParseKey<FullPath>> | null
  matchPathOrChildPaths<ParamKey extends string>(pathToMatch: string): PathMatch<ParamKey> | null
  matchFullPathOrChildPaths<ParamKey extends string>(pathToMatch: string): PathMatch<ParamKey> | null
  childRoute<ChildFullPath extends string>(childPath: string): Route<string, ChildFullPath>
}
