# Actions Usage Metrics

Welcome to the front end for Actions Usage Metrics (and beyond!) We have a [video walkthrough](https://github.rewatch.com/video/xgpo0chdxr1i9quo-actions-usage-metrics-front-end-overview-november-9-2023) you can watch if you are getting started

## Development

If you are not familiar with development on gh/gh development you should be running this inside a gh/gh codespace for development

Once the codespace is started you can set it up for actions metrics with the following steps:

- Run `bin/toggle-feature-flag enable actions_usage_metrics` to enable the feature flag that makes this viewable - only needs to be once per codespace (`bin/toggle-feature-flag enable actions_performance_metrics` for performance)
- You may need to get [JIT](https://jit-okta-bouncer.githubapp.com/azure) for `actions-usage-metrics-nonprod`
- Start the backend service: (run once per codespace usually)

  ```shell
  git clone https://github.com/github/actions-usage-metrics.git /workspaces/actions-usage-metrics
  curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
  ( cd /workspaces/actions-usage-metrics; script/setup )
  ( cd /workspaces/actions-usage-metrics; script/server )
  ```

- If there are GOPROXY related issues with the previous step they can usually be fixed by running `/usr/local/share/goproxy-init.sh --override` and then trying again. If the GOPROXY token is actually expired you might have to run `kind delete cluster` and start it up again with `script/setup`.

- Start monolith with `script/server`. This should open the prompt you with to open a tab and once it's started you should be able to login to the app with the `monalisa` username
- From there you should be able to navigate to our page which is located at [http://github.localhost/orgs/github/actions/metrics/usage](http://github.localhost/orgs/github/actions/metrics/usage). If the link does not work after the monolith is fully up and running you may have your web port set to something other than 80 and would need to remap it or add your port to the URL.

## Debugging

### Debugging React

Debugging is very easy, once you are at the page running in your codespace just open the browser dev tools, go to sources, and set a breakpoint. You can find the file similarly to VS Code with `Cmd + P`

If you need to add console logging anywhere (remember to remove it before checking in) you can add `/* eslint no-console: "off" */` to the top of the file to avoid build errors

### Debugging Monolith Controller

You can debug the controller/monolith code by going to the debug tab and clicking the run and debug with `ruby debug: start unicorn` selected

Conversely you can also start monolith with `script/server --debug --dap` and then going to the debug tab and clicking the run and debug with `ruby debug: attach to unicorn` selected

## Testing

- React tests can be run with `npm run test -w ui/packages/actions-metrics`
- Org Usage Controller tests can be run with `./bin/rails test test/integration/orgs/actions_metrics/usage_controller_test.rb`
- Our ruby utils tests can be run with `./bin/rails test test/helpers/actions_metrics/actions_metrics_helpers_test.rb`

Ruby tests can be debugged from the debug tab in VSCode by selecting `ruby debug: run tests in file` from the dropdown. React tests can be debugged similarly by selecting `Debug Jest Tests` or you can open the file and click the green button next to the test

## Feature Flags

Feature flags can be shared with the front end by adding them to the `usage_controller` in the `get_feature_flags` method which is processed as part of the payload. Any feature flags added here will be accessible to the front end via the feature flag service

Adding feature flags to make them accessible:

```rb
def get_feature_flags
    {
      actions_usage_metrics_jobs_tab: jobs_tab_enabled?,
      actions_usage_metrics_other_tabs: other_tabs_enabled?,
    }
  end

  def jobs_tab_enabled?
    this_organization&.feature_enabled?(:actions_usage_metrics_jobs_tab) || current_user&.feature_enabled?(:actions_usage_metrics_jobs_tab)
  end

  def other_tabs_enabled?
    this_organization&.feature_enabled?(:actions_usage_metrics_other_tabs) || current_user&.feature_enabled?(:actions_usage_metrics_other_tabs)
  end
```

How to use them in the front end:

```ts
const MyMethod() {
  const payloadService = Services.get<IPayloadService>('IPayloadService')

  if (payloadService.getFeatureFlag('actions_usage_metrics_jobs_tab')) {
    // do something because FF is enabled
  } else {
    // do something else because FF is disabled
  }
}
```

[See here for more general info on FFs](https://thehub.github.com/epd/engineering/products-and-services/dotcom/features/feature-flags/overview/)

## Additional Notes

- When adding packages you can add them to the package json, but you need to run `npm i` afterwards in terminal (WITHOUT cd to actions-metrics) to update the github package-log
- You may have to restart the TypeScript and/or ESLint server in vs code via command palette after adding new packages to get rid of errors
- If you need to test access related things you can created new users with bin/seed `user -l=[USERNAME HERE]`
- A new staff user can be created as follows:

  ```bash
  bin/seed console
  user = Seeds::Objects::User.create(login: "foobar")
  Seeds::Objects::User.add_stafftools(user)
  ```

## Monitoring

- [Front end errors](https://github.sentry.io/issues/?project=1890375&query=is%3Aunresolved+gh.exception.catalog_service%3Agithub%2Factions_usage_metrics&referrer=event-tags&sort=new&statsPeriod=1h&stream_index=8)
- [Front end performance dashboard](https://app.datadoghq.com/dashboard/833-nen-yvf/web-performance-service-scorecard?refresh_mode=sliding&tpl_var_controller%5B0%5D=orgs_actions_metrics_usage&tpl_var_controller%5B1%5D=orgs%2Factions_metrics%2Fusage&from_ts=1700813245098&to_ts=1700816845098&live=true)
- [Analytics - Azure Data Explorer](https://dataexplorer.azure.com/clusters/ghdwprod.eastus/databases/hydro?query=H4sIAAAAAAAAA22PQQ6CQAxF956icQUJGDzALDzJZByaOAQ6k04FTDy8FUQWuuvvf/35deT6hwSf7djYK8cpI1sckeTwBJwFqQUvs0mOM9ouRyp8JFGnhJ1gdF6McqdlqsClZMkNuOw2Ua3cJaUdVaEx0w0ZVxeMAeE7gtPcYjt9b4/qhki5HlBYGx8h8jfxL1BqdOLYoZeaMXKLDL9lKvh8pHQfhiBwbpoXvjS/gBgBAAA=). Note you must login with @githubazure.com account
- [Analytics - data.githubapp](https://data.githubapp.com/sql/349b6ee5-7439-4372-96e7-784be8c98c03#)
