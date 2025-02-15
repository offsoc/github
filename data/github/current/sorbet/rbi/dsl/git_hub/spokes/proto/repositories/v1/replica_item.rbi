# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::Spokes::Proto::Repositories::V1::ReplicaItem`.
# Please instead update this file by running `bin/tapioca dsl GitHub::Spokes::Proto::Repositories::V1::ReplicaItem`.

class GitHub::Spokes::Proto::Repositories::V1::ReplicaItem
  sig do
    params(
      absolute_path: T.nilable(String),
      host_name: T.nilable(String),
      ip: T.nilable(String),
      route_type: T.nilable(T.any(Symbol, Integer))
    ).void
  end
  def initialize(absolute_path: nil, host_name: nil, ip: nil, route_type: nil); end

  sig { returns(String) }
  def absolute_path; end

  sig { params(value: String).void }
  def absolute_path=(value); end

  sig { void }
  def clear_absolute_path; end

  sig { void }
  def clear_host_name; end

  sig { void }
  def clear_ip; end

  sig { void }
  def clear_route_type; end

  sig { returns(String) }
  def host_name; end

  sig { params(value: String).void }
  def host_name=(value); end

  sig { returns(String) }
  def ip; end

  sig { params(value: String).void }
  def ip=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def route_type; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def route_type=(value); end
end
