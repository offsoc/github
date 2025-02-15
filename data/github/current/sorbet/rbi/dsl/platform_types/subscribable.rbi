# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::Subscribable`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::Subscribable`.

class PlatformTypes::Subscribable < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(T.any(String, Integer)) }
  def id; end

  sig { returns(T::Boolean) }
  def id?; end

  sig { returns(T::Boolean) }
  def viewer_can_subscribe; end

  sig { returns(T::Boolean) }
  def viewer_can_subscribe?; end

  sig { returns(T::Boolean) }
  def viewer_can_unsubscribe; end

  sig { returns(T::Boolean) }
  def viewer_can_unsubscribe?; end

  sig { returns(T.nilable(String)) }
  def viewer_subscription; end

  sig { returns(T::Boolean) }
  def viewer_subscription?; end
end
