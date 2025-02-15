import {useAlive} from '@github-ui/use-alive'
import {useCallback} from 'react'

// e.g., {
//   "timestamp": 1715183296,
//   "wait": 100,
//   "reason": "pull request #3 updated",
//   "gid": "PR_kwAEAw"
// }
export interface PullRequestWebsocketData {
  gid: string
}

// e.g., {
//   "before": "5add3a680c397318423053990ce1ee06cce56945",
//   "after": "cb32bc4f40a1eee4af5a95f8127d7248931da6a0",
//   "pusher": "monalisa",
//   "action": "push",
//   "timestamp": "2024-05-08T08:18:41.881-07:00",
//   "reason": "branch 'example3' was pushed",
//   "wait": 0
// }
export interface BranchWebsocketData {
  before: string
  after: string
}

export interface UseTreeComparisonWebsocketProps {
  /**
   * The signed Alive websocket channel to listen to for updates that would affect the tree comparison and thus the
   * review generated by Copilot, e.g., the head ref changing due to new commits being pushed.
   */
  signedWebsocketChannel: string

  /**
   * Handler when a pull request websocket has a new event.
   * @param data the data from the websocket event
   */
  handlePullRequestWebsocketEvent?: (data: PullRequestWebsocketData) => void

  /**
   * Handler when a branch websocket has a new event.
   * @param data the data from the websocket event
   */
  handleBranchWebsocketEvent?: (data: BranchWebsocketData) => void
}

export function useTreeComparisonWebsocket({
  signedWebsocketChannel,
  handlePullRequestWebsocketEvent,
  handleBranchWebsocketEvent,
}: UseTreeComparisonWebsocketProps) {
  const websocketCallback = useCallback(
    (data: PullRequestWebsocketData | BranchWebsocketData) => {
      if ('gid' in data) {
        if (handlePullRequestWebsocketEvent) handlePullRequestWebsocketEvent(data)
      } else if ('after' in data && 'before' in data) {
        if (handleBranchWebsocketEvent) handleBranchWebsocketEvent(data)
      }
    },
    [handleBranchWebsocketEvent, handlePullRequestWebsocketEvent],
  )

  useAlive(signedWebsocketChannel, websocketCallback)
}
