# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::V1::SearchRateLimit`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::V1::SearchRateLimit`.

class Hydro::Schemas::Github::V1::SearchRateLimit
  sig do
    params(
      actor: T.nilable(Hydro::Schemas::Github::V1::Entities::User),
      context: T.nilable(T.any(Symbol, Integer)),
      halted: T.nilable(T::Boolean),
      limit: T.nilable(Integer),
      rate_limiter: T.nilable(String),
      request_context: T.nilable(Hydro::Schemas::Github::V1::Entities::RequestContext),
      search_type: T.nilable(String),
      strategy: T.nilable(T.any(Symbol, Integer)),
      ttl_secs: T.nilable(Integer)
    ).void
  end
  def initialize(actor: nil, context: nil, halted: nil, limit: nil, rate_limiter: nil, request_context: nil, search_type: nil, strategy: nil, ttl_secs: nil); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::User)) }
  def actor; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::User)).void }
  def actor=(value); end

  sig { void }
  def clear_actor; end

  sig { void }
  def clear_context; end

  sig { void }
  def clear_halted; end

  sig { void }
  def clear_limit; end

  sig { void }
  def clear_rate_limiter; end

  sig { void }
  def clear_request_context; end

  sig { void }
  def clear_search_type; end

  sig { void }
  def clear_strategy; end

  sig { void }
  def clear_ttl_secs; end

  sig { returns(T.any(Symbol, Integer)) }
  def context; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def context=(value); end

  sig { returns(T::Boolean) }
  def halted; end

  sig { params(value: T::Boolean).void }
  def halted=(value); end

  sig { returns(Integer) }
  def limit; end

  sig { params(value: Integer).void }
  def limit=(value); end

  sig { returns(String) }
  def rate_limiter; end

  sig { params(value: String).void }
  def rate_limiter=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::RequestContext)) }
  def request_context; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::RequestContext)).void }
  def request_context=(value); end

  sig { returns(String) }
  def search_type; end

  sig { params(value: String).void }
  def search_type=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def strategy; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def strategy=(value); end

  sig { returns(Integer) }
  def ttl_secs; end

  sig { params(value: Integer).void }
  def ttl_secs=(value); end
end
