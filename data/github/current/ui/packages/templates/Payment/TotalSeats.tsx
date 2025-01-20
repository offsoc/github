import {Box, Text, Heading, Link, TextInput} from '@primer/react'

type TotalSeatsProps = {
  seats: number
  setSeats: (seats: number) => void
}

function TotalSeats({seats, setSeats}: TotalSeatsProps) {
  return (
    <Box
      sx={{
        py: [2, 2, 3],
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Heading
        as="h2"
        sx={{
          flex: 1,
          fontWeight: 'bold',
          fontSize: 2,
        }}
      >
        Total seats
      </Heading>

      <Box
        sx={{
          display: 'grid',
          pt: 3,
          gridTemplateColumns: 'auto',
          gap: 3,
        }}
      >
        <Box
          sx={{
            borderStyle: 'solid',
            borderWidth: 1,
            display: 'flex',
            fontSize: 1,
            borderColor: 'border.default',
            borderRadius: 2,
            gap: 2,
            boxShadow: 'shadow.small',
            flexDirection: 'column',
            p: 3,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              maxWidth: 150,
              alignItems: 'center',
            }}
          >
            <TextInput
              type="number"
              min={1}
              id="seats"
              value={seats}
              onChange={e => setSeats(Number(e.target.value))}
              defaultValue={12}
            />
            <Text sx={{fontWeight: 'normal'}} as="label" htmlFor="seats">
              seats
            </Text>
          </Box>
          <Text sx={{fontSize: 0, color: 'fg.muted'}}>
            Your organization is currently using 1 seat.{' '}
            <Link href="https://github.com" inline>
              Manage seats
            </Link>
          </Text>
        </Box>
      </Box>
    </Box>
  )
}

export default TotalSeats
