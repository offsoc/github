# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MonolithTwirp::Billing::Repositories::V1::GetRepositoryMetadataRequest`.
# Please instead update this file by running `bin/tapioca dsl MonolithTwirp::Billing::Repositories::V1::GetRepositoryMetadataRequest`.

class MonolithTwirp::Billing::Repositories::V1::GetRepositoryMetadataRequest
  sig { params(id: T.nilable(Integer)).void }
  def initialize(id: nil); end

  sig { void }
  def clear_id; end

  sig { returns(Integer) }
  def id; end

  sig { params(value: Integer).void }
  def id=(value); end
end
