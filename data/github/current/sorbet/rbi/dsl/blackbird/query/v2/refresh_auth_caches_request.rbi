# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Blackbird::Query::V2::RefreshAuthCachesRequest`.
# Please instead update this file by running `bin/tapioca dsl Blackbird::Query::V2::RefreshAuthCachesRequest`.

class Blackbird::Query::V2::RefreshAuthCachesRequest
  sig { params(actor: T.nilable(Blackbird::Query::V2::Actor)).void }
  def initialize(actor: nil); end

  sig { returns(T.nilable(Blackbird::Query::V2::Actor)) }
  def actor; end

  sig { params(value: T.nilable(Blackbird::Query::V2::Actor)).void }
  def actor=(value); end

  sig { void }
  def clear_actor; end
end
