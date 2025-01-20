import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import type {GettingStartedPayload} from './components/GettingStartedDialog/types'
import {Box, Button, Text} from '@primer/react'
import styled from 'styled-components'

import {ModelLayout} from './components/GettingStartedDialog/ModelLayout'
import {Playground as PlaygroundComponent} from './components/Playground'
import PlaygroundWaitingListAsset from './components/PlaygroundWaitingListAsset'

import {useFeatureFlag} from '@github-ui/react-core/use-feature-flag'
import {
  PlaygroundStateContext,
  PlaygroundManagerContext,
  PlaygroundStateDispatcherContext,
  PlaygroundManager,
  initialPlaygroundState,
  tasksReducer,
} from '../../utils/playground-manager'
import {useReducer, useMemo, useEffect} from 'react'

export function ModelsPlaygroundRoute() {
  const {model, modelInputSchema, on_waitlist, playgroundUrl, gettingStarted} = useRoutePayload<GettingStartedPayload>()
  const playgroundEnabled = useFeatureFlag('project_neutron_playground')

  const [playgroundState, playgroundDispatch] = useReducer(tasksReducer, initialPlaygroundState)

  // Make sure we only have one manager
  const manager = useMemo(
    () => new PlaygroundManager(playgroundDispatch, model, playgroundUrl, modelInputSchema, gettingStarted),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [], // Do not add any dependencies here - the manager is designed to only exist once
  )

  // Make sure to update the manager if the current model changes
  useEffect(() => {
    manager.setModel(model, playgroundUrl, modelInputSchema, gettingStarted)
  }, [model, playgroundUrl, modelInputSchema, manager, gettingStarted])

  if (playgroundEnabled) {
    return (
      <PlaygroundStateContext.Provider value={playgroundState}>
        <PlaygroundManagerContext.Provider value={manager}>
          <PlaygroundStateDispatcherContext.Provider value={playgroundDispatch}>
            <ModelLayout selectTab={null} activeTab="playground">
              <PlaygroundComponent />
            </ModelLayout>
          </PlaygroundStateDispatcherContext.Provider>
        </PlaygroundManagerContext.Provider>
      </PlaygroundStateContext.Provider>
    )
  }
  return (
    <>
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          height: 'calc(100dvh - 64px)',
        }}
      >
        <Box sx={{width: '100%', zIndex: 1, pb: 7, display: 'flex', justifyContent: 'center'}}>
          <Box
            sx={{
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 1,
              gap: 2,
              justifyContent: 'center',
              minHeight: 600,
            }}
          >
            <Text as="h2" sx={{fontSize: [2, 3, 3]}}>
              Get early access to our playground for models
            </Text>
            <Text sx={{color: 'fg.muted'}}>
              {on_waitlist
                ? "You're already on the waitlist! We'll send you an email once your access is granted"
                : 'Join our limited public beta waiting list today and be among the first to try out an easy way to test models'}
            </Text>
            {!on_waitlist && (
              <Box sx={{pt: 3}}>
                <Button variant="primary" as="a" href="/marketplace/models/waitlist">
                  Join the waitlist
                </Button>
              </Box>
            )}
          </Box>
          <HeroImageHolder
            sx={{
              position: 'absolute',
              left: 0,
              bottom: 0,
              right: 0,
              height: '100%',
            }}
          >
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                height: '100%',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: '50%',
                  marginLeft: -720,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  top: 0,
                  right: 0,
                  img: {
                    width: 1440,
                  },
                }}
              >
                <PlaygroundWaitingListAsset />
              </Box>
            </Box>
          </HeroImageHolder>
        </Box>
      </Box>
    </>
  )
}

const HeroImageHolder = styled(Box)`
  /* stylelint-disable-next-line primer/spacing */
  top: 200px;
  pointer-events: none;

  @media (min-height: 500px) {
    /* stylelint-disable-next-line primer/spacing */
    top: 100px;
  }

  @media (min-height: 600px) {
    /* stylelint-disable-next-line primer/spacing */
    top: 80px;
  }

  @media (min-height: 800px) {
    /* stylelint-disable-next-line primer/spacing */
    top: 0px;
  }
`
