# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MonolithTwirp::Registrymetadata::Core::V1::BillableNamespacesRequest`.
# Please instead update this file by running `bin/tapioca dsl MonolithTwirp::Registrymetadata::Core::V1::BillableNamespacesRequest`.

class MonolithTwirp::Registrymetadata::Core::V1::BillableNamespacesRequest
  sig { params(namespace: T.nilable(String)).void }
  def initialize(namespace: nil); end

  sig { void }
  def clear_namespace; end

  sig { returns(String) }
  def namespace; end

  sig { params(value: String).void }
  def namespace=(value); end
end
