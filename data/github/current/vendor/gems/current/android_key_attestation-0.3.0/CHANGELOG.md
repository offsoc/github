# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.3.0] - 2020-02-16
### Added
- `Statement#verify_certificate_chain` to verify if the attestation certificate is trustworthy

## [0.2.0] - 2019-12-31
### Changed
- Raise `ChallengeMismatchError` if the challenge lengths are different, not `ArgumentError`

## [0.1.0] - 2019-12-29
### Added
- Extracted from [webauthn-ruby](https://github.com/cedarcode/webauthn-ruby) after discussion with the maintainers. Thanks for the feedback @grzuy and @brauliomartinezlm!

[Unreleased]: https://github.com/bdewater/android_key_attestation/compare/v0.3.0...HEAD
[0.3.0]: https://github.com/bdewater/android_key_attestation/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/bdewater/android_key_attestation/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/bdewater/android_key_attestation/releases/tag/v0.1.0
