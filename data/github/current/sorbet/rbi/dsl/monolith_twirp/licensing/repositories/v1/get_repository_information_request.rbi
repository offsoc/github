# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MonolithTwirp::Licensing::Repositories::V1::GetRepositoryInformationRequest`.
# Please instead update this file by running `bin/tapioca dsl MonolithTwirp::Licensing::Repositories::V1::GetRepositoryInformationRequest`.

class MonolithTwirp::Licensing::Repositories::V1::GetRepositoryInformationRequest
  sig { params(id: T.nilable(Integer), include_collaborators: T.nilable(T::Boolean)).void }
  def initialize(id: nil, include_collaborators: nil); end

  sig { void }
  def clear_id; end

  sig { void }
  def clear_include_collaborators; end

  sig { returns(Integer) }
  def id; end

  sig { params(value: Integer).void }
  def id=(value); end

  sig { returns(T::Boolean) }
  def include_collaborators; end

  sig { params(value: T::Boolean).void }
  def include_collaborators=(value); end
end
