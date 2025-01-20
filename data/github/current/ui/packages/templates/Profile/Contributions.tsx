import {Box, Heading, Octicon, NavList, ActionMenu, ActionList, Timeline} from '@primer/react'
import {FlameIcon, GitPullRequestIcon, EyeIcon} from '@primer/octicons-react'

function Contributions() {
  return (
    <Box
      as="section"
      aria-labelledby="contributions"
      sx={{
        borderTopWidth: [1, 1, 0],
        borderTopStyle: 'solid',
        borderTopColor: 'border.default',
        mt: 3,
        py: 3,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Heading
          id="contributions"
          as="h2"
          sx={{
            flex: 1,
            fontWeight: 'bold',
            fontSize: 2,
          }}
        >
          59 contributions in the last year
        </Heading>
        <Box sx={{display: ['block', 'block', 'block', 'none']}}>
          <ActionMenu>
            <ActionMenu.Button>
              <Box as="span" sx={{color: 'fg.muted'}}>
                Year:
              </Box>{' '}
              {YEARS[0]}
            </ActionMenu.Button>
            <ActionMenu.Overlay width="auto" align="end">
              <ActionList>
                <ActionList.Group selectionVariant="single">
                  {YEARS.map((year, index) => (
                    <ActionList.Item key={year} selected={index === 0}>
                      {year}
                    </ActionList.Item>
                  ))}
                </ActionList.Group>
              </ActionList>
            </ActionMenu.Overlay>
          </ActionMenu>
        </Box>
      </Box>

      <Box sx={{display: 'flex', gap: 5, position: 'relative'}}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            flex: 1,
            pt: 4,
          }}
        >
          <Box sx={{display: 'flex', alignItems: 'center'}}>
            <Heading as="h3" sx={{fontSize: 0, fontWeight: 'bold', pr: 3}}>
              February{' '}
              <Box as="span" sx={{color: 'fg.muted'}}>
                2024
              </Box>
            </Heading>
            <Box sx={{height: 1, bg: 'border.default', flex: 1}} />
          </Box>
          <Timeline>
            <Timeline.Item>
              <Timeline.Badge>
                <Octicon icon={EyeIcon} />
              </Timeline.Badge>
              <Timeline.Body>Reviewed 5 pull requests in 3 repositories</Timeline.Body>
            </Timeline.Item>
            <Timeline.Item>
              <Timeline.Badge>
                <Octicon icon={FlameIcon} />
              </Timeline.Badge>
              <Timeline.Body>
                Created a pull request in mona/playground that received 2 comments
                <Box
                  sx={{
                    borderStyle: 'solid',
                    borderWidth: 1,
                    borderColor: 'border.default',
                    borderRadius: 2,
                    p: 3,
                    mt: 3,
                    display: 'flex',
                    gap: 3,
                  }}
                >
                  <Box sx={{pt: '2px'}}>
                    <Octicon icon={GitPullRequestIcon} sx={{color: 'done.fg'}} />
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <Heading
                      as="h4"
                      sx={{
                        fontSize: 2,
                        color: 'fg.default',
                        fontWeight: 'bold',
                      }}
                    >
                      Update playground.md
                    </Heading>
                    <span>Adding some octotastic additions to help hubbers achieve their dreams.</span>
                  </Box>
                </Box>
              </Timeline.Body>
            </Timeline.Item>
            <Timeline.Item>
              <Timeline.Badge>
                <Octicon icon={EyeIcon} />
              </Timeline.Badge>
              <Timeline.Body>Started 1 discussion in 1 repository</Timeline.Body>
            </Timeline.Item>
          </Timeline>
          <Box
            as="button"
            sx={{
              borderStyle: 'solid',
              borderWidth: 1,
              borderColor: 'border.default',
              borderRadius: 2,
              p: '10px',
              fontFamily: 'normal',
              mt: 3,
              bg: 'canvas.default',
              color: 'accent.fg',
              fontWeight: 'bold',
              fontSize: 0,
              ':hover': {
                bg: 'canvas.subtle',
              },
            }}
          >
            Show more activity
          </Box>
        </Box>
        <Box
          sx={{
            width: 120,
            mt: 4,
            position: 'sticky',
            top: 0,
            display: ['none', 'none', 'none', 'block'],
          }}
        >
          <NavList aria-label="Contributions by year">
            {YEARS.map((year, index) => (
              <NavList.Item key={year} href="#" aria-current={index === 0 && 'page'}>
                {year}
              </NavList.Item>
            ))}
          </NavList>
        </Box>
      </Box>
    </Box>
  )
}

const YEARS = [2024, 2023, 2022, 2021, 2020, 2019, 2018]

export default Contributions
