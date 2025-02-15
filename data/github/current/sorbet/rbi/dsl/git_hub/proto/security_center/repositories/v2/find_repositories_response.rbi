# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::Proto::SecurityCenter::Repositories::V2::FindRepositoriesResponse`.
# Please instead update this file by running `bin/tapioca dsl GitHub::Proto::SecurityCenter::Repositories::V2::FindRepositoriesResponse`.

class GitHub::Proto::SecurityCenter::Repositories::V2::FindRepositoriesResponse
  sig do
    params(
      repositoriesById: T.nilable(T.any(Google::Protobuf::Map[Integer, GitHub::Proto::SecurityCenter::Repositories::V2::SecurityCenterRepository], T::Hash[Integer, GitHub::Proto::SecurityCenter::Repositories::V2::SecurityCenterRepository]))
    ).void
  end
  def initialize(repositoriesById: T.unsafe(nil)); end

  sig { void }
  def clear_repositoriesById; end

  sig do
    returns(Google::Protobuf::Map[Integer, GitHub::Proto::SecurityCenter::Repositories::V2::SecurityCenterRepository])
  end
  def repositoriesById; end

  sig do
    params(
      value: Google::Protobuf::Map[Integer, GitHub::Proto::SecurityCenter::Repositories::V2::SecurityCenterRepository]
    ).void
  end
  def repositoriesById=(value); end
end
