# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::Launch::Services::Credz::Visibility`.
# Please instead update this file by running `bin/tapioca dsl GitHub::Launch::Services::Credz::Visibility`.

module GitHub::Launch::Services::Credz::Visibility
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

GitHub::Launch::Services::Credz::Visibility::VISIBILITY_ALL_REPOSITORIES = 1
GitHub::Launch::Services::Credz::Visibility::VISIBILITY_OWNER = 0
GitHub::Launch::Services::Credz::Visibility::VISIBILITY_PRIVATE_REPOSITORIES = 2
GitHub::Launch::Services::Credz::Visibility::VISIBILITY_SELECTED_REPOSITORIES = 3
