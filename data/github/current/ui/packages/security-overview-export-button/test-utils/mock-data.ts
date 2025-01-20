import type {SecurityOverviewExportButtonProps} from '../SecurityOverviewExportButton'

export function getSecurityOverviewExportButtonProps({
  createExportUrl,
  errorBannerId,
  startedBannerId,
}: Partial<SecurityOverviewExportButtonProps> = {}): SecurityOverviewExportButtonProps {
  return {
    createExportUrl: createExportUrl ?? '/orgs/test-org/security/risk/export',
    errorBannerId,
    startedBannerId,
  }
}
