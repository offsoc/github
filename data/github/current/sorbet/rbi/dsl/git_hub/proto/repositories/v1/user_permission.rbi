# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::Proto::Repositories::V1::UserPermission`.
# Please instead update this file by running `bin/tapioca dsl GitHub::Proto::Repositories::V1::UserPermission`.

module GitHub::Proto::Repositories::V1::UserPermission
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

GitHub::Proto::Repositories::V1::UserPermission::USER_PERMISSION_ADMIN = 1
GitHub::Proto::Repositories::V1::UserPermission::USER_PERMISSION_INVALID = 0
GitHub::Proto::Repositories::V1::UserPermission::USER_PERMISSION_NO_ACCESS = 3
GitHub::Proto::Repositories::V1::UserPermission::USER_PERMISSION_READ = 4
GitHub::Proto::Repositories::V1::UserPermission::USER_PERMISSION_WRITE = 2
