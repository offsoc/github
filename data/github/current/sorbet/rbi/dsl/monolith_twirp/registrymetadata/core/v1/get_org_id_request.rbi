# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MonolithTwirp::Registrymetadata::Core::V1::GetOrgIdRequest`.
# Please instead update this file by running `bin/tapioca dsl MonolithTwirp::Registrymetadata::Core::V1::GetOrgIdRequest`.

class MonolithTwirp::Registrymetadata::Core::V1::GetOrgIdRequest
  sig { params(name: T.nilable(String)).void }
  def initialize(name: nil); end

  sig { void }
  def clear_name; end

  sig { returns(String) }
  def name; end

  sig { params(value: String).void }
  def name=(value); end
end
