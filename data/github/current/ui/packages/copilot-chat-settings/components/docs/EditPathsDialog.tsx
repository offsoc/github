import type {DocsetRepo} from '@github-ui/copilot-chat/utils/copilot-chat-types'
import {FormControl, Link, Text, Textarea} from '@primer/react'
import {Dialog} from '@primer/react/drafts'
import {useCallback, useRef} from 'react'

export function EditPathsDialog({onClose, repo}: {onClose: () => void; repo: DocsetRepo}) {
  const onCancel = onClose
  const onOk = useCallback(() => {
    const pathText = pathsRef.current?.value ?? ''
    const paths = pathText
      .split('\n')
      .map(path => path.trim())
      .filter(path => path !== '')
    repo.paths = paths
    onClose()
  }, [onClose, repo])
  const pathsRef = useRef<HTMLTextAreaElement>(null)

  return (
    <Dialog
      footerButtons={[
        {buttonType: 'normal', content: 'Cancel', onClick: onCancel},
        {buttonType: 'primary', content: 'Apply', onClick: onOk},
      ]}
      renderFooter={({footerButtons}) => {
        return (
          <Dialog.Footer sx={{'@media screen and (max-height: 400px)': {p: 2}}}>
            {footerButtons && <Dialog.Buttons buttons={footerButtons} />}
          </Dialog.Footer>
        )
      }}
      onClose={onCancel}
      subtitle={`Define which paths within ${repo.nameWithOwner} that should be included within this docset.`}
      title="Edit paths"
      sx={{'@media screen and (max-height: 400px)': {maxHeight: 'calc(100vh - 8px)'}}}
    >
      <span>
        Use globs accepted by the{' '}
        <Link
          href="https://docs.github.com/en/search-github/github-code-search/understanding-github-code-search-syntax#path-qualifier"
          inline
          target="_blank"
        >
          code search path qualifier
        </Link>
        , one per line. Only files ending in .md and .mdx are indexed.
      </span>
      <FormControl sx={{mt: 3, mb: 1}}>
        <FormControl.Label>Paths</FormControl.Label>
        <Textarea
          ref={pathsRef}
          sx={{width: '100%'}}
          placeholder="e.g. /docs/**/*"
          defaultValue={repo.paths.join('\n')}
        />
      </FormControl>
      <Text sx={{color: 'fg.muted', fontSize: 0}}>
        If no paths are provided, all md and mdx files will be searched.
      </Text>
    </Dialog>
  )
}
