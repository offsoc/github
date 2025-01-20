import {GitHubAvatar} from '@github-ui/github-avatar'
import {Box, useResponsiveValue, Text} from '@primer/react'
import type {Model, ModelInputSchema} from '../../../../types'
import {PlaygroundCard} from './GettingStartedDialog/ModelLayout'

interface Props {
  model: Model
  modelInputSchema: ModelInputSchema
  submitMessage: (s: string) => void
}

export default function PlayGroundChatEmptyState({model, modelInputSchema, submitMessage}: Props) {
  const MAX_SUGGESTIONS = 3
  const isMobile = useResponsiveValue({narrow: true}, false)

  return (
    <div className="d-flex height-full flex-column flex-justify-center">
      <div className="d-flex flex-row flex-justify-center pb-3">
        <GitHubAvatar size={{narrow: 32, regular: 40}} square={true} src={model.logo_url} />
      </div>
      <Text as="h3" sx={{fontWeight: 'bold', textAlign: 'center', pb: 1, fontSize: [2, 2, 3]}}>
        {model.friendly_name}
      </Text>
      <Text as="p" sx={{color: 'fg.muted', textAlign: 'center', pb: [3, 3, 7], fontSize: 1}}>
        {model.summary}
      </Text>
      {modelInputSchema.sampleInputs && modelInputSchema.sampleInputs.length > 0 ? (
        <Box sx={{display: 'flex', justifyContent: 'center'}}>
          <Box
            sx={{
              display: 'flex',
              gap: 3,
              maxWidth: ['100%', '100%', `${MAX_SUGGESTIONS * 240 + 32}px`],
              flexDirection: ['column', 'column', 'row'],
              pb: [3, 3, 0],
            }}
          >
            {modelInputSchema.sampleInputs.slice(0, MAX_SUGGESTIONS).map((input, index) => {
              const content =
                input.messages && input?.messages[0] && input.messages[0].content ? input.messages[0].content : null
              if (!content) {
                return null
              }
              return (
                <PlaygroundCard
                  size={isMobile ? 'small' : 'large'}
                  sample={content}
                  key={index}
                  onClick={() => submitMessage(content)}
                />
              )
            })}
          </Box>
        </Box>
      ) : null}
    </div>
  )
}
