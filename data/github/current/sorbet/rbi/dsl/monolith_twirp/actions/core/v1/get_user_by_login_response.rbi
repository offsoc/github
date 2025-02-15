# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MonolithTwirp::Actions::Core::V1::GetUserByLoginResponse`.
# Please instead update this file by running `bin/tapioca dsl MonolithTwirp::Actions::Core::V1::GetUserByLoginResponse`.

class MonolithTwirp::Actions::Core::V1::GetUserByLoginResponse
  sig { params(global_id: T.nilable(MonolithTwirp::Actions::Core::V1::Identity), id: T.nilable(Integer)).void }
  def initialize(global_id: nil, id: nil); end

  sig { void }
  def clear_global_id; end

  sig { void }
  def clear_id; end

  sig { returns(T.nilable(MonolithTwirp::Actions::Core::V1::Identity)) }
  def global_id; end

  sig { params(value: T.nilable(MonolithTwirp::Actions::Core::V1::Identity)).void }
  def global_id=(value); end

  sig { returns(Integer) }
  def id; end

  sig { params(value: Integer).void }
  def id=(value); end
end
