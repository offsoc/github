# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::NotificationStatus`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::NotificationStatus`.

module Api::App::PlatformTypes::NotificationStatus
  sig { returns(T::Boolean) }
  def archived?; end

  sig { returns(T::Boolean) }
  def done?; end

  sig { returns(T::Boolean) }
  def read?; end

  sig { returns(T::Boolean) }
  def unread?; end

  ARCHIVED = T.let("ARCHIVED", String)
  DONE = T.let("DONE", String)
  READ = T.let("READ", String)
  UNREAD = T.let("UNREAD", String)
end
