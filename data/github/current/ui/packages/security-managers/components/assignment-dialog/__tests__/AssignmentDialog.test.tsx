import {act, screen} from '@testing-library/react'
import Router from 'react-router-dom'

import {render} from '../../../test-utils/render'
import {AssignmentDialog} from '../AssignmentDialog'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}))

beforeAll(() => {
  jest.spyOn(Router, 'useParams').mockReturnValue({business: 'github'})
})

describe('AssignmentDialog', () => {
  const dialogTitle = 'Assign security manager role'

  it('renders a button to show the dialog', async () => {
    render(<AssignmentDialog />)

    expect(await screen.findByRole('button', {name: 'Assign new team'})).toBeInTheDocument()
  })

  it('renders a dialog when the button is clicked', async () => {
    const {user} = render(<AssignmentDialog />)

    expect(screen.queryByRole('dialog', {name: dialogTitle})).not.toBeInTheDocument()

    const assignNewTeamButton = await screen.findByRole('button', {name: 'Assign new team'})
    await user.click(assignNewTeamButton)

    expect(await screen.findByRole('dialog', {name: dialogTitle})).toBeInTheDocument()
  })

  it('closes the dialog when the Close button is clicked', async () => {
    const {user} = render(<AssignmentDialog />)

    const assignNewTeamButton = await screen.findByRole('button', {name: 'Assign new team'})
    await user.click(assignNewTeamButton)

    expect(await screen.findByRole('dialog', {name: dialogTitle})).toBeInTheDocument()

    const cancelButton = await screen.findByRole('button', {name: 'Close'})
    await user.click(cancelButton)

    expect(screen.queryByRole('dialog', {name: dialogTitle})).not.toBeInTheDocument()
  })

  it('closes the dialog when the Cancel button is clicked', async () => {
    const {user} = render(<AssignmentDialog />)

    const assignNewTeamButton = await screen.findByRole('button', {name: 'Assign new team'})
    await user.click(assignNewTeamButton)

    expect(await screen.findByRole('dialog', {name: dialogTitle})).toBeInTheDocument()

    const cancelButton = await screen.findByRole('button', {name: 'Cancel'})
    await user.click(cancelButton)

    expect(screen.queryByRole('dialog', {name: dialogTitle})).not.toBeInTheDocument()
  })

  describe('when the dialog is open', () => {
    it('renders an empty list when there are no teams to show', async () => {
      const {user} = render(<AssignmentDialog />)

      jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        json: async () => [],
        ok: true,
        headers: new Headers({'Content-Type': 'application/json'}),
      } as Response)

      const assignNewTeamButton = await screen.findByRole('button', {name: 'Assign new team'})
      await user.click(assignNewTeamButton)

      expect(await screen.findByRole('listbox')).toBeInTheDocument()
      expect(screen.queryByRole('option')).not.toBeInTheDocument()
      expect(await screen.findByText('No teams found')).toBeInTheDocument()
    })

    it('renders a list of teams', async () => {
      const {user} = render(<AssignmentDialog />)

      jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        json: async () => [
          {name: 'Team 1', slug: 'team-1'},
          {name: 'Team 2', slug: 'team-2'},
        ],
        ok: true,
        headers: new Headers({'Content-Type': 'application/json'}),
      } as Response)

      const assignNewTeamButton = await screen.findByRole('button', {name: 'Assign new team'})
      await user.click(assignNewTeamButton)

      expect(await screen.findByRole('listbox')).toBeInTheDocument()
      expect(await screen.findByRole('option', {name: 'Team 1'})).toBeInTheDocument()
      expect(await screen.findByRole('option', {name: 'Team 2'})).toBeInTheDocument()
    })

    it('filters the list of teams when the search input changes', async () => {
      const {user} = render(<AssignmentDialog />)

      jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        json: async () => [
          {name: 'Team 1', slug: 'team-1'},
          {name: 'Team 2', slug: 'team-2'},
        ],
        ok: true,
        headers: new Headers({'Content-Type': 'application/json'}),
      } as Response)

      const assignNewTeamButton = await screen.findByRole('button', {name: 'Assign new team'})
      await user.click(assignNewTeamButton)

      const searchInput = await screen.findByRole<HTMLInputElement>('textbox')
      await user.type(searchInput, '2')

      expect(screen.queryByRole('option', {name: 'Team 1'})).not.toBeInTheDocument()
      expect(await screen.findByRole('option', {name: 'Team 2'})).toBeInTheDocument()
    })

    it('renders an empty list when filter does not match any teams', async () => {
      const {user} = render(<AssignmentDialog />)

      jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        json: async () => [
          {name: 'Team 1', slug: 'team-1'},
          {name: 'Team 2', slug: 'team-2'},
        ],
        ok: true,
        headers: new Headers({'Content-Type': 'application/json'}),
      } as Response)

      const assignNewTeamButton = await screen.findByRole('button', {name: 'Assign new team'})
      await user.click(assignNewTeamButton)

      const searchInput = await screen.findByRole<HTMLInputElement>('textbox')
      await user.type(searchInput, '3')

      expect(await screen.findByRole('listbox')).toBeInTheDocument()
      expect(screen.queryByRole('option')).not.toBeInTheDocument()
      expect(await screen.findByText('No teams found')).toBeInTheDocument()
    })

    it('moves to the next panel when the Next button is clicked', async () => {
      const {user} = render(<AssignmentDialog />)

      jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        json: async () => [{name: 'Team 1', slug: 'team-1'}],
        ok: true,
        headers: new Headers({'Content-Type': 'application/json'}),
      } as Response)

      const assignNewTeamButton = await screen.findByRole('button', {name: 'Assign new team'})
      await user.click(assignNewTeamButton)

      // Select option to enable next button
      const option = await screen.findByRole('option', {name: 'Team 1'})
      await user.click(option)

      expect(screen.queryByRole('button', {name: 'Back'})).not.toBeInTheDocument()
      expect(screen.queryByRole('button', {name: 'Yes, assign the role'})).not.toBeInTheDocument()

      // Move to next panel
      const nextButton = await screen.findByRole('button', {name: 'Next'})
      await user.click(nextButton)

      expect(await screen.findByRole('button', {name: 'Back'})).toBeInTheDocument()
      expect(await screen.findByRole('button', {name: 'Yes, assign the role'})).toBeInTheDocument()
    })

    it('moves to the previous panel when the Back button is clicked', async () => {
      const {user} = render(<AssignmentDialog />)

      jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        json: async () => [{name: 'Team 1', slug: 'team-1'}],
        ok: true,
        headers: new Headers({'Content-Type': 'application/json'}),
      } as Response)

      const assignNewTeamButton = await screen.findByRole('button', {name: 'Assign new team'})
      await user.click(assignNewTeamButton)

      // Select option to enable next button
      const option = await screen.findByRole('option', {name: 'Team 1'})
      await user.click(option)

      // Move to next panel
      const nextButton = await screen.findByRole('button', {name: 'Next'})
      await user.click(nextButton)

      expect(screen.queryByRole('button', {name: 'Cancel'})).not.toBeInTheDocument()
      expect(screen.queryByRole('button', {name: 'Next'})).not.toBeInTheDocument()

      // Move to previous panel
      const backButton = await screen.findByRole('button', {name: 'Back'})
      await user.click(backButton)

      expect(await screen.findByRole('button', {name: 'Cancel'})).toBeInTheDocument()
      expect(await screen.findByRole('button', {name: 'Next'})).toBeInTheDocument()
    })

    it('submits selected teams when the Yes button is clicked', async () => {
      const {user} = render(<AssignmentDialog />)

      const fetchMock = jest.spyOn(global, 'fetch')
      fetchMock.mockResolvedValue({
        json: async () => [
          {name: 'Team 1', slug: 'team-1'},
          {name: 'Team 2', slug: 'team-2'},
          {name: 'Team 3', slug: 'team-3'},
        ],
        ok: true,
        headers: new Headers({'Content-Type': 'application/json'}),
      } as Response)

      const assignNewTeamButton = await screen.findByRole('button', {name: 'Assign new team'})
      await user.click(assignNewTeamButton)

      // Select options to enable next button
      const option1 = await screen.findByRole('option', {name: 'Team 1'})
      await user.click(option1)

      const option3 = await screen.findByRole('option', {name: 'Team 3'})
      await user.click(option3)

      // Move to next panel
      const nextButton = await screen.findByRole('button', {name: 'Next'})
      await user.click(nextButton)

      fetchMock.mockClear()
      let promiseResolve: (value: Response) => void = () => {}
      const promise = new Promise<Response>(resolve => (promiseResolve = resolve))
      fetchMock.mockResolvedValue(promise)

      // Submit
      const submitButton = await screen.findByRole('button', {name: 'Yes, assign the role'})
      expect(submitButton.getAttribute('data-loading')).toBe('false')
      await user.click(submitButton)
      expect(submitButton.getAttribute('data-loading')).toBe('true')

      for (const slug of ['team-1', 'team-3']) {
        expect(fetchMock).toHaveBeenCalledWith(
          '/enterprises/github/security-managers',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({teamSlugs: [slug]}),
          }),
        )
      }

      expect(await screen.findByRole('dialog', {name: dialogTitle})).toBeInTheDocument()
      await act(() => promiseResolve({ok: true} as Response))
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument() // Assert dialog closes
    })

    describe('error handling', () => {
      beforeEach(() => {
        // Note: this error occurs due to our usage of `@container` within a
        // `<style>` tag in Banner. The CSS parser for jsdom does not support this
        // syntax and will fail with an error containing the message below.
        // Tracking issue: https://github.com/github/primer/issues/3882
        // eslint-disable-next-line no-console
        const originalConsoleError = console.error
        jest.spyOn(console, 'error').mockImplementation((value, ...args) => {
          if (!value?.message?.includes('Could not parse CSS stylesheet')) {
            originalConsoleError(value, ...args)
          }
        })
      })

      it('shows an error message if next is clicked with no team selected', async () => {
        const {user} = render(<AssignmentDialog />)

        jest.spyOn(global, 'fetch').mockResolvedValueOnce({
          json: async () => [{name: 'Team 1', slug: 'team-1'}],
          ok: true,
          headers: new Headers({'Content-Type': 'application/json'}),
        } as Response)

        const assignNewTeamButton = await screen.findByRole('button', {name: 'Assign new team'})
        await user.click(assignNewTeamButton)

        const nextButton = await screen.findByRole('button', {name: 'Next'})

        expect(nextButton.getAttribute('disabled')).toBeNull()

        await user.click(nextButton)
        expect(
          await screen.findByText('Please select at least one team to assign to the security manager role.'),
        ).toBeInTheDocument()

        expect(nextButton.getAttribute('disabled')).toBeNull()
      })

      it('shows an error message when loading teams fails', async () => {
        const {user} = render(<AssignmentDialog />)

        const fetchMock = jest.spyOn(global, 'fetch')
        fetchMock.mockResolvedValue({
          ok: false,
          status: 500,
        } as Response)

        const assignNewTeamButton = await screen.findByRole('button', {name: 'Assign new team'})
        await act(() => user.click(assignNewTeamButton))

        expect(
          await screen.findByText(
            'Failed to load teams. Please refresh the page and try again. If the issue persists, contact GitHub support.',
          ),
        ).toBeInTheDocument()
      })

      it('shows an error message when some teams are unable to be assigned as ESMs', async () => {
        const {user} = render(<AssignmentDialog />)

        const fetchMock = jest.spyOn(global, 'fetch')
        fetchMock.mockResolvedValue({
          json: async () => [
            {name: 'Team 1', slug: 'team-1'},
            {name: 'Team 2', slug: 'team-2'},
            {name: 'Team 3', slug: 'team-3'},
          ],
          ok: true,
          headers: new Headers({'Content-Type': 'application/json'}),
        } as Response)

        const assignNewTeamButton = await screen.findByRole('button', {name: 'Assign new team'})
        await user.click(assignNewTeamButton)

        // Select options to enable next button
        const option1 = await screen.findByRole('option', {name: 'Team 1'})
        await user.click(option1)

        const option3 = await screen.findByRole('option', {name: 'Team 3'})
        await user.click(option3)

        // Move to next panel
        const nextButton = await screen.findByRole('button', {name: 'Next'})
        await user.click(nextButton)

        fetchMock.mockClear()

        // Submit
        fetchMock
          .mockResolvedValue({
            ok: true,
          } as Response)
          .mockResolvedValueOnce({
            ok: false,
          } as Response)

        const submitButton = await screen.findByRole('button', {name: 'Yes, assign the role'})
        expect(submitButton.getAttribute('data-loading')).toBe('false')
        await user.click(submitButton)

        for (const slug of ['team-1', 'team-3']) {
          expect(fetchMock).toHaveBeenCalledWith(
            '/enterprises/github/security-managers',
            expect.objectContaining({
              method: 'POST',
              body: JSON.stringify({teamSlugs: [slug]}),
            }),
          )
        }

        expect(await screen.findByRole('dialog', {name: dialogTitle})).toBeInTheDocument()
        expect(
          await screen.findByText(
            'Some teams could not be assigned the security manager role. Please try again. If the issue persists, contact GitHub support.',
          ),
        ).toBeInTheDocument()

        const backButton = await screen.findByRole('button', {name: 'Back'})
        expect(backButton).toBeInTheDocument()
        await user.click(backButton)
        expect(await screen.findByRole('button', {name: 'Cancel'})).toBeInTheDocument()

        const updatedOption3 = await screen.findByRole('option', {name: 'Team 3'})
        expect(updatedOption3.getAttribute('aria-selected')).toBe('false')
        const updatedOption1 = screen.getByRole('option', {name: 'Team 1'})
        expect(updatedOption1.getAttribute('aria-selected')).toBe('true')
      })

      it('shows an error message when all teams are unable to be assigned as ESMs', async () => {
        const {user} = render(<AssignmentDialog />)

        const fetchMock = jest.spyOn(global, 'fetch')
        fetchMock.mockResolvedValue({
          json: async () => [
            {name: 'Team 1', slug: 'team-1'},
            {name: 'Team 2', slug: 'team-2'},
            {name: 'Team 3', slug: 'team-3'},
          ],
          ok: true,
          headers: new Headers({'Content-Type': 'application/json'}),
        } as Response)

        const assignNewTeamButton = await screen.findByRole('button', {name: 'Assign new team'})
        await user.click(assignNewTeamButton)

        // Select options to enable next button
        const option1 = await screen.findByRole('option', {name: 'Team 1'})
        await user.click(option1)

        const option3 = await screen.findByRole('option', {name: 'Team 3'})
        await user.click(option3)

        // Move to next panel
        const nextButton = await screen.findByRole('button', {name: 'Next'})
        await user.click(nextButton)

        fetchMock.mockClear()

        // Submit
        fetchMock.mockResolvedValue({
          ok: false,
        } as Response)

        const submitButton = await screen.findByRole('button', {name: 'Yes, assign the role'})
        expect(submitButton.getAttribute('data-loading')).toBe('false')
        await user.click(submitButton)

        for (const slug of ['team-1', 'team-3']) {
          expect(fetchMock).toHaveBeenCalledWith(
            '/enterprises/github/security-managers',
            expect.objectContaining({
              method: 'POST',
              body: JSON.stringify({teamSlugs: [slug]}),
            }),
          )
        }

        expect(await screen.findByRole('dialog', {name: dialogTitle})).toBeInTheDocument()
        expect(
          await screen.findByText(
            'Failed to assign the security manager role. Please try again. If the issue persists, contact GitHub support.',
          ),
        ).toBeInTheDocument()

        expect(option1.getAttribute('aria-selected')).toBe('true')
        expect(option3.getAttribute('aria-selected')).toBe('true')
      })
    })
  })
})
