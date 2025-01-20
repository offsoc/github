import {noop} from '@github-ui/noop'
import {memo} from 'react'

import {SelectPanelEditor, type TSelectPanelEditorProps} from './select-panel-editor'

const RepositoryEditorFunc: React.FC<TSelectPanelEditorProps> = ({model, ...props}) => {
  return (
    <SelectPanelEditor
      model={model}
      fetchOptions={noop}
      placeholderText=""
      selected={[]}
      filterOptions={noop as any /* TODO: The noop function previously returned any (a lie), but now returns void */}
      getSortAttribute={noop as any /* TODO: The noop function previously returned any (a lie), but now returns void */}
      convertOptionToItem={
        noop as any /* TODO: The noop function previously returned any (a lie), but now returns void */
      }
      saveSelected={noop as any /* TODO: The noop function previously returned any (a lie), but now returns void */}
      renderButton={noop as any /* TODO: The noop function previously returned any (a lie), but now returns void */}
      {...props}
    />
  )
}

export const RepositoryEditor = memo(RepositoryEditorFunc)
