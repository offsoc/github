# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MonolithTwirp::Octoshift::Imports::V1::ImportMigrationLogRequest`.
# Please instead update this file by running `bin/tapioca dsl MonolithTwirp::Octoshift::Imports::V1::ImportMigrationLogRequest`.

class MonolithTwirp::Octoshift::Imports::V1::ImportMigrationLogRequest
  sig do
    params(
      log_data: T.nilable(String),
      migration_id: T.nilable(String),
      owner_login: T.nilable(String),
      repository_id: T.nilable(Integer),
      repository_name: T.nilable(String)
    ).void
  end
  def initialize(log_data: nil, migration_id: nil, owner_login: nil, repository_id: nil, repository_name: nil); end

  sig { void }
  def clear_log_data; end

  sig { void }
  def clear_migration_id; end

  sig { void }
  def clear_owner_login; end

  sig { void }
  def clear_repository_id; end

  sig { void }
  def clear_repository_name; end

  sig { returns(String) }
  def log_data; end

  sig { params(value: String).void }
  def log_data=(value); end

  sig { returns(String) }
  def migration_id; end

  sig { params(value: String).void }
  def migration_id=(value); end

  sig { returns(String) }
  def owner_login; end

  sig { params(value: String).void }
  def owner_login=(value); end

  sig { returns(Integer) }
  def repository_id; end

  sig { params(value: Integer).void }
  def repository_id=(value); end

  sig { returns(String) }
  def repository_name; end

  sig { params(value: String).void }
  def repository_name=(value); end
end
