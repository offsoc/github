# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MonolithTwirp::ActionsResults::Core::V1::DeleteArtifactFromMonolithResponse`.
# Please instead update this file by running `bin/tapioca dsl MonolithTwirp::ActionsResults::Core::V1::DeleteArtifactFromMonolithResponse`.

class MonolithTwirp::ActionsResults::Core::V1::DeleteArtifactFromMonolithResponse
  sig { params(artifact_id: T.nilable(Integer), ok: T.nilable(T::Boolean)).void }
  def initialize(artifact_id: nil, ok: nil); end

  sig { returns(Integer) }
  def artifact_id; end

  sig { params(value: Integer).void }
  def artifact_id=(value); end

  sig { void }
  def clear_artifact_id; end

  sig { void }
  def clear_ok; end

  sig { returns(T::Boolean) }
  def ok; end

  sig { params(value: T::Boolean).void }
  def ok=(value); end
end
