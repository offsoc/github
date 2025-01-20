# GitHub Trilogy Adapter

github/github customizations for [Trilogy Adapter](https://github.com/github/activerecord-trilogy-adapter)

## Features

Avoid adding new features to this library. Much of what is here is tech debt
that should eventually be removed or contributed upstream to Rails.

## Requirements

If you are upgrading to Rails 7.1, you likely do not need this library and can
use the Trilogy adapter in Rails instead. Reach out to Ruby Architecture if you
need help.

- [Ruby](https://www.ruby-lang.org) 2.7 or higher
- [Active Record](https://github.com/rails/rails) 7.1 or higher.
- [Trilogy Adapter](https://github.com/github/activerecord-trilogy-adapter) 2.0.0 or higher

This library includes the original commit history for `trilogy_adapter`, as well
as some branches to allow using `trilogy_adapter` with older versions of Rails:
  - Active Record 7.0: [activerecord-7-0][]
  - Active Record 6: [1-0-stable][]

[activerecord-7-0]: https://github.com/github/github-trilogy-adapter/tree/activerecord-7-0
[1-0-stable]: https://github.com/github/github-trilogy-adapter/tree/1-0-stable

## Setup

* Add the following to your Gemfile:

    gem "github_trilogy_adapter"

* Update your database configuration (e.g. `config/database.yml`) to use
  `github_trilogy` as the adapter.

## Versioning

Read [Semantic Versioning](https://semver.org) for details. Briefly, it means:

- Major (X.y.z) - Incremented for any backwards incompatible public API changes.
- Minor (x.Y.z) - Incremented for new, backwards compatible, public API enhancements/fixes.
- Patch (x.y.Z) - Incremented for small, backwards compatible, bug fixes.

## Code of Conduct

Please note that this project is released with a [CODE OF CONDUCT](CODE_OF_CONDUCT.md). By
participating in this project you agree to abide by its terms.

## Contributions

Read [CONTRIBUTING](CONTRIBUTING.md) for details.

## License

Released under the [MIT License](LICENSE.md).
