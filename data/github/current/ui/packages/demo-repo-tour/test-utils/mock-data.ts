import type {DemoRepoTourProps} from '../DemoRepoTour'

export function getDemoRepoTourProps(): DemoRepoTourProps {
  return {
    tour_steps: [
      {
        title: 'First step title',
        description: 'First step description',
        key: 'first-step',
        path: '/first-step-path',
        called_out_element_css_class: 'first-step-class',
      },
      {
        title: 'Second step title',
        description: 'Second step description',
        key: 'second-step',
        path: '/second-step-path',
        called_out_element_css_class: 'second-step-class',
      },
    ],
    upgrade_cta_path: '/the-cta-path',
    referral_organization_id: 1,
    repository_name: 'fake-repo',
  }
}
