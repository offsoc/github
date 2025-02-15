# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MonolithTwirp::Copilotapi::Chat::V1::CompareTreesResponse`.
# Please instead update this file by running `bin/tapioca dsl MonolithTwirp::Copilotapi::Chat::V1::CompareTreesResponse`.

class MonolithTwirp::Copilotapi::Chat::V1::CompareTreesResponse
  sig do
    params(
      diff_hunks: T.nilable(T.any(Google::Protobuf::RepeatedField[MonolithTwirp::Copilotapi::Chat::V1::DiffHunk], T::Array[MonolithTwirp::Copilotapi::Chat::V1::DiffHunk]))
    ).void
  end
  def initialize(diff_hunks: T.unsafe(nil)); end

  sig { void }
  def clear_diff_hunks; end

  sig { returns(Google::Protobuf::RepeatedField[MonolithTwirp::Copilotapi::Chat::V1::DiffHunk]) }
  def diff_hunks; end

  sig { params(value: Google::Protobuf::RepeatedField[MonolithTwirp::Copilotapi::Chat::V1::DiffHunk]).void }
  def diff_hunks=(value); end
end
