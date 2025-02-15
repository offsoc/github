# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MonolithTwirp::Actions::Core::V1::GetRepositoryEventDetailsRequest`.
# Please instead update this file by running `bin/tapioca dsl MonolithTwirp::Actions::Core::V1::GetRepositoryEventDetailsRequest`.

class MonolithTwirp::Actions::Core::V1::GetRepositoryEventDetailsRequest
  sig { params(repository_id: T.nilable(Integer)).void }
  def initialize(repository_id: nil); end

  sig { void }
  def clear_repository_id; end

  sig { returns(Integer) }
  def repository_id; end

  sig { params(value: Integer).void }
  def repository_id=(value); end
end
