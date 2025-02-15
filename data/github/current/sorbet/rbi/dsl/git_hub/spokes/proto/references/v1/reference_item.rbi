# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::Spokes::Proto::References::V1::ReferenceItem`.
# Please instead update this file by running `bin/tapioca dsl GitHub::Spokes::Proto::References::V1::ReferenceItem`.

class GitHub::Spokes::Proto::References::V1::ReferenceItem
  sig do
    params(
      object: T.nilable(GitHub::Spokes::Proto::Types::V1::Object),
      reference: T.nilable(GitHub::Spokes::Proto::Types::V1::Reference)
    ).void
  end
  def initialize(object: nil, reference: nil); end

  sig { void }
  def clear_object; end

  sig { void }
  def clear_reference; end

  sig { returns(T.nilable(GitHub::Spokes::Proto::Types::V1::Object)) }
  def object; end

  sig { params(value: T.nilable(GitHub::Spokes::Proto::Types::V1::Object)).void }
  def object=(value); end

  sig { returns(T.nilable(GitHub::Spokes::Proto::Types::V1::Reference)) }
  def reference; end

  sig { params(value: T.nilable(GitHub::Spokes::Proto::Types::V1::Reference)).void }
  def reference=(value); end
end
