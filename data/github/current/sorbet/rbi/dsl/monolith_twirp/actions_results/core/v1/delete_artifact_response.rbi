# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MonolithTwirp::ActionsResults::Core::V1::DeleteArtifactResponse`.
# Please instead update this file by running `bin/tapioca dsl MonolithTwirp::ActionsResults::Core::V1::DeleteArtifactResponse`.

class MonolithTwirp::ActionsResults::Core::V1::DeleteArtifactResponse
  sig { params(ok: T.nilable(T::Boolean)).void }
  def initialize(ok: nil); end

  sig { void }
  def clear_ok; end

  sig { returns(T::Boolean) }
  def ok; end

  sig { params(value: T::Boolean).void }
  def ok=(value); end
end
