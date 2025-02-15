# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::V1::SecretScanningError`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::V1::SecretScanningError`.

class Hydro::Schemas::Github::V1::SecretScanningError
  sig do
    params(
      actor: T.nilable(Hydro::Schemas::Github::V1::Entities::User),
      error_type: T.nilable(T.any(Symbol, Integer)),
      repository: T.nilable(Hydro::Schemas::Github::V1::Entities::Repository),
      request_context: T.nilable(Hydro::Schemas::Github::V1::Entities::RequestContext),
      scan_scope: T.nilable(Google::Protobuf::StringValue)
    ).void
  end
  def initialize(actor: nil, error_type: nil, repository: nil, request_context: nil, scan_scope: nil); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::User)) }
  def actor; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::User)).void }
  def actor=(value); end

  sig { void }
  def clear_actor; end

  sig { void }
  def clear_error_type; end

  sig { void }
  def clear_repository; end

  sig { void }
  def clear_request_context; end

  sig { void }
  def clear_scan_scope; end

  sig { returns(T.any(Symbol, Integer)) }
  def error_type; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def error_type=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::Repository)) }
  def repository; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::Repository)).void }
  def repository=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::RequestContext)) }
  def request_context; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::RequestContext)).void }
  def request_context=(value); end

  sig { returns(T.nilable(Google::Protobuf::StringValue)) }
  def scan_scope; end

  sig { params(value: T.nilable(Google::Protobuf::StringValue)).void }
  def scan_scope=(value); end
end
