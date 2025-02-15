# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MonolithTwirp::Actions::Core::V1::DynamicWorkflow`.
# Please instead update this file by running `bin/tapioca dsl MonolithTwirp::Actions::Core::V1::DynamicWorkflow`.

class MonolithTwirp::Actions::Core::V1::DynamicWorkflow
  sig do
    params(
      inputs: T.nilable(T.any(Google::Protobuf::Map[String, String], T::Hash[String, String])),
      integration_name: T.nilable(String),
      ref: T.nilable(String),
      slug: T.nilable(String),
      workflow_name: T.nilable(String)
    ).void
  end
  def initialize(inputs: T.unsafe(nil), integration_name: nil, ref: nil, slug: nil, workflow_name: nil); end

  sig { void }
  def clear_inputs; end

  sig { void }
  def clear_integration_name; end

  sig { void }
  def clear_ref; end

  sig { void }
  def clear_slug; end

  sig { void }
  def clear_workflow_name; end

  sig { returns(Google::Protobuf::Map[String, String]) }
  def inputs; end

  sig { params(value: Google::Protobuf::Map[String, String]).void }
  def inputs=(value); end

  sig { returns(String) }
  def integration_name; end

  sig { params(value: String).void }
  def integration_name=(value); end

  sig { returns(String) }
  def ref; end

  sig { params(value: String).void }
  def ref=(value); end

  sig { returns(String) }
  def slug; end

  sig { params(value: String).void }
  def slug=(value); end

  sig { returns(String) }
  def workflow_name; end

  sig { params(value: String).void }
  def workflow_name=(value); end
end
