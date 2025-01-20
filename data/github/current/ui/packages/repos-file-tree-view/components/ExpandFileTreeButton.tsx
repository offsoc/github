import {DuplicateOnKeydownButton} from '@github-ui/code-view-shared/components/DuplicateOnKeydownButton'
import {ExpandButton} from '@github-ui/code-view-shared/components/ExpandButton'
import {useShortcut} from '@github-ui/code-view-shared/hooks/shortcuts'
import {useClientValue} from '@github-ui/use-client-value'
import {ArrowLeftIcon} from '@primer/octicons-react'
import {Button, type ButtonProps, type TooltipProps} from '@primer/react'
import React from 'react'

export interface ExpandFileTreeButtonProps extends Pick<ButtonProps, 'variant'> {
  expanded?: boolean
  onToggleExpanded: React.MouseEventHandler<HTMLButtonElement>
  className?: string
  ariaControls: string
  textAreaId: string
  useFilesButtonBreakpoint?: boolean
  getTooltipDirection?: (expanded?: boolean) => TooltipProps['direction']
}

export const ExpandFileTreeButton = React.forwardRef(
  (
    {
      expanded,
      onToggleExpanded,
      className,
      ariaControls,
      textAreaId,
      useFilesButtonBreakpoint = true,
      variant,
      getTooltipDirection,
    }: ExpandFileTreeButtonProps,
    ref: React.ForwardedRef<HTMLButtonElement>,
  ) => {
    const {toggleTreeShortcut} = useShortcut()
    const [isSSR] = useClientValue(() => false, true, [])
    const tooltipDirection = getTooltipDirection?.(expanded) ?? 'se'

    return (
      <>
        {/* on the server, the expanded value will purely be whatever their saved
    setting is, which might be expanded. On mobile widths we don't ever default to
    having the tree expanded, so on the server we need to just hard code it to
    show the regular not expanded version of everything*/}
        {useFilesButtonBreakpoint && (!expanded || isSSR) && (
          <Button
            aria-label="Expand file tree"
            leadingVisual={ArrowLeftIcon}
            data-hotkey={toggleTreeShortcut.hotkey}
            data-testid="expand-file-tree-button-mobile"
            ref={ref}
            onClick={onToggleExpanded}
            variant={variant ?? 'invisible'}
            sx={{color: 'fg.muted', px: 2, display: 'none', '@media screen and (max-width: 768px)': {display: 'block'}}}
          >
            Files
          </Button>
        )}
        <ExpandButton
          dataHotkey={toggleTreeShortcut.hotkey}
          className={className}
          expanded={expanded}
          alignment="left"
          ariaLabel={expanded ? 'Collapse file tree' : 'Expand file tree'}
          tooltipDirection={tooltipDirection}
          testid="file-tree-button"
          ariaControls={ariaControls}
          ref={ref}
          variant={variant}
          onToggleExpanded={onToggleExpanded}
          sx={{
            height: '32px',
            position: 'relative',
            ...(useFilesButtonBreakpoint
              ? {'@media screen and (max-width: 768px)': {display: !expanded || isSSR ? 'none' : 'flex'}}
              : {display: 'flex'}),
          }}
        />
        <DuplicateOnKeydownButton
          buttonFocusId={textAreaId}
          buttonHotkey={toggleTreeShortcut.hotkey}
          onButtonClick={onToggleExpanded}
          onlyAddHotkeyScopeButton={true}
        />
      </>
    )
  },
)

ExpandFileTreeButton.displayName = 'ExpandFileTreeButton'
