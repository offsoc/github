# AdvisoryDBToolkit

This gem houses functionality that is used primarily by advisory-db inbox service but useful or necessary in other services as well.

## Components

The following shared components are made available via the `advisory_db_toolkit` gem:

- `AdvisoryDBToolkit::CVEIDValidator` implements pattern matching methods for working with CVE ID strings.
- `AdvisoryDBToolkit::Ecosystems` is the canonical map of AdvisoryDB supported ecosystems to OSV supported ecosystems. It should be updated anytime a new ecosystem is added to the Advisory DB service and could appear in published advisories.
- `AdvisoryDBToolkit::GHSAIDValidator` implements pattern matching methods for working with GHSA ID strings.
- `AdvisoryDBToolkit::OSV` provides a single code location for all OSV transformation logic, compatible across dotcom and advisory-db. More information is available in that module's [README](./lib/osv/README.md).
- `AdvisoryDBToolkit::ReferenceSorter` is a utility for sorting an array of reference URLs based on a specific hierarchy.
- `AdvisoryDBToolkit::VulnerableFunctionAdapter` is a utility for turning vulnerable functions (in string, array, hash format, v0 or v1) into a common object model
- `AdvisoryDBToolkit::Utility` is a set of convenience methods used by the other modules, mostly to remove the dependency on other external utility libraries like ActiveSupport.
- `AdvisoryDBToolkit::PackageUrlObtainer` gets the ecosystem package URL from the ecosystems APIs.

## Usage

### Setup

Add in an initializer the following required settings:

``` ruby
AdvisoryDBToolkit.logger = # your app logger. E.g. ::GitHub::Telemetry::Logs.logger
AdvisoryDBToolkit.cache = # your app cache. E.g. AdvisoryDB.redis
AdvisoryDBToolkit.cache_prefix_key = # your preferred cache prefix. E.g. "advisory_database"

```

### Using in Advisory DB

The Advisory DB service references this folder directly to import the gem. Care should be taken to ensure that no breaking changes are introduced to the gem that aren't ready to be used in the advisory-db service.

### Using outside of Advisory DB

To install the gem in a different service, use a `vendor-gem` script. Note that as of at least version 0.2.0 of this gem there are no version tags, so you need to be able to vendor from the main development branch of the advisory-db repo without tags. For example, in dotcom this can be accomplished with the following command line:

```bash
# `-n` - the name of the gem
# `-p` - the path to the folder where the gemspec lives
# `-r` - the reference (branch, commit, tag, etc.) to pull from
# `--ignore-tag-for-version` - don't rely on tags for the version, use the gemspec

$ script/vendor-gem -n advisory_db_toolkit -p packages/advisory_db_toolkit -r main https://github.com/github/advisory-db --ignore-tag-for-version
```

## Development

Gem development takes place inside the advisory-db repo. After checking out the repo, first `cd packages/advisory_db_toolkit`, then run `bin/setup` to install dependencies. Run `bundle exec rake test` to run the tests. You can also run `bin/console` for an interactive prompt that will allow you to experiment.

Running a specific test file can be done via `bundle exec rake test` arguments, e.g. `bundle exec rake test TEST=test/osv/osv/transformers/schema_v1_test.rb`. A specific test name can be targeted with TESTOPS: `bundle exec rake test TEST=test/lib/vulnerable_function_loader_test.rb  TESTOPS="--name=/test_v1_equality/"`

Development on the gem should be managed like any other project. Ensure you are adding tests for functional changes to the gem itself in `packages/advisory_db_toolkit/tests`, and make sure that your callsites from advisory-db and elsewhere have adequate coverage as well, especially where interfaces are involved such as when using the OSV module.

### Versioning and Deployment

Before merging changes into the advisory-db repo, please remember to bump the version as appropriate in the [gemspec](./advisory_db_toolkit.gemspec) and update the [changelog](./CHANGELOG.md). Next run `bundle` from the project root to update `Gemfile.lock`. Finally, commit your changes and create your PR in the advisory-db repo. Once your PR has been merged, follow the steps in [Using outside of Advisory DB](#using-outside-of-advisory-db) to pull the toolkit updates into host projects.

## Contributing

All source code for this gem can be found at https://github.com/github/advisory-db/packages/advisory_db_toolkit
