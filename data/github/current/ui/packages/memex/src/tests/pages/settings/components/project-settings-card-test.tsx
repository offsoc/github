import {render, screen} from '@testing-library/react'

import {ProjectSettingsCardHeader} from '../../../../client/pages/settings/components/project-settings-card'

describe('ProjectSettingsCardHeader', () => {
  it('should render a title and description', () => {
    render(<ProjectSettingsCardHeader title="Project Settings" description="Project settings description" />)

    expect(screen.getByRole('heading', {name: 'Project Settings'})).toBeInTheDocument()
    expect(screen.getByText('Project settings description')).toBeInTheDocument()
  })
})
