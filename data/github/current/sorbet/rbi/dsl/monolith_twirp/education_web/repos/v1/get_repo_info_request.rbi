# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MonolithTwirp::EducationWeb::Repos::V1::GetRepoInfoRequest`.
# Please instead update this file by running `bin/tapioca dsl MonolithTwirp::EducationWeb::Repos::V1::GetRepoInfoRequest`.

class MonolithTwirp::EducationWeb::Repos::V1::GetRepoInfoRequest
  sig { params(repo_ids: T.nilable(T.any(Google::Protobuf::RepeatedField[Integer], T::Array[Integer]))).void }
  def initialize(repo_ids: T.unsafe(nil)); end

  sig { void }
  def clear_repo_ids; end

  sig { returns(Google::Protobuf::RepeatedField[Integer]) }
  def repo_ids; end

  sig { params(value: Google::Protobuf::RepeatedField[Integer]).void }
  def repo_ids=(value); end
end
