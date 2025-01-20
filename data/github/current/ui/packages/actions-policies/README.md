# Actions Policies
This package holds the front end components for Actions Policies - we are in the [#actions-policies](https://github-grid.enterprise.slack.com/archives/C069D5K7BGF) channel in Slack.

## Development

### Local
To enable the feature flag for local development, run `toggle-feature-flag enable actions_permissions_ui_update`.

When you add or remove a package, sometimes you'll need to restart ESLint to pick up the changes. From the Command Palette (`CMD + P` by default), you can type `>> Restart ESLint` and hit Enter. If the server is running, you might also need to restart the Typescript server via the same Command Palette, and `>> Restart TS`.

### Production
When you are ready to test a change E2E, you can deploy the PR to an isolated [review lab](https://thehub.github.com/epd/engineering/devops/deployment/environments/review-lab/), and toggle the feature flag for your user in [DevPortal](https://devportal.githubapp.com/). Keep in mind that your GitHub account will need to be an administrator of an `Enterprise` to be able to access the policy settings. From Home, navigate to the settings page of the Enterprise, and the settings are located under `Policies -> Actions`.

## Common commands
Install a package
```bash
npm install @primer/react-brand -w ui/packages/actions-policies
```

Uninstall a package
```bash
npm uninstall @primer/react-brand -w ui/packages/actions-policies
```

Run full test suite
```bash
npm run test -w ui/packages/actions-policies
```

Run a specific test
```bash
npm run test -w ui/packages/actions-policies -i ActionsPoliciesSSR
```

## Testing
If you need to debug Ruby controller or model code, you can run the monolith in Debug mode, via `ruby debug: start unicorn` and set breakpoints + inspect variables.

React code can be debugged via running the individual test that is failing from the file with `Debug Jest tests` from the Run and Debug menu in VSCode.

## React resources
### [React at GitHub](https://thehub.github.com/epd/engineering/dev-practicals/frontend/react/)
This is a great place to start, if you are looking for a paved path to do something in the React world.

### [Primer](https://primer.style/)
GitHub's design system - useful for looking for components and common patterns on how they are used

### [Flexbox Froggy](https://flexboxfroggy.com/)
One of the best ways to understand Flexbox, and how to write the CSS code to place components within flexboxes.


