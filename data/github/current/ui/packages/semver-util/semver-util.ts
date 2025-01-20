// Official Semver Regex Source https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string
const FULL_SEMVER_REGEX =
  /^(?<major>0|[1-9]\d*)\.(?<minor>0|[1-9]\d*)\.(?<patch>0|[1-9]\d*)(?:-(?<prerelease>(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+(?<buildmetadata>[0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/

export function isFullSemver(version: string): boolean {
  const versionWithoutV = version.replace(/^v/, '') // strip off leading v if exists
  return FULL_SEMVER_REGEX.test(versionWithoutV)
}
