import styles from './ModelLayout.module.css'
import {GitHubAvatar} from '@github-ui/github-avatar'
import {useCallback, useEffect, useState, useRef, useMemo} from 'react'
import {
  Breadcrumbs,
  Label,
  Text,
  UnderlineNav,
  Link,
  Box,
  PageLayout,
  Button,
  FormControl,
  IconButton,
  Textarea,
  useResponsiveValue,
} from '@primer/react'

import {
  CodeIcon,
  BookIcon,
  LawIcon,
  PaperAirplaneIcon,
  ArrowUpRightIcon,
  ChecklistIcon,
  CommandPaletteIcon,
  LogIcon,
} from '@primer/octicons-react'
import type {Model, ModelInputSchema, ShowModelPayload} from '../../../../../types'
import {GettingStartedButtonClicked, templateRepositoryNwo} from '../../../../utils/playground-types'
import {normalizeModelPublisher} from '../../../../../utilities/normalize-model-strings'

import {ModelLegalTerms} from './ModelLegalTerms'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {useFeatureFlag} from '@github-ui/react-core/use-feature-flag'
import SidebarInfo, {LanguagesSection, ModelDetails, TagsSection} from '../SidebarInfo'
import {ModelUrlHelper} from '../../../../utils/model-url-helper'
import ModelSwitcher from '../ModelSwitcher'
import GettingStartedDialog from './GettingStartedDialog'
import {sendEvent} from '@github-ui/hydro-analytics'

export type ModelLayoutTab = 'playground' | 'readme' | 'transparency' | 'evaluation' | 'license'

export function ModelLayout({
  activeTab,
  selectTab,
  children,
}: React.PropsWithChildren<{
  activeTab: ModelLayoutTab
  selectTab:
    | ((
        tab: ModelLayoutTab,
        e: React.KeyboardEvent<HTMLAnchorElement> | React.MouseEvent<HTMLAnchorElement, MouseEvent>,
      ) => void)
    | null
}>) {
  const {model, modelInputSchema, modelLicense, on_waitlist} = useRoutePayload<ShowModelPayload>()
  const {tags, task} = model
  const labels = {tags, task}
  const noEvaluationReport = 'This model does not provide an evaluation report.'
  const noTransparencyNotes = 'The model does not have specific notes.'
  const noAdditionalTransparencyNotes = 'This model does not provide any additional notes.'
  const languages = model.supported_languages.filter(language => language !== null)
  const isMobile = useResponsiveValue({narrow: true}, false)

  if (activeTab === 'playground') {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100dvh - 64px)',
        }}
      >
        <Box
          sx={{
            display: ['block', 'block', 'none'],
          }}
        >
          <GiveFeedback mobile />
        </Box>
        <Box sx={{height: '100%', width: '100%', p: 3, overflow: 'auto'}}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              width: '100%',
              height: '100%',
            }}
          >
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                maxHeight: '100%',
                height: '100%',
              }}
            >
              <PlaygroundHeader model={model} />
              {children}
            </Box>
          </Box>
        </Box>
      </Box>
    )
  }

  return (
    <div className="d-flex flex-column">
      <Box
        sx={{
          display: ['block', 'block', 'none'],
        }}
      >
        <GiveFeedback mobile />
      </Box>

      <PageLayout columnGap="normal" sx={{p: isMobile ? 0 : 3}}>
        <PageLayout.Header>
          <OverviewHeader model={model} />
        </PageLayout.Header>

        <PageLayout.Content as="div" sx={{p: isMobile ? 3 : 0, pt: 0}}>
          {model.task === 'chat-completion' && (
            <div>
              <MiniPlayground model={model} modelInputSchema={modelInputSchema} onWaitlist={on_waitlist} />
            </div>
          )}
          <Box
            sx={{
              width: '100%',
              borderColor: 'border.default',
              borderStyle: 'solid',
              borderWidth: 1,
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--shadow-resting-small,var(--color-shadow-small))',
            }}
          >
            <div>
              <UnderlineNav aria-label="Model navigation">
                <UnderlineNav.Item
                  icon={BookIcon}
                  onSelect={e => selectTab && selectTab('readme', e)}
                  aria-current={activeTab === 'readme' ? 'page' : undefined}
                >
                  README
                </UnderlineNav.Item>
                {model.evaluation && noEvaluationReport !== model.evaluation && (
                  <UnderlineNav.Item
                    icon={ChecklistIcon}
                    onSelect={e => selectTab && selectTab('evaluation', e)}
                    aria-current={activeTab === 'evaluation' ? 'page' : undefined}
                  >
                    Evaluation
                  </UnderlineNav.Item>
                )}
                {model.notes &&
                  noTransparencyNotes !== model.notes &&
                  noAdditionalTransparencyNotes !== model.notes && (
                    <UnderlineNav.Item
                      icon={LogIcon}
                      onSelect={e => selectTab && selectTab('transparency', e)}
                      aria-current={activeTab === 'transparency' ? 'page' : undefined}
                    >
                      Transparency
                    </UnderlineNav.Item>
                  )}
                {modelLicense && (
                  <UnderlineNav.Item
                    icon={LawIcon}
                    onSelect={e => selectTab && selectTab('license', e)}
                    aria-current={activeTab === 'license' ? 'page' : undefined}
                  >
                    License
                  </UnderlineNav.Item>
                )}
              </UnderlineNav>
            </div>
            <Box sx={{p: [2, 2, 3]}}>{children}</Box>
          </Box>
          <Box sx={{display: ['flex', 'flex', 'none'], flexDirection: 'column', gap: 3, pt: 3, pb: 5}}>
            {(labels.tags.length > 0 || labels.task) && <TagsSection labels={labels} />}
            {languages.length > 0 && <LanguagesSection languages={languages} />}
          </Box>
        </PageLayout.Content>
        <PageLayout.Pane hidden={{narrow: true, regular: false}}>
          <SidebarInfo model={model} />
        </PageLayout.Pane>
      </PageLayout>
    </div>
  )
}

