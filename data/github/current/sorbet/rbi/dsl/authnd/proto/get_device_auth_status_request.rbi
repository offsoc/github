# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Authnd::Proto::GetDeviceAuthStatusRequest`.
# Please instead update this file by running `bin/tapioca dsl Authnd::Proto::GetDeviceAuthStatusRequest`.

class Authnd::Proto::GetDeviceAuthStatusRequest
  sig { params(id: T.nilable(Integer), user_id: T.nilable(Integer)).void }
  def initialize(id: nil, user_id: nil); end

  sig { void }
  def clear_id; end

  sig { void }
  def clear_user_id; end

  sig { returns(Integer) }
  def id; end

  sig { params(value: Integer).void }
  def id=(value); end

  sig { returns(Integer) }
  def user_id; end

  sig { params(value: Integer).void }
  def user_id=(value); end
end
