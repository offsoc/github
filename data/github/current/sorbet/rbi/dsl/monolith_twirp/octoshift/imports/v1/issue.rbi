# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MonolithTwirp::Octoshift::Imports::V1::Issue`.
# Please instead update this file by running `bin/tapioca dsl MonolithTwirp::Octoshift::Imports::V1::Issue`.

class MonolithTwirp::Octoshift::Imports::V1::Issue
  sig { params(id: T.nilable(Integer), number: T.nilable(Integer)).void }
  def initialize(id: nil, number: nil); end

  sig { void }
  def clear_id; end

  sig { void }
  def clear_number; end

  sig { returns(Integer) }
  def id; end

  sig { params(value: Integer).void }
  def id=(value); end

  sig { returns(Integer) }
  def number; end

  sig { params(value: Integer).void }
  def number=(value); end
end
