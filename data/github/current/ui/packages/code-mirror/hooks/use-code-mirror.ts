import {EditorState, Compartment, StateEffect} from '@codemirror/state'
import {languages} from '@codemirror/language-data'
import {markdown, markdownLanguage} from '@codemirror/lang-markdown'
import {dropCursor, EditorView, placeholder as placeholderExtension, type ViewUpdate} from '@codemirror/view'
import {type RefObject, useCallback, useEffect, useMemo, useRef} from 'react'

import {basicSetup} from '../extensions/basic-setup'
import {getTheme} from '../themes/github-theme'
import type {CodeMirrorProps} from '../CodeMirror'
import {spacingControls} from '../extensions/spacing-controls'
import {fileUploadListener} from '../extensions/file-upload'
import {markdownExtension} from '../extensions/markdown'
import {emojiAutocomplete} from '../autocomplete/emoji-autocomplete'
import {secretDetectedListener} from '../extensions/secret-detected'
import {dataHpc} from '../extensions/data-hpc'
import {loadLanguageTheme} from '../themes/language-themes'
import {scrollerAttributes} from '../extensions/scroller-attributes'
import {readOnly} from '../extensions/readonly'
import {focusTrapToggle} from '../extensions/focus-trap-toggle'

export interface UseCodeMirror extends CodeMirrorProps {
  parentRef: RefObject<HTMLElement | null>
}

export function useCodeMirror({
  extensions = [],
  fileName = '',
  onChange,
  spacing,
  isHpc,
  isReadOnly,
  enableFileUpload,
  parentRef,
  placeholder = 'Enter file contents here',
  ariaLabelledBy,
  value,
  width = '',
  height = '',
  minHeight = '',
  hideHelpUntilFocus,
  onCreateEditor,
  onDestroyEditor,
}: UseCodeMirror) {
  const viewRef = useRef<EditorView | undefined>(undefined)
  const languageCompartment = useMemo(() => {
    return new Compartment()
  }, [])

  const autoCompleteCompartment = useMemo(() => {
    return new Compartment()
  }, [])

  const themeCompartment = useMemo(() => {
    return new Compartment()
  }, [])

  const internalOnChange = useCallback(
    (update: ViewUpdate) => {
      if (update.docChanged) {
        onChange(update.state.doc.toString() || '')
      }
    },
    [onChange],
  )

  const updateListener = EditorView.updateListener.of(internalOnChange)

  const editorSizingTheme = EditorView.theme({
    '&': {
      height,
      minHeight,
      width,
    },
  })

  let managedExtensions = useMemo(() => {
    return [
      ...basicSetup,
      updateListener,
      editorSizingTheme,
      placeholderExtension(placeholder),
      ...spacingControls(spacing),
      secretDetectedListener(),
      languageCompartment.of([]),
      autoCompleteCompartment.of([]),
      themeCompartment.of([getTheme()]),
      scrollerAttributes(ariaLabelledBy),
      EditorView.contentAttributes.of({
        'aria-labelledby': `${ariaLabelledBy} focus-trap-help-panel`,
      }),
      EditorView.editorAttributes.of({
        class: hideHelpUntilFocus ? 'hide-help-until-focus' : '',
      }),
    ]
  }, [
    updateListener,
    editorSizingTheme,
    placeholder,
    spacing,
    languageCompartment,
    autoCompleteCompartment,
    themeCompartment,
    ariaLabelledBy,
    hideHelpUntilFocus,
  ])

  if (enableFileUpload) {
    managedExtensions.push(dropCursor())
    managedExtensions.push(fileUploadListener())
  }

  if (isHpc) {
    managedExtensions.push(dataHpc())
  }

  if (isReadOnly) {
    managedExtensions.push(readOnly())
  } else {
    managedExtensions.push(focusTrapToggle())
  }

  managedExtensions = managedExtensions.concat(extensions)

  useEffect(() => {
    const parent = parentRef.current
    if (!parent) return

    const state = EditorState.create({
      doc: value,
      extensions: managedExtensions,
    })

    const view = new EditorView({
      state,
      parent,
    })

    onCreateEditor && onCreateEditor(view)

    viewRef.current = view

    return () => {
      view.destroy()

      onDestroyEditor && onDestroyEditor(view)
    }
    // right now - only run once to initialize
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (viewRef.current) {
      viewRef.current.dispatch({effects: autoCompleteCompartment.reconfigure([])}) // reset autocomplete
      viewRef.current.dispatch({effects: StateEffect.reconfigure.of(managedExtensions)})
    }
  }, [autoCompleteCompartment, managedExtensions])

  // update the value if it changes externally
  useEffect(() => {
    if (viewRef.current && value !== undefined) {
      const currentValue = viewRef.current.state.doc.toString() || ''
      const newValue = value || ''

      if (newValue !== currentValue) {
        viewRef.current.dispatch({
          changes: {from: 0, to: currentValue.length, insert: newValue},
        })
      }
    }
  }, [value])

  useEffect(() => {
    const loadLanguage = async () => {
      const fileExtension = fileName.split('.').pop() || ''
      const language = fileExtension
        ? languages.find(l => l.extensions.includes(fileExtension) || (l.filename && l.filename.test(fileName)))
        : undefined

      if (language && viewRef.current) {
        const languageTheme = loadLanguageTheme(language.name)

        if (languageTheme) {
          viewRef.current.dispatch({
            effects: themeCompartment.reconfigure(getTheme(languageTheme)),
          })
        }

        if (language.name === 'Markdown') {
          // use gfm as the base for markdown language
          viewRef.current.dispatch({
            effects: languageCompartment.reconfigure(markdown({base: markdownLanguage})),
          })

          // add markdown extensions
          viewRef.current.dispatch({
            effects: StateEffect.reconfigure.of([...markdownExtension, ...managedExtensions]),
          })

          // add emoji autocomplete - this needs its own compartment
          viewRef.current.dispatch({effects: autoCompleteCompartment.reconfigure(emojiAutocomplete())})
        } else {
          viewRef.current.dispatch({effects: autoCompleteCompartment.reconfigure([])}) // reset autocomplete
          viewRef.current.dispatch({effects: languageCompartment.reconfigure(await language.load())})
        }
      }
    }

    if (viewRef.current) {
      loadLanguage()
    }
  }, [fileName, languageCompartment, autoCompleteCompartment, managedExtensions, themeCompartment])

  return viewRef
}
