import {Box, Heading} from '@primer/react'

function SidebarAchievements() {
  return (
    <Box
      sx={{
        borderTopWidth: '1px',
        borderTopStyle: 'solid',
        borderTopColor: 'border.default',
        py: 3,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Heading as="h2" sx={{fontWeight: 'bold', fontSize: 2, pb: 2}}>
        Achievements
      </Heading>
      <Box
        sx={{
          mt: 2,
          display: 'grid',
          width: '100%',
          gap: [1, 1, 2],
          overflow: 'hidden',
          gridTemplateColumns: ['repeat(6, 1fr)', 'repeat(8, 1fr)', 'repeat(4, 1fr)'],
        }}
      >
        {ACHIEVEMENTS.map(a => {
          return (
            <Box key={a.id} sx={{position: 'relative'}}>
              <Box
                as="img"
                key={a.id}
                src={a.src}
                alt={a.alt}
                sx={{
                  width: '100%',
                  height: 'auto',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  zIndex: 1,
                  bottom: 1,
                  right: 0,
                  bg: a.badgeColor,
                  height: 22,
                  px: 2,
                  display: a.total < 2 ? 'none' : 'flex',
                  alignItems: 'center',
                  borderRadius: 11,
                  borderWidth: '2px',
                  borderStyle: 'solid',
                  borderColor: 'canvas.default',
                  fontSize: 0,
                  fontWeight: 'bold',
                }}
              >
                x{a.total}
              </Box>
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}

const ACHIEVEMENTS = [
  {
    id: 0,
    src: 'https://github.githubassets.com/assets/pull-shark-default-498c279a747d.png',
    total: 4,
    badgeColor: 'accent.subtle',
    alt: 'Pull Shark',
  },
  {
    id: 1,
    src: 'https://github.githubassets.com/assets/yolo-default-be0bbff04951.png',
    total: 1,
    alt: 'YOLO',
  },
  {
    id: 2,
    src: 'https://github.githubassets.com/assets/starstruck-default-b6610abad518.png',
    total: 3,
    badgeColor: 'attention.subtle',
    alt: 'Starstruck',
  },
  {
    id: 3,
    src: 'https://github.githubassets.com/assets/quickdraw-default-39c6aec8ff89.png',
    total: 1,
    alt: 'Quickdraw',
  },
  {
    id: 4,
    src: 'https://github.githubassets.com/assets/pair-extraordinaire-default-579438a20e01.png',
    total: 2,
    badgeColor: 'success.subtle',
    alt: 'Pair Extraordinaire',
  },
  {
    id: 5,
    src: 'https://github.githubassets.com/assets/open-sourcerer-default-2acf5f6ff93e.png',
    total: 3,
    badgeColor: 'done.subtle',
    alt: 'Open Sourcerer',
  },
  {
    id: 6,
    src: 'https://github.githubassets.com/assets/heart-on-your-sleeve-default-f307e04d80f0.png',
    total: 1,
    alt: 'Heart On Your Sleeve',
  },
  {
    id: 7,
    src: 'https://github.githubassets.com/assets/arctic-code-vault-contributor-default-df8d74122a06.png',
    total: 1,
    alt: 'Arctic Code Vault Contributor',
  },
]

export default SidebarAchievements
