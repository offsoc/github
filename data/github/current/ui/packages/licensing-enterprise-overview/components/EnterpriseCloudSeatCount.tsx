import {Link, Octicon, ProgressBar} from '@primer/react'
import {DotFillIcon} from '@primer/octicons-react'
import {clsx} from 'clsx'
import styles from './EnterpriseCloudSeatCount.module.css'
import {useNavigation} from '../contexts/NavigationContext'

export interface Props {
  canViewMembers: boolean
  isTrial: boolean
  isVolumeLicensed: boolean
  enterpriseLicensesConsumed: number
  enterpriseLicensesPurchased: number
  vssLicensesConsumed: number
  vssLicensesPurchasedWithOverage: number
}
export function EnterpriseCloudSeatCount({
  canViewMembers,
  isTrial,
  isVolumeLicensed,
  enterpriseLicensesConsumed,
  enterpriseLicensesPurchased,
  vssLicensesConsumed,
  vssLicensesPurchasedWithOverage,
}: Props) {
  return (
    <div className="d-flex flex-column gap-1">
      <h4 className="f5">Total consumed seats</h4>
      {!isVolumeLicensed && !isTrial ? (
        <SeatCountNoLimit seatsUsed={enterpriseLicensesConsumed} />
      ) : (
        <SeatCountLimited
          enterpriseLicensesConsumed={enterpriseLicensesConsumed}
          totalAvailableLicenses={enterpriseLicensesPurchased + vssLicensesPurchasedWithOverage}
          vssLicensesConsumed={vssLicensesConsumed}
          vssLicensesPurchased={vssLicensesPurchasedWithOverage}
        />
      )}
      <SeatCountDescription
        canViewMembers={canViewMembers}
        isVolumeLicensed={isVolumeLicensed}
        hasVssBundle={vssLicensesPurchasedWithOverage > 0}
      />
    </div>
  )
}

interface SeatCountDescriptionProps {
  canViewMembers: boolean
  isVolumeLicensed: boolean
  hasVssBundle: boolean
}
function SeatCountDescription({canViewMembers, isVolumeLicensed, hasVssBundle}: SeatCountDescriptionProps) {
  const {basePath, isStafftools} = useNavigation()

  const description = isVolumeLicensed
    ? hasVssBundle
      ? 'Organization members, outside collaborators, and pending invitations consume enterprise licenses. Users matched to a Visual Studio assignment consume a Visual Studio license.'
      : 'Organization members, outside collaborators, and pending invitations consume enterprise licenses.'
    : 'Organization members and outside collaborators consume enterprise licenses.'

  return (
    <div className="text-small color-fg-muted" data-testid="seat-count-description">
      {description}
      {isVolumeLicensed && (
        <>
          {' '}
          <Link
            href="https://docs.github.com/en/enterprise-cloud@latest/billing/managing-the-plan-for-your-github-account/about-per-user-pricing"
            data-testid="seat-count-learn-more-link"
          >
            Learn more
          </Link>
        </>
      )}
      {(canViewMembers || isStafftools) && (
        <>
          <br />
          <a href={`${basePath}/people`} data-testid="seat-count-view-members-link">
            View members
          </a>
        </>
      )}
    </div>
  )
}

function SeatCountLimited({
  enterpriseLicensesConsumed,
  totalAvailableLicenses,
  vssLicensesConsumed,
  vssLicensesPurchased,
}: {
  enterpriseLicensesConsumed: number
  totalAvailableLicenses: number
  vssLicensesConsumed: number
  vssLicensesPurchased: number
}) {
  const totalConsumed = enterpriseLicensesConsumed + vssLicensesConsumed
  const enterpriseProgress =
    totalAvailableLicenses !== 0 ? (enterpriseLicensesConsumed / totalAvailableLicenses) * 100 : 100
  const vssProgress = totalAvailableLicenses !== 0 ? (vssLicensesConsumed / totalAvailableLicenses) * 100 : 100
  const showVss = vssLicensesPurchased > 0

  let ariaBreakdownText = `${enterpriseLicensesConsumed.toLocaleString()} Enterprise licenses used.`
  if (showVss) {
    ariaBreakdownText += ` ${vssLicensesConsumed.toLocaleString()} Visual Studio licenses used.`
  }
  ariaBreakdownText += ` ${totalAvailableLicenses.toLocaleString()} total licenses available.`

  return (
    <div className="mb-1 d-flex flex-column gap-2">
      <div className="d-flex flex-justify-between flex-items-baseline flex-wrap">
        <div className={clsx('f3', styles.lineHeightSpacious)} data-testid="seat-count-total-consumed">
          {totalConsumed.toLocaleString()}
        </div>
        <div className="f6 color-fg-muted no-wrap" data-testid="seat-count-total-purchased">
          {totalAvailableLicenses.toLocaleString()} available
        </div>
      </div>
      <div>
        <ProgressBar
          barSize="small"
          aria-label="Consumed seats"
          aria-valuetext={ariaBreakdownText}
          data-testid="seat-count-progress-bar"
        >
          <ProgressBar.Item
            key="enterprise"
            progress={enterpriseProgress}
            className={clsx(styles.enterpriseProgressBar)}
            data-testid="seat-count-progress-enterprise"
          />
          {showVss && (
            <ProgressBar.Item
              key="vss"
              progress={vssProgress}
              className={clsx(styles.vssProgressBar)}
              data-testid="seat-count-progress-vss"
            />
          )}
        </ProgressBar>
        {showVss && (
          <div className="d-flex flex-row mt-2 f6" data-testid="seat-count-legend">
            <div className="d-flex flex-row flex-items-center mr-3">
              <Octicon icon={DotFillIcon} size={16} className="mr-1 fgColor-accent" />
              <span className="mr-1 text-bold">Enterprise</span>
              <span data-testid="seat-count-legend-enterprise-count">
                {enterpriseLicensesConsumed.toLocaleString()}
              </span>
            </div>
            <div className="d-flex flex-row flex-items-center">
              <Octicon icon={DotFillIcon} size={16} className="mr-1 fgColor-success" />
              <span className="mr-1 text-bold">Visual Studio</span>
              <span data-testid="seat-count-legend-vss-count">{vssLicensesConsumed.toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function SeatCountNoLimit({seatsUsed}: {seatsUsed: number}) {
  return (
    <div className={clsx('f3', styles.lineHeightSpacious)} data-testid="seat-count-used-no-limit">
      {seatsUsed.toLocaleString()}
    </div>
  )
}
