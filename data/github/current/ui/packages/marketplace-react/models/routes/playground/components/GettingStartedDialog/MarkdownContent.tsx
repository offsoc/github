import {forwardRef} from 'react'
import {Text, Box} from '@primer/react'
import {AlertIcon} from '@primer/octicons-react'
import {SharedMarkdownContent} from '@github-ui/code-view-shared/components/SharedMarkdownContent'
import type {SafeHTMLString} from '@github-ui/safe-html'

interface MarkdownContentProps {
  payload: SafeHTMLString
}

const MarkdownContent = forwardRef<HTMLDivElement, MarkdownContentProps>(({payload}, ref) => {
  const gettingStartedContent = payload

  return (
    <Box sx={{display: 'flex', flexDirection: 'column'}} ref={ref}>
      {/*
          We need to suppress the hydration warning because some of the HTML rendered here (e.g. clipboard copy)
          relies on behaviors/ non-React JS to replace meta- tags with other elements. When React goes to hydrate,
          it will see that the HTML has changed and throw an warning. We can safely suppress this warning because
          the content is static, so it's OK if the client re-render doesn't actually get written to the page.

          Right now we overriding the styles using the sx prop. In the future we want to handle this better.
      */}

      {gettingStartedContent ? (
        <>
          <Text
            as="h2"
            sx={{
              color: 'fg.default',
              fontSize: [3, 2, 2],
              pb: 2,
              fontWeight: 'bold',
              display: ['block', 'block', 'none'],
              borderBottomColor: 'border.default',
              borderBottomStyle: 'solid',
              borderBottomWidth: 1,
              mb: 3,
            }}
          >
            Or set it up yourself...
          </Text>
          <Text as="h2" sx={{fontSize: 4, fontWeight: 'bold', display: ['none', 'none', 'block'], pb: 4}}>
            Get started
          </Text>
          <Box className="readme" sx={{pb: 3}}>
            <SharedMarkdownContent
              suppressHydrationWarning={true}
              richText={gettingStartedContent}
              sx={{
                h2: {
                  fontSize: 2,
                  pb: 2,
                },
                h3: {
                  fontSize: 1,
                },
                p: {
                  fontSize: 1,
                },
                'a.btn': {
                  fontSize: '14px !important',
                },
                code: {
                  fontSize: 0,
                },
                '.highlight pre': {
                  fontSize: 0,
                },
                pre: {
                  borderColor: 'border.muted',
                  borderWidth: 1,
                  borderStyle: 'solid',
                  borderRadius: 2,
                },
                '.highlight': {
                  'clipboard-copy': {
                    top: 0,
                    right: 0,
                    width: 32,
                    height: 32,
                    position: 'absolute',
                  },
                },
                'pre code': {
                  fontSize: 0,
                },
                '.anchor': {
                  visibility: 'hidden',
                },
                '.snippet-clipboard-content': {
                  'clipboard-copy': {
                    top: 0,
                    right: 0,
                    width: 32,
                    height: 32,
                    position: 'absolute',
                    '.octicon': {
                      marginRight: 0,
                    },
                  },
                },
              }}
            />
          </Box>
        </>
      ) : (
        <MissingCombinationPlaceholder />
      )}
    </Box>
  )
})

function MissingCombinationPlaceholder() {
  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Box sx={{color: 'attention.fg'}}>
        <AlertIcon size={16} />
      </Box>
      <Text as="h2" sx={{fontWeight: 'bold', textAlign: 'center', fontSize: 2, pt: 2}}>
        Documentation for this language and SDK combination is unavailable
      </Text>
      <Text as="p" sx={{color: 'fg.muted', textAlign: 'center'}}>
        Try a different combination
      </Text>
    </Box>
  )
}

MarkdownContent.displayName = 'MarkdownContent'

export default MarkdownContent
