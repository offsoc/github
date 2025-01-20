import {PlaygroundChat} from './PlaygroundChat'
import {PlaygroundInputs} from './PlaygroundInputs'
import type {ShowModelPayload} from '../../../../types'
import {useEffect} from 'react'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {usePlaygroundManager, usePlaygroundState} from '../../../utils/playground-manager'

export function Playground() {
  const {miniplaygroundIcebreaker} = useRoutePayload<ShowModelPayload>()
  const manager = usePlaygroundManager()
  const playgroundState = usePlaygroundState()

  useEffect(() => {
    manager.checkForIcebreaker(miniplaygroundIcebreaker, playgroundState)
  }, [manager, miniplaygroundIcebreaker, playgroundState])

  return (
    // I have no idea why but the height needs to be a fixed value for this div to fill but not exceed the height
    // of the parent container. It doesn’t matter what the value is, as long as it’s here and it’s fixed.
    <div className="flex-1 d-flex flex-column flex-md-row rounded-2 border overflow-hidden" style={{height: '100px'}}>
      <PlaygroundChat />
      <PlaygroundInputs />
    </div>
  )
}
