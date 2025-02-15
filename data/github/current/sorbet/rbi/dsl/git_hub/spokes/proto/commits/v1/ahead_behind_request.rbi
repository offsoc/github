# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::Spokes::Proto::Commits::V1::AheadBehindRequest`.
# Please instead update this file by running `bin/tapioca dsl GitHub::Spokes::Proto::Commits::V1::AheadBehindRequest`.

class GitHub::Spokes::Proto::Commits::V1::AheadBehindRequest
  sig do
    params(
      base_and_tips_selector: T.nilable(GitHub::Spokes::Proto::Commits::V1::BaseAndTipsSelector),
      repository: T.nilable(GitHub::Spokes::Proto::Types::V1::Repository),
      request_context: T.nilable(GitHub::Spokes::Proto::Types::V1::RequestContext)
    ).void
  end
  def initialize(base_and_tips_selector: nil, repository: nil, request_context: nil); end

  sig { returns(T.nilable(GitHub::Spokes::Proto::Commits::V1::BaseAndTipsSelector)) }
  def base_and_tips_selector; end

  sig { params(value: T.nilable(GitHub::Spokes::Proto::Commits::V1::BaseAndTipsSelector)).void }
  def base_and_tips_selector=(value); end

  sig { void }
  def clear_base_and_tips_selector; end

  sig { void }
  def clear_repository; end

  sig { void }
  def clear_request_context; end

  sig { returns(T.nilable(GitHub::Spokes::Proto::Types::V1::Repository)) }
  def repository; end

  sig { params(value: T.nilable(GitHub::Spokes::Proto::Types::V1::Repository)).void }
  def repository=(value); end

  sig { returns(T.nilable(GitHub::Spokes::Proto::Types::V1::RequestContext)) }
  def request_context; end

  sig { params(value: T.nilable(GitHub::Spokes::Proto::Types::V1::RequestContext)).void }
  def request_context=(value); end

  sig { returns(T.nilable(Symbol)) }
  def selector; end
end
