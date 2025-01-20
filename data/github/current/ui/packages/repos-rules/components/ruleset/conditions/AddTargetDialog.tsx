import type {FC} from 'react'
import type React from 'react'
import {useRef, useState, useEffect} from 'react'
import {FormControl, Octicon, Link, TextInput} from '@primer/react'
import {PlusCircleIcon, XCircleIcon} from '@primer/octicons-react'
import {Dialog} from '@primer/react/experimental'
import {EXAMPLE_CONDITION_TARGET_PATTERNS, PLURAL_RULESET_TARGETS} from '../../../helpers/constants'
import type {RulesetTarget, TargetType} from '../../../types/rules-types'
import {capitalize} from '../../../helpers/string'
import {useRelativeNavigation} from '../../../hooks/use-relative-navigation'
import {useValidateConditionTarget} from '../../../hooks/use-validate-condition-target'

type AddTargetDialogProps = {
  rulesetId?: number
  onAdd: (target: string) => void
  onClose: () => void
  target: TargetType
  includeOrExclude: 'include' | 'exclude'
  rulesetTarget: RulesetTarget
  fnmatchHelpUrl?: string
}

export const AddTargetDialog: FC<AddTargetDialogProps> = ({
  rulesetId,
  onAdd,
  onClose,
  target,
  includeOrExclude,
  rulesetTarget,
  fnmatchHelpUrl,
}) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const examplePatterns = EXAMPLE_CONDITION_TARGET_PATTERNS[target]?.[rulesetTarget]

  const title = `${capitalize(includeOrExclude)} by pattern`
  const subtitleObject = capitalize(
    target === 'repository_name'
      ? 'Repositories'
      : target === 'organization_name'
        ? 'Organizations'
        : PLURAL_RULESET_TARGETS[rulesetTarget],
  )
  const subtitle = `${subtitleObject} that ${
    includeOrExclude === 'include' ? 'match' : 'do not match'
  } the matching pattern will be targeted by this ruleset.`
  const subject =
    target === 'repository_name'
      ? 'Repository'
      : target === 'organization_name'
        ? 'Organization'
        : capitalize(rulesetTarget)
  const createText = `Add ${includeOrExclude === 'include' ? 'Inclusion' : 'Exclusion'} pattern`

  const [conditionTargetError, setConditionTargetError] = useState('')
  const {resolvePath} = useRelativeNavigation()
  const conditionTargetValidator = useValidateConditionTarget(resolvePath('../validate_value'))

  const onSave = async () => {
    const trimmedParam = inputRef.current!.value.trim()

    if (!trimmedParam || trimmedParam === '') {
      setConditionTargetError('Pattern cannot be empty')
      inputRef.current?.focus()
      return
    }
    if (!conditionTargetValidator.isValid) {
      return
    }

    onAdd(trimmedParam)
    inputRef.current!.value = ''
  }

  const onKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
    if (event.key !== 'Enter') {
      return
    }

    event.preventDefault()
    onSave()
  }

  // For reasons unknown, calling .focus() causes us to focus, then blur, then focus the text input. The spurious call
  // to onBlur() causes us to display an unwarranted error messsage. Waiting until the next event loop avoids this.
  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus()
    })
  }, [])

  return (
    <Dialog
      aria-label={title}
      title={title}
      subtitle={<span className="text-normal text-small color-fg-muted">{subtitle}</span>}
      footerButtons={[
        {content: 'Cancel', buttonType: 'normal', onClick: onClose},
        {content: createText, onClick: onSave, buttonType: 'primary'},
      ]}
      onClose={onClose}
      width="medium"
    >
      <FormControl sx={{flex: 1, mr: 2}}>
        <FormControl.Label>
          <span className="text-bold">{subject} naming pattern</span>
        </FormControl.Label>
        <TextInput
          leadingVisual={() =>
            includeOrExclude === 'include' ? (
              <Octicon icon={PlusCircleIcon} sx={{color: 'success.fg'}} />
            ) : (
              <Octicon icon={XCircleIcon} sx={{color: 'danger.fg'}} />
            )
          }
          ref={inputRef}
          aria-label="Enter new target"
          className="width-full"
          onKeyPress={onKeyPress}
          onBlur={e => {
            if (!e.target.value || e.target.value.trim() === '') {
              setConditionTargetError('Pattern cannot be empty')
              inputRef.current?.focus()
              return
            }

            setConditionTargetError('')
          }}
          onChange={e => {
            {
              conditionTargetError && setConditionTargetError('')
            }
            conditionTargetValidator.validate(e.target.value.trim(), target, rulesetId)
          }}
        />
        {(examplePatterns?.length || 0) > 0 && (
          <FormControl.Caption>
            Example patterns: &quot;{examplePatterns!.join('", "')}&quot;.
            {fnmatchHelpUrl && (
              <>
                &nbsp;
                <Link inline target="_blank" href={fnmatchHelpUrl}>
                  Learn more about fnmatch
                </Link>
                .
              </>
            )}
          </FormControl.Caption>
        )}
        {conditionTargetValidator.showError && (
          <FormControl.Validation variant="error" aria-live="polite">
            Invalid pattern
          </FormControl.Validation>
        )}
        {conditionTargetError && (
          <FormControl.Validation variant="error">{conditionTargetError}</FormControl.Validation>
        )}
      </FormControl>
    </Dialog>
  )
}
