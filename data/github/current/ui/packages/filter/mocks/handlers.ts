import {delay, http, HttpResponse} from '@github-ui/storybook/msw'
import {hasMatch} from 'fzy.js'

import {caseInsensitiveStringCompare} from '../utils'
import {
  labels,
  labelSuggestions,
  languages,
  languageSuggestions,
  milestones,
  milestoneSuggestions,
  orgs,
  orgSuggestions,
  projects,
  projectSuggestions,
  repositories,
  repositorySuggestions,
  teams,
  teamSuggestions,
  users,
  userSuggestions,
} from './'

export const handlers = [
  [
    // #region Filter Suggestions
    // Labels
    http.get(`/_filter/labels`, async ({request: req}) => {
      const filterValue = new URL(req.url, window.location.origin).searchParams.get('q')
      await delay(500)
      if (!filterValue) {
        return HttpResponse.json({labels: labelSuggestions})
      }
      return HttpResponse.json({
        labels: labels.filter(l => {
          return hasMatch(filterValue, l.name)
        }),
      })
    }),
    // Languages
    http.get(`/_filter/languages`, ({request: req}) => {
      const filterValue = new URL(req.url, window.location.origin).searchParams.get('q')
      if (!filterValue) {
        return HttpResponse.json({languages: languageSuggestions})
      }
      return HttpResponse.json({
        languages: languages.filter(l => {
          return hasMatch(filterValue, l.name)
        }),
      })
    }),
    // Milestones
    http.get('/_filter/milestones', ({request: req}) => {
      const filterValue = new URL(req.url, window.location.origin).searchParams.get('q')
      if (!filterValue) {
        return HttpResponse.json({milestones: milestoneSuggestions})
      }
      return HttpResponse.json({
        milestones: milestoneSuggestions.filter(m => hasMatch(filterValue, m.title) || hasMatch(filterValue, m.value)),
      })
    }),
    // Orgs
    http.get('/_filter/organizations', ({request: req}) => {
      const filterValue = new URL(req.url, window.location.origin).searchParams.get('q')
      if (!filterValue) {
        return HttpResponse.json({orgs: orgSuggestions})
      }
      return HttpResponse.json({
        orgs: orgSuggestions.filter(o => hasMatch(filterValue, o.name)),
      })
    }),
    // Projects
    http.get(`/_filter/projects`, async ({request: req}) => {
      const filterValue = new URL(req.url, window.location.origin).searchParams.get('q')
      if (!filterValue) {
        return HttpResponse.json({projects: projectSuggestions})
      }

      await delay(500)
      return HttpResponse.json({
        projects: projects.filter(p => {
          return hasMatch(filterValue, p.title) || hasMatch(filterValue, p.value)
        }),
      })
    }),
    // Repositories
    http.get('/_filter/repositories', async ({request: req}) => {
      const filterValue = new URL(req.url, window.location.origin).searchParams.get('q')
      if (!filterValue) {
        return HttpResponse.json({repositories: repositorySuggestions})
      }

      await delay(500)
      return HttpResponse.json({
        repositories: repositorySuggestions.filter(r => hasMatch(filterValue, r.nameWithOwner)),
      })
    }),
    // Teams
    http.get(`/_filter/teams`, ({request: req}) => {
      const filterValue = new URL(req.url, window.location.origin).searchParams.get('q')
      if (!filterValue) {
        return HttpResponse.json({teams: teamSuggestions})
      }
      return HttpResponse.json({
        teams: teams.filter(t => {
          return hasMatch(filterValue, t.name) || hasMatch(filterValue, t.combinedSlug)
        }),
      })
    }),
    // Users
    http.get(`/_filter/users`, async ({request: req}) => {
      const filterValue = new URL(req.url, window.location.origin).searchParams.get('q')
      if (!filterValue) {
        return HttpResponse.json({users: userSuggestions})
      }

      await delay(500)
      return HttpResponse.json({
        users: users.filter(u => {
          return hasMatch(filterValue, u.login) || (u.name && hasMatch(filterValue, u.name))
        }),
      })
    }),
    //#endregion
    //#region Filter Validation
    // Labels
    http.get('/_filter/labels/validate', ({request: req}) => {
      const filterValue = new URL(req.url, window.location.origin).searchParams.get('q')
      if (!filterValue) return HttpResponse.json({message: 'Filter value is required'}, {status: 400})
      const label = labels.find(l => caseInsensitiveStringCompare(l.name, filterValue))
      if (!label) {
        return HttpResponse.json(
          {
            message: `Label '${filterValue}' does not exist`,
          },
          {status: 422},
        )
      }

      return HttpResponse.json(label)
    }),

    // Languages
    http.get(`/_filter/languages/validate`, ({request: req}) => {
      const filterValue = new URL(req.url, window.location.origin).searchParams.get('q')
      if (!filterValue) return HttpResponse.json({message: 'Filter value is required'}, {status: 400})
      const language = languages.find(l => caseInsensitiveStringCompare(l.name, filterValue))
      if (!language) {
        return HttpResponse.json(
          {
            message: `Language '${filterValue}' does not exist`,
          },
          {status: 422},
        )
      }

      return HttpResponse.json(language)
    }),
    // Milestones
    http.get('/_filter/milestones/validate', ({request: req}) => {
      const filterValue = new URL(req.url, window.location.origin).searchParams.get('q')
      if (!filterValue) return HttpResponse.json({message: 'Filter value is required'}, {status: 400})
      const milestone = milestones.find(m => caseInsensitiveStringCompare(m.title, filterValue))
      if (!milestone) {
        return HttpResponse.json(
          {
            message: `Milestone '${filterValue}' does not exist`,
          },
          {status: 422},
        )
      }

      return HttpResponse.json(milestone)
    }),
    // Orgs
    http.get('/_filter/organizations/validate', ({request: req}) => {
      const filterValue = new URL(req.url, window.location.origin).searchParams.get('q')
      if (!filterValue) return HttpResponse.json({message: 'Filter value is required'}, {status: 400})
      const org = orgs.find(o => caseInsensitiveStringCompare(o.name, filterValue))
      if (!org) {
        return HttpResponse.json(
          {
            message: `Org '${filterValue}' does not exist`,
          },
          {status: 422},
        )
      }

      return HttpResponse.json(org)
    }),
    // Projects
    http.get(`/_filter/projects/validate`, ({request: req}) => {
      const filterValue = new URL(req.url, window.location.origin).searchParams.get('q')
      if (!filterValue) return HttpResponse.json({message: 'Filter value is required'}, {status: 400})
      const project = projects.find(p => caseInsensitiveStringCompare(p.value, filterValue))
      if (!project) {
        return HttpResponse.json(
          {
            message: `Project '${filterValue}' does not exist`,
          },
          {status: 422},
        )
      }

      return HttpResponse.json(project)
    }),
    // Repositories
    http.get('/_filter/repositories/validate', ({request: req}) => {
      const filterValue = new URL(req.url, window.location.origin).searchParams.get('q')
      if (!filterValue) return HttpResponse.json({message: 'Filter value is required'}, {status: 400})
      const repository = repositories.find(r => caseInsensitiveStringCompare(r.nameWithOwner, filterValue))
      if (!repository) {
        return HttpResponse.json(
          {
            message: `Repository '${filterValue}' does not exist`,
          },
          {status: 422},
        )
      }

      return HttpResponse.json(repository)
    }),
    // Teams
    http.get(`/_filter/teams/validate`, ({request: req}) => {
      const filterValue = new URL(req.url, window.location.origin).searchParams.get('q')
      if (!filterValue) return HttpResponse.json({message: 'Filter value is required'}, {status: 400})
      const team = teams.find(t => caseInsensitiveStringCompare(t.combinedSlug, filterValue))
      if (!team) {
        return HttpResponse.json(
          {
            message: `Team '${filterValue}' does not exist`,
          },
          {status: 422},
        )
      }

      return HttpResponse.json(team)
    }),
    // Users
    http.get(`/_filter/users/validate`, ({request: req}) => {
      const filterValue = new URL(req.url, window.location.origin).searchParams.get('q')

      if (!filterValue) return HttpResponse.json({message: 'Filter value is required'}, {status: 400})
      // This is providing a false positive match
      // const user = filterValue === '@me' ? users[0] : users.find(u => u.login === filterValue)
      const user = users.find(u => caseInsensitiveStringCompare(u.login, filterValue))
      if (!user) {
        return HttpResponse.json(
          {
            message: `User '${filterValue}' does not exist`,
          },
          {status: 422},
        )
      }

      return HttpResponse.json(user)
    }),
  ],
]
