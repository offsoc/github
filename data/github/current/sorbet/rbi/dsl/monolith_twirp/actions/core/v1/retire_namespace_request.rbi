# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MonolithTwirp::Actions::Core::V1::RetireNamespaceRequest`.
# Please instead update this file by running `bin/tapioca dsl MonolithTwirp::Actions::Core::V1::RetireNamespaceRequest`.

class MonolithTwirp::Actions::Core::V1::RetireNamespaceRequest
  sig { params(nwo: T.nilable(String)).void }
  def initialize(nwo: nil); end

  sig { void }
  def clear_nwo; end

  sig { returns(String) }
  def nwo; end

  sig { params(value: String).void }
  def nwo=(value); end
end
