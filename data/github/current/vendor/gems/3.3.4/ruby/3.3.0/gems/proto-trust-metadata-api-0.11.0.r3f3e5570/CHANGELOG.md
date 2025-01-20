# CHANGELOG

## [0.11.0] - 2024-05-23

- Add `GetAttestationSummaryByRepository` endpoint

## [0.10.3] - 2024-05-14

- Add `ListAttestationsByRepositorySummary` endpoint

## [0.10.2] - 2024-01-11

- Add `tenant_id` to ArtifactAttestation

## [0.10.1] - 2023-12-12

- Add `artifact_name` to `provenance_summary` in `ListAttestationsByRepository`
- Use `Faraday.use` instead of `Faraday::Request.register_middleware` when creating a client

## [0.10.0] - 2023-10-30

- Provenance Summary added to GetAttestationByRepository endpoint
- Provenance Summary added to ListAttestationsByRepository endpoint
- Added `created_at` to ListAttestationsByRepository & GetAttestationByRepository response

## [0.9.0] - 2023-10-20

- Update Create* endpoints to return ID of newly created attestation

## [0.8.0] - 2023-09-21

- Rename the gem `proto-trust-metadata-api` to align with other dotcom twirp API clients and avoid module naming collisions with models in dotcom.

## [0.7.0] - 2023-09-21

- Rearrange the client file structure
- Keep generated protobuf files in their own directory
- Introduce Sorbet for type checking

## [0.6.0] - 2023-09-14

- Added ListAttestationsByRepository endpoint

## [0.5.0] - 2023-09-07

- Initial version
