import {Box, Heading, Text, Link as PrimerLink} from '@primer/react'
import {Link} from '@github-ui/react-core/link'
import SingleSelect from './dropdown/SingleSelect'
import ToggleBox from './ToggleBox'
import {Sections} from '../components/State'

interface Props {
  autoSubscribeRepositories: boolean
  autoSubscribeTeams: boolean
  emails: string[]
  defaultEmail: string
  isEmailReadonly?: boolean
  saveData: (section: Sections, formData: FormData) => void
}

function NotificationsSettings(props: Props) {
  const toggleStyle = {
    borderColor: 'border.default',
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 2,
    p: 3,
  }

  const saveEmail = (email: string) => {
    const formData = new FormData()
    formData.set('email', email)
    props.saveData(Sections.Notifications, formData)
  }

  const saveWatchRepositories = (value: boolean) => {
    const formData = new FormData()
    formData.set('auto_subscribe_repositories', value ? '1' : '0')
    props.saveData(Sections.Notifications, formData)
  }

  const saveWatchTeams = (value: boolean) => {
    const formData = new FormData()
    formData.set('auto_subscribe_teams', value ? '1' : '0')
    props.saveData(Sections.Notifications, formData)
  }

  return (
    <>
      <Box sx={{borderColor: 'border.default', borderWidth: 1, borderStyle: 'solid', borderRadius: 2, p: 3, mb: 3}}>
        <Heading as="h3" sx={{fontSize: 1, fontWeight: 'bold', m: 0}}>
          Default notifications email
        </Heading>
        <Text as="p" sx={{color: 'fg.muted', display: 'flex', width: '80%', mb: 2}}>
          {!props.isEmailReadonly
            ? "Choose where you'd like emails to be sent. You can add more email addresses. Use custom routes to specify different email addresses to be used for individual organizations."
            : 'Your email address is managed by your enterprise.'}
        </Text>
        <Box sx={{display: 'flex', mt: 2, flexWrap: 'wrap', gap: 2}}>
          <SingleSelect
            options={props.emails}
            defaultOption={props.defaultEmail}
            onChange={saveEmail}
            disabled={props.isEmailReadonly ?? false}
          />
          {!props.isEmailReadonly && (
            <PrimerLink
              as={Link}
              to="/settings/notifications/custom_routing"
              className={'btn btn-sm'}
              sx={{'&:hover': {textDecoration: 'none'}, color: 'inherit', fontWeight: 'bold'}}
            >
              Custom routing
            </PrimerLink>
          )}
        </Box>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: '16px',
          mb: 4,
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        }}
      >
        <ToggleBox
          title="Automatically watch repositories"
          subtitle="When you're given push access to a repository, automatically receive notifications for it."
          checked={props.autoSubscribeRepositories}
          sx={toggleStyle}
          onChange={saveWatchRepositories}
        />
        <ToggleBox
          title="Automatically watch teams"
          subtitle="Anytime you join a new team, you will automatically be subscribed to updates and receive notification when that team is @mentioned."
          checked={props.autoSubscribeTeams}
          sx={toggleStyle}
          onChange={saveWatchTeams}
        />
      </Box>
    </>
  )
}

export default NotificationsSettings
