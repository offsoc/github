# Contributing

<details>
<summary>
Table of Contents
</summary>
<!-- Re-generate TOC with `markdown-toc --no-first-h1 -i` -->

<!-- toc -->

- [How may I contribute?](#how-may-i-contribute)
  - [Contact us](#contact-us)
  - [Submit a PR](#submit-a-pr)
- [Release Management](#release-management)

<!-- tocstop -->
</details>

:+1::tada: Thanks for taking the time to contribute! :tada::+1:

The following is a set of guidelines for contributing to GitHub Telemetry. These are mostly guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request.

## How may I contribute?

### Contact us

No problem! Here are a few ways to get in touch with us:

- [Open a Discussion](https://github.com/github/observability/discussions)
- [Create an Issue](https://github.com/github/github-telemetry-ruby/issues)
- [Post in the `#observability` Slack channel](https://github.slack.com/archives/C9H0UJC2W)

### Submit a PR

A few things you should know before getting started with development:

1. This project uses [`appraisal`][appraisal-gem] to test against different versions of third party dependencies like Rails and Faraday
1. This project vendors gems for all `appraisal` versions. When you update a dependencies you _must_ also commit the vendored gems so they are available for use in GH Actions and Build Pipelines
1. This project is built using codespaces and requires access to [GitHub Package Registry in order to install private gem dependencies][codespaces-permissions]
1. Launching a new codespaces will attempt to update dependencies to the latest version of vendored gems
1. We recommend that you have an [Issue][issues] that describes the problem or feature the PR will address.

How to run tests:

1. To test, we recommend running `script/test` which will load the appropriate appraisal + rspec tasks for you for testing against Rails 7.
1. If you wish to test a specific version of rails locally, you may do so with `bundle exec appraisal rails-N rspec` (`bundle exec appraisal rails-N` loads the correct environment for that version of rails, and then passes your commands through).
1. Note that running tests against older versions of rails locally will likely fail unless you also have changed your local ruby version to match. We recommend allowing CI to run the test suite against older versions of rails, unless you find a need to debug locally.

Once you are ready [submit a PR](https://github.com/github/github-telemetry-ruby/pulls). Ensure all checks pass and then merge your changes!

## Release Management

This project uses the [Google API Release Please Action][release-gpr-gem-workflow] to manage the changelog, versioning, and publishing of the gem.

The action requires the use of conventional commits to determine the next version of the gem. This means that you must conform to the [Conventional Commits Specification](https://www.conventionalcommits.org/en/v1.0.0/) to ensure that the version is correctly determined.

The action generates a PR that includes the changes to the `CHANGELOG.md` file and the version bump in the `lib/github_telemetry/version.rb` file. Once the PR is merged, the action will automatically publish the new version of the gem to the GitHub Package Registry as well as create a new release on GitHub.

When you are ready review and merge the release PR. Once merged the action will take care of the rest!

[appraisal-gem]: https://github.com/thoughtbot/appraisal
[codespaces-permissions]: https://github.com/orgs/github/teams/codespaces-team/discussions/59
[release-gpr-gem-workflow]: https://github.com/github/github-telemetry-ruby/actions/workflows/release-please.yml
[issues]: https://github.com/github/github-telemetry-ruby/issues
