# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::TrackedDraftItem`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::TrackedDraftItem`.

class PlatformTypes::TrackedDraftItem < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(T::Boolean) }
  def closed; end

  sig { returns(T::Boolean) }
  def closed?; end

  sig { returns(T.any(String, Integer)) }
  def owner_id; end

  sig { returns(T::Boolean) }
  def owner_id?; end

  sig { returns(Integer) }
  def position; end

  sig { returns(T::Boolean) }
  def position?; end

  sig { returns(String) }
  def title; end

  sig { returns(T::Boolean) }
  def title?; end

  sig { returns(String) }
  def title_html; end

  sig { returns(T::Boolean) }
  def title_html?; end

  sig { returns(T.any(String, Integer)) }
  def uuid; end

  sig { returns(T::Boolean) }
  def uuid?; end
end
