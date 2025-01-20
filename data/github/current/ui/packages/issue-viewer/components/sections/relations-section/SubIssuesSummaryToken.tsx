import {ProgressCircle} from '@github-ui/progress-circle'
import {TriangleRightIcon} from '@primer/octicons-react'
import {Octicon, Token, type TokenProps} from '@primer/react'

interface Progress {
  total: number
  completed: number
  percentCompleted: number
}

export interface SubIssueCompletionTokenProps extends Omit<TokenProps, 'leadingVisual' | 'text' | 'ref'> {
  progress: Progress
}

export function SubIssuesSummaryToken({
  progress: {total, completed, percentCompleted},
  ...tokenProps
}: SubIssueCompletionTokenProps) {
  const expandOnHover = (tokenProps.as === 'button' && !tokenProps.disabled) || tokenProps.as === 'a'

  return (
    <Token
      leadingVisual={() => <ProgressCircle percentCompleted={percentCompleted} size={14} />}
      text={
        <>
          <span>{`${completed} / ${total}`}</span>
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
}
