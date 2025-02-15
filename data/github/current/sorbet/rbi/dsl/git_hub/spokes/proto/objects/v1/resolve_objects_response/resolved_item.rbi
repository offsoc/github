# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::Spokes::Proto::Objects::V1::ResolveObjectsResponse::ResolvedItem`.
# Please instead update this file by running `bin/tapioca dsl GitHub::Spokes::Proto::Objects::V1::ResolveObjectsResponse::ResolvedItem`.

class GitHub::Spokes::Proto::Objects::V1::ResolveObjectsResponse::ResolvedItem
  sig { params(error: T.nilable(String), object: T.nilable(GitHub::Spokes::Proto::Types::V1::Object)).void }
  def initialize(error: nil, object: nil); end

  sig { void }
  def clear_error; end

  sig { void }
  def clear_object; end

  sig { returns(String) }
  def error; end

  sig { params(value: String).void }
  def error=(value); end

  sig { returns(T.nilable(Symbol)) }
  def item; end

  sig { returns(T.nilable(GitHub::Spokes::Proto::Types::V1::Object)) }
  def object; end

  sig { params(value: T.nilable(GitHub::Spokes::Proto::Types::V1::Object)).void }
  def object=(value); end
end
