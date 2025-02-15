# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Blackbird::Query::V1::WarmCachesRequest`.
# Please instead update this file by running `bin/tapioca dsl Blackbird::Query::V1::WarmCachesRequest`.

class Blackbird::Query::V1::WarmCachesRequest
  sig { params(actor: T.nilable(Blackbird::Query::V1::Actor)).void }
  def initialize(actor: nil); end

  sig { returns(T.nilable(Blackbird::Query::V1::Actor)) }
  def actor; end

  sig { params(value: T.nilable(Blackbird::Query::V1::Actor)).void }
  def actor=(value); end

  sig { void }
  def clear_actor; end
end
