# ConsoleAuth

Use this gem to secure your Rails production console at GitHub. By using ConsoleAuth.gatekeeper, a production console will prompt for a staff login/password and FIDO auth and verify the user has gh-console entitlement.

## Installation

The console_auth gem is published to GitHub packages, in order to pull the gem, follow the [Authenticating with a personal access token](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-rubygems-registry#authenticating-with-a-personal-access-token) step to configure your bundler Add it to your Gemfile and run bundle install:

```ruby
source "https://rubygems.pkg.github.com/github" do
  gem "console_auth"
end
```

If your repository uses a `script/vendor-gem` like [`github/github`](https://github.com/github/github), you can use `script/vendor-gem https://github.com/github/console_auth` to pull in the new gem build from the main branch on github.com or use the `-r` option to use a specific revision.  It will build the gem from source and vendor it directly in the client repository.

Updating & sourcing gem from dotcom:

- https://githubber.com/article/technology/dotcom/howto-manage-gems#updating-a-gem-sourced-from-github

## Usage

Simply require "console_auth" and call `ConsoleAuth.gatekeeper` in your prod console setup. A rails initializer is often the easiest way to do this.

```ruby
# app_root/config/initializers/console_auth.rb

if Rails.env.production?
  require "console_auth"
  Rails.application.console do
    ConsoleAuth.gatekeeper
  end
end
```

When running console_auth in moda, the library attempts to automatically detect this and sets up a logger instance to forward all typed console commands to the kubernets logging system as json formatted logs with a "splunk_index" of "sec-prod-console". In order for the logs to be be sent to the sec-prod-console index, you must have the [fluet-bit logger](https://thehub.github.com/engineering/development-and-ops/observability/logging/fluent-bit/#how-to-start-using-fluent-bit-moda-apps) set up in your moda configs with the "json" parser.

If the automatic detection relies on the `KUBE_NODE_HOSTNAME` env variable being set, if you want to guard against the possibility of this variable being renamed or dropped in the future, you can manually force the moda logger to be used like so:

```ruby
# app_root/config/initializers/console_auth.rb

if Rails.env.production?
  require "console_auth"

  Rails.application.console do
    ConsoleMonitor.logger = ConsoleMonitor.moda_logger
    ConsoleAuth.gatekeeper
  end
end
```

If you want to customize the logger, you can manually configure one and pass it to ConsoleAuth. All messages are passed to the logger by calling `#info` on the instance.

Here's an example of a specifying a custom logger:

```ruby
# app_root/config/initializers/console_auth.rb

if Rails.env.production?
  require "console_auth"

  Rails.application.console do
    ConsoleMonitor.logger = GitHub::Logger
    ConsoleAuth.gatekeeper
  end
end
```

## Development

After checking out the repo, run `bin/setup` to install dependencies. Then, run `rake spec` to run the tests. You can also run `bin/console` for an interactive prompt that will allow you to experiment.

To install this gem onto your local machine, run `bundle exec rake install`.

### Updating `console_auth` gem

If there are no other open PRs, feel free to bump the [version.rb](lib/billing/client/version.rb) alongside the code chage. However, if there are multiple open PRs please save the version bump for a seperate PR.

Once a new version is detected on main, the [Publish GPR Gem workflow](https://github.com/github/publish-gpr-gem-workflow) will cut a new GitHub Release/tag and deploy the gem to GitHub Packages Registry.
