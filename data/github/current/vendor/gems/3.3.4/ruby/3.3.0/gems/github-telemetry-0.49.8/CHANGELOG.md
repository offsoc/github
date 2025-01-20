# Changelog

## [0.49.8](https://github.com/github/github-telemetry-ruby/compare/v0.49.7...v0.49.8) (2024-07-31)


### Features

* make otlp exporter monkey patch always on ([5e3134f](https://github.com/github/github-telemetry-ruby/commit/5e3134f4c2072f4b4bd4a95bfe02940a0f2a532c))

## [0.49.7](https://github.com/github/github-telemetry-ruby/compare/v0.49.6...v0.49.7) (2024-07-18)


### Features

* monkeypatch otlp exporter to reconnect on 503 ([5c3d67c](https://github.com/github/github-telemetry-ruby/commit/5c3d67c69063847d6b7c202161b6728eb1b98d4c))

## [0.49.6](https://github.com/github/github-telemetry-ruby/compare/v0.49.5...v0.49.6) (2024-07-18)


### Bug Fixes

* pin rails_semantic_logger and semantic_logger gems to avoid bug in semanti_logger 4.16 ([#616](https://github.com/github/github-telemetry-ruby/issues/616)) ([6458912](https://github.com/github/github-telemetry-ruby/commit/6458912b0d5d9212d1e39bc8a7fb79b53e1fbc84))

## [0.49.5](https://github.com/github/github-telemetry-ruby/compare/v0.49.4...v0.49.5) (2024-06-17)


### Bug Fixes

* include net.peer.name in ethon spans ([#602](https://github.com/github/github-telemetry-ruby/issues/602)) ([b9186c7](https://github.com/github/github-telemetry-ruby/commit/b9186c73c277c82590a0938f5e654d167d61e96c))

## [0.49.4](https://github.com/github/github-telemetry-ruby/compare/github-telemetry-v0.49.3...github-telemetry/v0.49.4) (2024-06-13)


### Bug Fixes

* include net.peer.name in ethon spans ([#602](https://github.com/github/github-telemetry-ruby/issues/602)) ([b9186c7](https://github.com/github/github-telemetry-ruby/commit/b9186c73c277c82590a0938f5e654d167d61e96c))

## [0.48.0](https://github.com/github/github-telemetry-ruby/compare/v0.47.2...v0.48.0) (2023-12-13)


### Features

* Change default instrumentations ([#559](https://github.com/github/github-telemetry-ruby/issues/559)) ([cf4e84c](https://github.com/github/github-telemetry-ruby/commit/cf4e84cc1419c2df71eaad4430c25c1288683d68))
* Enable Pending Span Processor by default ([#562](https://github.com/github/github-telemetry-ruby/issues/562)) ([aba98be](https://github.com/github/github-telemetry-ruby/commit/aba98be204d4fe2a6a3f0af23eb6a039b13154da))
* Exception hack based on Java and .Net ([#545](https://github.com/github/github-telemetry-ruby/issues/545)) ([bb15096](https://github.com/github/github-telemetry-ruby/commit/bb15096b2cc934fe4ed2ba7f4fc47476d51a3474))


### Bug Fixes

* Handle Recursive Errors ([#569](https://github.com/github/github-telemetry-ruby/issues/569)) ([0623308](https://github.com/github/github-telemetry-ruby/commit/06233081bb5fe3879af276885bf2a9efb46735e8))

## Changelog

See [Releases](https://github.com/github/github-telemetry-ruby/releases)
