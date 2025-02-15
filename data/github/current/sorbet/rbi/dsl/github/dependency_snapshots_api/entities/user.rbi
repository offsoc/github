# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Github::DependencySnapshotsApi::Entities::User`.
# Please instead update this file by running `bin/tapioca dsl Github::DependencySnapshotsApi::Entities::User`.

class Github::DependencySnapshotsApi::Entities::User
  sig do
    params(
      display_login: T.nilable(String),
      id: T.nilable(Integer),
      login: T.nilable(String),
      type: T.nilable(T.any(Symbol, Integer))
    ).void
  end
  def initialize(display_login: nil, id: nil, login: nil, type: nil); end

  sig { void }
  def clear_display_login; end

  sig { void }
  def clear_id; end

  sig { void }
  def clear_login; end

  sig { void }
  def clear_type; end

  sig { returns(String) }
  def display_login; end

  sig { params(value: String).void }
  def display_login=(value); end

  sig { returns(Integer) }
  def id; end

  sig { params(value: Integer).void }
  def id=(value); end

  sig { returns(String) }
  def login; end

  sig { params(value: String).void }
  def login=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def type; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def type=(value); end
end
