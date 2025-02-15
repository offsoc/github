# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MonolithTwirp::Insights::Core::V1::GetOrgInternalRepositoriesResponse`.
# Please instead update this file by running `bin/tapioca dsl MonolithTwirp::Insights::Core::V1::GetOrgInternalRepositoriesResponse`.

class MonolithTwirp::Insights::Core::V1::GetOrgInternalRepositoriesResponse
  sig do
    params(
      data: T.nilable(T.any(Google::Protobuf::RepeatedField[MonolithTwirp::Insights::Core::V1::InternalRepository], T::Array[MonolithTwirp::Insights::Core::V1::InternalRepository])),
      next_cursor: T.nilable(Integer)
    ).void
  end
  def initialize(data: T.unsafe(nil), next_cursor: nil); end

  sig { void }
  def clear_data; end

  sig { void }
  def clear_next_cursor; end

  sig { returns(Google::Protobuf::RepeatedField[MonolithTwirp::Insights::Core::V1::InternalRepository]) }
  def data; end

  sig { params(value: Google::Protobuf::RepeatedField[MonolithTwirp::Insights::Core::V1::InternalRepository]).void }
  def data=(value); end

  sig { returns(Integer) }
  def next_cursor; end

  sig { params(value: Integer).void }
  def next_cursor=(value); end
end