function BreadcrumbHeader({model}: {model: Model}) {
  return (
    <Breadcrumbs>
      <Breadcrumbs.Item href="/marketplace">Marketplace</Breadcrumbs.Item>
      <Breadcrumbs.Item href="/marketplace/models">Models</Breadcrumbs.Item>
      <Breadcrumbs.Item href="" selected>
        {normalizeModelPublisher(model.publisher)}
      </Breadcrumbs.Item>
    </Breadcrumbs>
  )
}

function OverviewHeader({model}: {model: Model}) {
  const {summary} = model
  const openInCodespacesUrl = `/codespaces/new?template_repository=${templateRepositoryNwo}`
  const [isGettingStartedDialogOpen, setGettingStartedDialogOpen] = useState(false)
  const playgroundEnabled = useFeatureFlag('project_neutron_playground')
  const isMobile = useResponsiveValue({narrow: true}, false) as boolean
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 3,
        flexDirection: 'column',
        p: isMobile ? 3 : 0,
        backgroundColor: isMobile ? 'canvas.inset' : 'canvas.default',
        borderColor: 'border.default',
        borderBottomWidth: isMobile ? 1 : 0,
        borderBottomStyle: 'solid',
      }}
    >
      <BreadcrumbHeader model={model} />
      <div>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            flexDirection: ['column', 'column', 'row'],
            alignItems: 'center',
            gap: 3,
          }}
        >
          <Box
            sx={{
              flexGrow: [1, 1, 1],
              display: 'flex',
              minWidth: 0,
              alignItems: 'center',
              width: ['100%', '100%', 'auto'],
            }}
          >
            <Box sx={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2}}>
              <GitHubAvatar square size={isMobile ? 24 : 32} src={model.logo_url} />
              <h1 className={isMobile ? 'h4' : 'h3'}>{model.friendly_name}</h1>
            </Box>
          </Box>

          <Box
            sx={{
              display: ['flex', 'flex', 'none'],
              flexDirection: 'column',
              width: '100%',
              gap: 3,
            }}
          >
            <Text sx={{lineHeight: 1.5}}>{summary}</Text>
          </Box>

          <Box sx={{display: ['block', 'block', 'none'], width: '100%'}}>
            <ModelDetails model={model} direction="row" />
          </Box>

          <Box
            sx={{
              display: 'flex',
              gap: 2,
              width: ['100%', '100%', 'auto'],
              justifyContent: 'flex-end',
              flexGrow: [0, 0, 1],
              flexShrink: 0,
              flexDirection: ['column-reverse', 'column-reverse', 'row'],
            }}
          >
            <Box sx={{display: ['none', 'none', 'flex']}}>
              <GiveFeedback />
            </Box>
            <Box sx={{display: 'flex', flexDirection: ['column', 'row', 'row'], gap: 2}}>
              {model.task === 'chat-completion' && (
                <Button
                  variant="default"
                  as="a"
                  block={isMobile}
                  href={ModelUrlHelper.playgroundUrl(model)}
                  leadingVisual={CommandPaletteIcon}
                >
                  Playground
                </Button>
              )}
              <Button
                block={isMobile}
                leadingVisual={CodeIcon}
                variant="primary"
                onClick={() => {
                  setGettingStartedDialogOpen(true)
                  sendEvent(GettingStartedButtonClicked, {
                    registry: model.registry,
                    model: model.name,
                    publisher: model.publisher,
                    playgroundEnabled,
                  })
                }}
              >
                Get started
              </Button>
            </Box>
            {isGettingStartedDialogOpen && (
              <GettingStartedDialog
                openInCodespaceUrl={openInCodespacesUrl}
                onClose={() => setGettingStartedDialogOpen(false)}
                playgroundEnabled={playgroundEnabled}
              />
            )}
          </Box>
        </Box>
      </div>
    </Box>
  )
}

