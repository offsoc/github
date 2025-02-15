# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::IssuePubSubTopic`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::IssuePubSubTopic`.

module PlatformTypes::IssuePubSubTopic
  sig { returns(T::Boolean) }
  def close_references?; end

  sig { returns(T::Boolean) }
  def state?; end

  sig { returns(T::Boolean) }
  def timeline?; end

  sig { returns(T::Boolean) }
  def updated?; end

  CLOSE_REFERENCES = T.let("CLOSE_REFERENCES", String)
  STATE = T.let("STATE", String)
  TIMELINE = T.let("TIMELINE", String)
  UPDATED = T.let("UPDATED", String)
end
