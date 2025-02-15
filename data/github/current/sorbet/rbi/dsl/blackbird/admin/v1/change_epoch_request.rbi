# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Blackbird::Admin::V1::ChangeEpochRequest`.
# Please instead update this file by running `bin/tapioca dsl Blackbird::Admin::V1::ChangeEpochRequest`.

class Blackbird::Admin::V1::ChangeEpochRequest
  sig { params(cluster: T.nilable(String), epoch_id: T.nilable(Integer)).void }
  def initialize(cluster: nil, epoch_id: nil); end

  sig { void }
  def clear_cluster; end

  sig { void }
  def clear_epoch_id; end

  sig { returns(String) }
  def cluster; end

  sig { params(value: String).void }
  def cluster=(value); end

  sig { returns(Integer) }
  def epoch_id; end

  sig { params(value: Integer).void }
  def epoch_id=(value); end
end