function PlaygroundHeader({model}: {model: Model}) {
  const openInCodespacesUrl = `/codespaces/new?template_repository=${templateRepositoryNwo}`
  const [isGettingStartedDialogOpen, setGettingStartedDialogOpen] = useState(false)
  const playgroundEnabled = useFeatureFlag('project_neutron_playground')
  return (
    <Box sx={{display: 'flex', gap: 3, flexDirection: 'column', pb: 3}}>
      <div>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 3,
          }}
        >
          <Box
            sx={{
              flexGrow: 1,
              display: 'flex',
              minWidth: 0,
              alignItems: 'center',
              width: 'auto',
            }}
          >
            <ModelSwitcher model={model} />
          </Box>
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              width: 'auto',
              justifyContent: 'flex-end',
              flexGrow: 1,
              flexShrink: 0,
              flexDirection: 'row',
            }}
          >
            <Box sx={{display: ['none', 'none', 'flex']}}>
              <GiveFeedback />
            </Box>

            <>
              <IconButton
                sx={{display: ['flex', 'none', 'none']}}
                icon={CodeIcon}
                variant="primary"
                aria-label="Get started"
                onClick={() => {
                  setGettingStartedDialogOpen(true)
                  sendEvent(GettingStartedButtonClicked, {
                    registry: model.registry,
                    model: model.name,
                    publisher: model.publisher,
                    playgroundEnabled,
                  })
                }}
              />
              <Button
                sx={{display: ['none', 'flex', 'flex']}}
                leadingVisual={CodeIcon}
                variant="primary"
                onClick={() => {
                  setGettingStartedDialogOpen(true)
                  sendEvent(GettingStartedButtonClicked, {
                    registry: model.registry,
                    model: model.name,
                    publisher: model.publisher,
                    playgroundEnabled,
                  })
                }}
              >
                Get started
              </Button>
            </>
            {isGettingStartedDialogOpen && (
              <GettingStartedDialog
                openInCodespaceUrl={openInCodespacesUrl}
                onClose={() => setGettingStartedDialogOpen(false)}
                playgroundEnabled={playgroundEnabled}
              />
            )}
          </Box>
        </Box>
      </div>
    </Box>
  )
}

