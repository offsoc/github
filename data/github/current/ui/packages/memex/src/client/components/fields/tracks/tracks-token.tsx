import {testIdProps} from '@github-ui/test-id-props'
import {TriangleRightIcon} from '@primer/octicons-react'
import {Octicon, Token, type TokenProps, useTheme} from '@primer/react'
import {forwardRef} from 'react'

import type {Progress} from '../../../api/columns/contracts/tracks'

interface TracksTokenProps extends Omit<TokenProps, 'leadingVisual' | 'text' | 'ref'> {
  progress: Progress
  /** Disable expanding on hover effect. Has no effect if this token is non-interactive. */
  constantWidth?: boolean
  description?: string
}

function ProgressIcon({progress}: {progress: number}) {
  const {theme} = useTheme()
  return (
    <svg
      aria-hidden="true"
      width="14"
      height="14"
      viewBox="0 0 14 14"
      data-target="tracked-issues-progress.progress"
      data-circumference="38"
      style={{transform: 'rotate(-90deg)', display: 'inline-block', overflow: 'visible', verticalAlign: 'text-bottom'}}
    >
      {progress < 1 ? null : (
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M10.0206 11.1074C9.68518 11.3949 9.18014 11.3561 8.8926 11.0206L5.8926 7.52061C5.62055 7.20322 5.63873 6.72989 5.93432 6.4343L7.43432 4.9343C7.74674 4.62188 8.25327 4.62188 8.56569 4.9343C8.87811 5.24672 8.87811 5.75325 8.56569 6.06567L7.58953 7.04182L10.1074 9.97935C10.3949 10.3148 10.3561 10.8198 10.0206 11.1074Z"
          fill={theme?.colors.done.fg}
        />
      )}

      <circle stroke={theme?.colors.border.default} strokeWidth="2" fill="transparent" cx="50%" cy="50%" r="6" />
      <circle
        style={{transition: 'stroke-dashoffset 0.35s'}}
        stroke={theme?.colors.done.fg}
        strokeWidth="2"
        strokeDasharray={38}
        strokeDashoffset={38 - progress * 38}
        strokeLinecap="round"
        fill="transparent"
        cx="50%"
        cy="50%"
        r="6"
      />
    </svg>
  )
}

export const TracksToken = forwardRef<HTMLElement, TracksTokenProps>(
  ({progress: {percent, total, completed}, description, constantWidth, ...tokenProps}, ref) => {
    const expandOnHover =
      ((tokenProps.as === 'button' && !tokenProps.disabled) || tokenProps.as === 'a') && !constantWidth
    return (
      <Token
        ref={ref}
        leadingVisual={() => <ProgressIcon progress={percent / 100} />}
        text={
          <>
            <span {...testIdProps('progress-text')}>{description ?? `${completed} of ${total}`}</span>
            {expandOnHover && (
              <Octicon
                icon={TriangleRightIcon}
                className="triangle"
                sx={{
                  opacity: '0 !important',
                  transitionProperty: 'transform, opacity',
                  transitionDuration: '0.2s',
                  transitionTimingFunction: 'ease-in-out',
                  position: 'absolute',
                  right: 0,
                  paddingRight: 0,
                  transform: 'translateX(-12px) translateY(-50%)',
                  top: '50%',
                }}
              />
            )}
          </>
        }
        {...tokenProps}
        sx={{
          pl: 1,
          bg: 'canvas.default',
          transitionProperty: 'background-color, padding-right',
          transitionDuration: '0.2s',
          transitionTimingFunction: 'ease-in-out',
          '&:hover, &:focus': expandOnHover
            ? {
                pr: 3,
                '.triangle': {
                  opacity: '1 !important',
                  transform: 'translateX(0) translateY(-50%)',
                },
              }
            : {},
          ...tokenProps.sx,
        }}
      />
    )
  },
)
TracksToken.displayName = 'TracksToken'
