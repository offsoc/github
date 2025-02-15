# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::SearchShortcutQueryProjectTerm`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::SearchShortcutQueryProjectTerm`.

class PlatformTypes::SearchShortcutQueryProjectTerm < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(String) }
  def name; end

  sig { returns(T::Boolean) }
  def name?; end

  sig { returns(T::Boolean) }
  def negative; end

  sig { returns(T::Boolean) }
  def negative?; end

  sig { returns(T.nilable(PlatformTypes::Project)) }
  def project; end

  sig { returns(T::Boolean) }
  def project?; end

  sig { returns(String) }
  def term; end

  sig { returns(T::Boolean) }
  def term?; end

  sig { returns(String) }
  def value; end

  sig { returns(T::Boolean) }
  def value?; end
end