function GiveFeedback({mobile}: {mobile?: boolean}) {
  if (mobile) {
    return (
      <Box
        sx={{
          display: 'flex',
          py: 3,
          px: 3,
          bg: 'canvas.subtle',
          borderBottomColor: 'border.default',
          borderBottomWidth: 1,
          borderBottomStyle: 'solid',
        }}
      >
        <Box sx={{flex: 1, fontSize: 0, color: 'fg.muted'}}>Thoughts on GitHub Models?</Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0,
            gap: 'var(--base-size-6)',
            fontSize: 0,
          }}
        >
          <Label variant="success">Beta</Label>
          <Link href="https://gh.io/models-feedback">Give feedback</Link>
        </Box>
      </Box>
    )
  }
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'nowrap',
        mr: 2,
        gap: 'var(--base-size-6)',
      }}
    >
      <Label variant="success">Beta</Label>
      <Link href="https://gh.io/models-feedback" sx={{fontSize: 0, whiteSpace: 'nowrap'}}>
        Give feedback
      </Link>
    </Box>
  )
}

function MiniPlayground({
  model,
  modelInputSchema,
  onWaitlist,
}: {
  model: Model
  modelInputSchema: ModelInputSchema
  onWaitlist?: boolean
}) {
  const [text, setText] = useState('')
  const hasText = text.length > 0
  const isMobile = useResponsiveValue({narrow: true}, false)
  const playgroundEnabled = useFeatureFlag('project_neutron_playground')

  const miniPlaygroundRef = useRef<HTMLFormElement>(null)
  const miniPlaygroundInputRef = useRef<HTMLTextAreaElement>(null)
  const legalContainerRef = useRef<HTMLDivElement>(null)
  const icebreakerContainerRef = useRef<HTMLDivElement>(null)
  const animationContainerRef = useRef<HTMLDivElement>(null)

  const samplesToContent = modelInputSchema.sampleInputs?.map(input => {
    const firstMessageWithContent = input.messages?.find(message => message.content)
    return firstMessageWithContent?.content
  })

  const samplesWithContent = samplesToContent?.filter(sample => sample !== undefined)
  const SUGGESTION_DISPLAY_MAX = 4
  // If mobile, we only show one, so pick one at random
  const randomPrompt = useMemo(() => {
    return samplesWithContent[Math.floor(Math.random() * samplesWithContent?.length)]
  }, [samplesWithContent])
  const suggestedPrompts = isMobile ? [randomPrompt] : samplesWithContent?.slice(0, SUGGESTION_DISPLAY_MAX)

  const handlePlaygroundCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.currentTarget.parentNode instanceof HTMLFormElement) {
      e.currentTarget.parentNode.submit()
    }
  }

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
    if (e.key === 'Escape') {
      e.preventDefault()
      setText('')
    }

    // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
    else if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.altKey && !e.nativeEvent.isComposing) {
      const form = miniPlaygroundRef.current
      if (form) {
        e.preventDefault()
        form.submit()
      }
    }
  }

  const adjustHeights = useCallback(() => {
    if (animationContainerRef.current && legalContainerRef.current && icebreakerContainerRef.current) {
      animationContainerRef.current.style.height = hasText
        ? `${legalContainerRef.current.offsetHeight}px`
        : `${icebreakerContainerRef.current.offsetHeight}px`
    }
  }, [hasText])

  useEffect(() => {
    adjustHeights()
  }, [hasText, adjustHeights])

  useEffect(() => {
    const observer = new ResizeObserver(adjustHeights)
    if (legalContainerRef.current) observer.observe(legalContainerRef.current)
    if (icebreakerContainerRef.current) observer.observe(icebreakerContainerRef.current)

    return () => {
      observer.disconnect()
    }
  }, [adjustHeights])

  const playgroundURL = ModelUrlHelper.playgroundUrl(model)

  return (
    <>
      <Text
        sx={{
          fontWeight: 'bold',
          display: ['block', 'block', 'none'],
          mb: 2,
        }}
      >
        Try {model.friendly_name}
      </Text>
      {playgroundEnabled ? (
        <>
          <Box as="form" sx={{mb: 3, pt: 1, position: 'relative'}} action={playgroundURL} ref={miniPlaygroundRef}>
            <FormControl>
              <FormControl.Label visuallyHidden>Mini Playground Prompt Input</FormControl.Label>
              <Textarea
                name="p"
                id="miniplayground_icebreaker"
                ref={miniPlaygroundInputRef}
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder={`Enter a message...`}
                resize="none"
                block
                sx={{pr: 5}}
              />

              <IconButton
                icon={PaperAirplaneIcon}
                variant="invisible"
                aria-label="Submit message"
                onClick={() => miniPlaygroundRef.current?.submit()}
                sx={{
                  position: 'absolute',
                  right: 0,
                  mr: 2,
                  // center vertically
                  top: '50%',
                  marginTop: '-14px',
                }}
              />
            </FormControl>
          </Box>
          <Box sx={{pb: 3}}>
            <Box sx={{position: 'relative'}} className={styles.animateHeight} ref={animationContainerRef}>
              <Box
                sx={{position: 'absolute', top: 0}}
                ref={legalContainerRef}
                className={`${styles.fadeInOut} ${hasText ? styles.fadeInOutShow : ''}`}
              >
                <Box sx={{marginTop: '-2px'}}>
                  <ModelLegalTerms />
                </Box>
              </Box>

              {suggestedPrompts && (
                <Box
                  ref={icebreakerContainerRef}
                  className={`${styles.fadeInOut} ${hasText ? '' : styles.fadeInOutShow}`}
                  sx={{
                    position: 'relative', // necessary for z-index to work
                    display: 'grid',
                    gridTemplateColumns: [
                      '1fr',
                      '1fr',
                      '1fr 1fr',
                      Array(suggestedPrompts.length).fill('1fr').join(' '),
                    ],
                    gap: 3,
                  }}
                >
                  {suggestedPrompts.map(sample => {
                    if (sample) {
                      // random value is memoized and can be null on first render
                      return (
                        <Box as="form" sx={{display: 'flex'}} key={sample} action={playgroundURL}>
                          <input type="hidden" value={sample} name="p" />
                          <PlaygroundCard sample={sample} onClick={handlePlaygroundCardClick} />
                        </Box>
                      )
                    }
                  })}
                </Box>
              )}
            </Box>
          </Box>
        </>
      ) : (
        <Box sx={{pb: 3}}>
          <Box
            sx={{
              bg: 'done.subtle',
              borderColor: 'done.muted',
              borderStyle: 'solid',
              borderWidth: 1,
              borderRadius: 2,
              flexDirection: ['column', 'column', 'row'],
              px: 4,
              py: 3,
              display: 'flex',
              alignItems: 'flex-start',
              gap: [2, 2, 3],
            }}
          >
            <Box sx={{display: 'flex', flexDirection: 'column', flex: 1, gap: [1, 1, 0]}}>
              <Text sx={{fontWeight: 'bold', lineHeight: '20px'}}>Get early access to our playground for models</Text>
              <Text sx={{color: 'fg.muted', lineHeight: '20px'}}>
                {onWaitlist
                  ? "You're already on the waitlist! We'll send you an email once your access is granted."
                  : 'Join our limited beta waiting list today and be among the first to try out an easy way to test models'}
              </Text>
            </Box>
            {!onWaitlist && (
              <Box sx={{height: '100%', py: 1}}>
                <Button as="a" href="/marketplace/models/waitlist">
                  Join the waitlist
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      )}
    </>
  )
}

export function PlaygroundCard({
  sample,
  onClick,
  size = 'small',
}: {
  sample: string
  onClick: React.MouseEventHandler<HTMLDivElement> | undefined
  size?: 'small' | 'large'
}) {
  const sizes = {
    small: {
      p: '12px',
      fontSize: 0,
    },
    large: {
      p: 3,
      fontSize: 1,
    },
  }

  return (
    <Box
      onClick={onClick}
      sx={{
        ...sizes[size],
        borderRadius: 2,
        height: '100%',
        flex: 1,
        borderColor: 'border.muted',
        borderWidth: 1,
        borderStyle: 'solid',
        bg: 'var(--card-bgColor)',

        display: 'flex',
        boxShadow: 'var(--shadow-resting-small,var(--color-shadow-small))',
        transition: 'background-color .3s',
        gap: 3,
        ':hover': {
          bg: 'var(--control-transparent-bgColor-hover,var(--color-canvas-subtle))',
          cursor: 'pointer',
        },
      }}
    >
      <Box sx={{flex: 1}}>{sample}</Box>
      <Box sx={{color: 'fg.muted'}}>
        <ArrowUpRightIcon />
      </Box>
    </Box>
  )
}
