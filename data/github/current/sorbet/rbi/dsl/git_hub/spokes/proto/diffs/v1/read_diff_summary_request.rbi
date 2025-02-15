# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::Spokes::Proto::Diffs::V1::ReadDiffSummaryRequest`.
# Please instead update this file by running `bin/tapioca dsl GitHub::Spokes::Proto::Diffs::V1::ReadDiffSummaryRequest`.

class GitHub::Spokes::Proto::Diffs::V1::ReadDiffSummaryRequest
  sig do
    params(
      base_oid: T.nilable(GitHub::Spokes::Proto::Types::V1::ObjectID),
      diff_algorithm: T.nilable(T.any(Symbol, Integer)),
      ignore_whitespace: T.nilable(T::Boolean),
      include_stat: T.nilable(T::Boolean),
      object_id1: T.nilable(GitHub::Spokes::Proto::Types::V1::ObjectID),
      oid2: T.nilable(GitHub::Spokes::Proto::Types::V1::ObjectID),
      repository: T.nilable(GitHub::Spokes::Proto::Types::V1::Repository),
      request_context: T.nilable(GitHub::Spokes::Proto::Types::V1::RequestContext),
      root_selector1: T.nilable(GitHub::Spokes::Proto::Types::Selectors::V1::RootSelector)
    ).void
  end
  def initialize(base_oid: nil, diff_algorithm: nil, ignore_whitespace: nil, include_stat: nil, object_id1: nil, oid2: nil, repository: nil, request_context: nil, root_selector1: nil); end

  sig { returns(T.nilable(GitHub::Spokes::Proto::Types::V1::ObjectID)) }
  def base_oid; end

  sig { params(value: T.nilable(GitHub::Spokes::Proto::Types::V1::ObjectID)).void }
  def base_oid=(value); end

  sig { void }
  def clear_base_oid; end

  sig { void }
  def clear_diff_algorithm; end

  sig { void }
  def clear_ignore_whitespace; end

  sig { void }
  def clear_include_stat; end

  sig { void }
  def clear_object_id1; end

  sig { void }
  def clear_oid2; end

  sig { void }
  def clear_repository; end

  sig { void }
  def clear_request_context; end

  sig { void }
  def clear_root_selector1; end

  sig { returns(T.any(Symbol, Integer)) }
  def diff_algorithm; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def diff_algorithm=(value); end

  sig { returns(T::Boolean) }
  def ignore_whitespace; end

  sig { params(value: T::Boolean).void }
  def ignore_whitespace=(value); end

  sig { returns(T::Boolean) }
  def include_stat; end

  sig { params(value: T::Boolean).void }
  def include_stat=(value); end

  sig { returns(T.nilable(GitHub::Spokes::Proto::Types::V1::ObjectID)) }
  def object_id1; end

  sig { params(value: T.nilable(GitHub::Spokes::Proto::Types::V1::ObjectID)).void }
  def object_id1=(value); end

  sig { returns(T.nilable(Symbol)) }
  def oid1; end

  sig { returns(T.nilable(GitHub::Spokes::Proto::Types::V1::ObjectID)) }
  def oid2; end

  sig { params(value: T.nilable(GitHub::Spokes::Proto::Types::V1::ObjectID)).void }
  def oid2=(value); end

  sig { returns(T.nilable(GitHub::Spokes::Proto::Types::V1::Repository)) }
  def repository; end

  sig { params(value: T.nilable(GitHub::Spokes::Proto::Types::V1::Repository)).void }
  def repository=(value); end

  sig { returns(T.nilable(GitHub::Spokes::Proto::Types::V1::RequestContext)) }
  def request_context; end

  sig { params(value: T.nilable(GitHub::Spokes::Proto::Types::V1::RequestContext)).void }
  def request_context=(value); end

  sig { returns(T.nilable(GitHub::Spokes::Proto::Types::Selectors::V1::RootSelector)) }
  def root_selector1; end

  sig { params(value: T.nilable(GitHub::Spokes::Proto::Types::Selectors::V1::RootSelector)).void }
  def root_selector1=(value); end
end
