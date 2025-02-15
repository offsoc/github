# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::Spokes::Proto::LegacyGitrpc::V1::LegacyGitrpcReaderRequest`.
# Please instead update this file by running `bin/tapioca dsl GitHub::Spokes::Proto::LegacyGitrpc::V1::LegacyGitrpcReaderRequest`.

class GitHub::Spokes::Proto::LegacyGitrpc::V1::LegacyGitrpcReaderRequest
  sig do
    params(
      ernicorn_request: T.nilable(GitHub::Spokes::Proto::LegacyGitrpc::V1::ErnicornRequest),
      repository: T.nilable(GitHub::Spokes::Proto::Types::V1::Repository),
      request_context: T.nilable(GitHub::Spokes::Proto::Types::V1::RequestContext),
      topology_context: T.nilable(GitHub::Spokes::Proto::LegacyGitrpc::V1::TopologyContext)
    ).void
  end
  def initialize(ernicorn_request: nil, repository: nil, request_context: nil, topology_context: nil); end

  sig { void }
  def clear_ernicorn_request; end

  sig { void }
  def clear_repository; end

  sig { void }
  def clear_request_context; end

  sig { void }
  def clear_topology_context; end

  sig { returns(T.nilable(GitHub::Spokes::Proto::LegacyGitrpc::V1::ErnicornRequest)) }
  def ernicorn_request; end

  sig { params(value: T.nilable(GitHub::Spokes::Proto::LegacyGitrpc::V1::ErnicornRequest)).void }
  def ernicorn_request=(value); end

  sig { returns(T.nilable(GitHub::Spokes::Proto::Types::V1::Repository)) }
  def repository; end

  sig { params(value: T.nilable(GitHub::Spokes::Proto::Types::V1::Repository)).void }
  def repository=(value); end

  sig { returns(T.nilable(GitHub::Spokes::Proto::Types::V1::RequestContext)) }
  def request_context; end

  sig { params(value: T.nilable(GitHub::Spokes::Proto::Types::V1::RequestContext)).void }
  def request_context=(value); end

  sig { returns(T.nilable(GitHub::Spokes::Proto::LegacyGitrpc::V1::TopologyContext)) }
  def topology_context; end

  sig { params(value: T.nilable(GitHub::Spokes::Proto::LegacyGitrpc::V1::TopologyContext)).void }
  def topology_context=(value); end
end
