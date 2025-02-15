# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MonolithTwirp::Octoshift::Imports::V1::MilestoneMapping`.
# Please instead update this file by running `bin/tapioca dsl MonolithTwirp::Octoshift::Imports::V1::MilestoneMapping`.

class MonolithTwirp::Octoshift::Imports::V1::MilestoneMapping
  sig { params(id: T.nilable(Integer), source_id: T.nilable(Integer)).void }
  def initialize(id: nil, source_id: nil); end

  sig { void }
  def clear_id; end

  sig { void }
  def clear_source_id; end

  sig { returns(Integer) }
  def id; end

  sig { params(value: Integer).void }
  def id=(value); end

  sig { returns(Integer) }
  def source_id; end

  sig { params(value: Integer).void }
  def source_id=(value); end
end
