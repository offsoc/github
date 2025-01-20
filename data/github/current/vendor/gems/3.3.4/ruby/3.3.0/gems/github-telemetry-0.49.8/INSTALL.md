# Install

We recommend installing this gem via GPR. You will need an access token with both `contents` and `packages` `read` scopes on the `github` organizations private repositories in order to install this gem.

## Setup GPR Token

### Using Codespaces Repo Permissions

The recommended way of enabling permissions in your codespace is to customize repo permissions using your `devcontainer.json`, e.g.

```json
{
  "containerEnv": {
    "BUNDLE_RUBYGEMS__PKG__GITHUB__COM": "${localEnv:GITHUB_USER}:${localEnv:GITHUB_TOKEN}"
  },
  "customizations": {
    "codespaces": {
      "repositories": [
        {
          "name": "github/*",
          "permissions": {
            "contents": "read",
            "packages": "read"
          }
        },
      ]
    },
  },
 ```

This will add a `https://rubygems.pkg.github.com` as a global rubygems source for bundler using your codespace username and token with the appropriate permissions to download the gem from GPR. 

### Using PATs 

If you do not use codespaces then you will need to configure your development environment to [install gems from GPR][gpr-rubygems].

1. Configure RubyGems with your GitHub username and PAT. Substitute `GITHUB_USER` for your GitHub username, and `GITHUB_TOKEN` for your PAT:
    ```yaml
      # ~/.gemrc
      ---
        :backtrace: false
        :bulk_threshold: 1000
        :sources:
        - https://rubygems.org/
        - https://<GITHUB_USER>:<GITHUB_TOKEN>@rubygems.pkg.github.com/github/
        :update_sources: true
        :verbose: true

    ```
1. Configure Bundler with your GitHub username and PAT. Substitute `GITHUB_USER` for your GitHub username, and `GITHUB_TOKEN` for your PAT with either:
    `bundle config https://rubygems.pkg.github.com/github ${GITHUB_USER}:${GITHUB_TOKEN}`
    Or
    `export BUNDLE_RUBYGEMS__PKG__GITHUB__COM=${GITHUB_USER}:${GITHUB_TOKEN}`

## Install Using Bundler

Now that you have configured your development environment you may install the gem using bundler:

1. Add the following to your application's Gemfile:

    ```ruby

      source "https://rubygems.pkg.github.com/github" do
        gem 'github-telemetry'
      end

    ```

1. And then execute:

    ```bash

      $ bundle install

    ```

[gpr-rubygems]: https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-rubygems-registry
