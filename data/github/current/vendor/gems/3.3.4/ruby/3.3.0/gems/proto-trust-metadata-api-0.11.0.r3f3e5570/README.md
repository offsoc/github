# Proto::TrustMetadataApi::Client

This is the Ruby client that `github/github` (AKA `dotcom`) uses to talk to the Trust-Metadata-API.

## Updating

- Generate ruby protobuf files from service definitions and download latest sigstore protos: `cd ../../ && script/generate-ruby-protobuf-files` (See the [dev-dotcom](../../docs/dev-dotcom.md#updating-the-tma-ruby-gem) docs for more info)
- Update sorbet types:
  - `bundle exec tapioca dsl`
  - `bundle exec tapioca gems`
  - `bundle exec tapioca annotations`
- Check sorbet types: `bundle exec srb tc`
- Check [dev-dotcom](../../docs/dev-dotcom.md#updating-the-tma-ruby-gem) docs on how to update the gem in `github/github`

## Testing

- Start a local instance of Trust-Metadata-API server
- Run `make dev-migrate-reset` to reset the database
- Run `bundle exec rake test` to run the tests
