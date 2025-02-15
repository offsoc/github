# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::Spokes::Proto::Repositories::V1::RecomputeChecksumsRequest`.
# Please instead update this file by running `bin/tapioca dsl GitHub::Spokes::Proto::Repositories::V1::RecomputeChecksumsRequest`.

class GitHub::Spokes::Proto::Repositories::V1::RecomputeChecksumsRequest
  sig do
    params(
      checksum_strategy: T.nilable(T.any(Symbol, Integer)),
      priority: T.nilable(GitHub::Spokes::Proto::Types::V1::UpdateReferencesPriority),
      repository: T.nilable(GitHub::Spokes::Proto::Types::V1::Repository),
      request_context: T.nilable(GitHub::Spokes::Proto::Types::V1::RequestContext),
      sockstat: T.nilable(GitHub::Spokes::Proto::Types::V1::Sockstat)
    ).void
  end
  def initialize(checksum_strategy: nil, priority: nil, repository: nil, request_context: nil, sockstat: nil); end

  sig { returns(T.any(Symbol, Integer)) }
  def checksum_strategy; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def checksum_strategy=(value); end

  sig { void }
  def clear_checksum_strategy; end

  sig { void }
  def clear_priority; end

  sig { void }
  def clear_repository; end

  sig { void }
  def clear_request_context; end

  sig { void }
  def clear_sockstat; end

  sig { returns(T.nilable(GitHub::Spokes::Proto::Types::V1::UpdateReferencesPriority)) }
  def priority; end

  sig { params(value: T.nilable(GitHub::Spokes::Proto::Types::V1::UpdateReferencesPriority)).void }
  def priority=(value); end

  sig { returns(T.nilable(GitHub::Spokes::Proto::Types::V1::Repository)) }
  def repository; end

  sig { params(value: T.nilable(GitHub::Spokes::Proto::Types::V1::Repository)).void }
  def repository=(value); end

  sig { returns(T.nilable(GitHub::Spokes::Proto::Types::V1::RequestContext)) }
  def request_context; end

  sig { params(value: T.nilable(GitHub::Spokes::Proto::Types::V1::RequestContext)).void }
  def request_context=(value); end

  sig { returns(T.nilable(GitHub::Spokes::Proto::Types::V1::Sockstat)) }
  def sockstat; end

  sig { params(value: T.nilable(GitHub::Spokes::Proto::Types::V1::Sockstat)).void }
  def sockstat=(value); end
end
