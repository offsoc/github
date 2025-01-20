import type {SystemTemplate} from '../../client/api/memex/contracts'

export const DefaultSystemTemplates: Array<SystemTemplate> = [
  {
    id: 'team_planning',
    title: 'Team planning',
    shortDescription: "Manage your team's work items, plan upcoming cycles, and understand team capacity.",
    imageUrl: {
      dark: '/assets/templates/memex-templates-team-planning-dark.png',
      light: '/assets/templates/memex-templates-team-planning-light.png',
    },
  },
]
