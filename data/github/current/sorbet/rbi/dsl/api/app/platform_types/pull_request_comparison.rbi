# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::PullRequestComparison`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::PullRequestComparison`.

class Api::App::PlatformTypes::PullRequestComparison < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(T.nilable(Api::App::PlatformTypes::CheckAnnotationConnection)) }
  def annotations; end

  sig { returns(T::Boolean) }
  def annotations?; end

  sig { returns(Api::App::PlatformTypes::PullRequestDiffEntryConnection) }
  def diff_entries; end

  sig { returns(T::Boolean) }
  def diff_entries?; end

  sig { returns(Api::App::PlatformTypes::PullRequestDiffEntry) }
  def diff_entry; end

  sig { returns(T::Boolean) }
  def diff_entry?; end

  sig { returns(Integer) }
  def files_changed; end

  sig { returns(T::Boolean) }
  def files_changed?; end

  sig { returns(Integer) }
  def lines_added; end

  sig { returns(T::Boolean) }
  def lines_added?; end

  sig { returns(Integer) }
  def lines_changed; end

  sig { returns(T::Boolean) }
  def lines_changed?; end

  sig { returns(Integer) }
  def lines_deleted; end

  sig { returns(T::Boolean) }
  def lines_deleted?; end

  sig { returns(Api::App::PlatformTypes::Commit) }
  def new_commit; end

  sig { returns(T::Boolean) }
  def new_commit?; end

  sig { returns(Api::App::PlatformTypes::Commit) }
  def old_commit; end

  sig { returns(T::Boolean) }
  def old_commit?; end

  sig { returns(T.nilable(T::Array[Api::App::PlatformTypes::PullRequestSummaryDelta])) }
  def summary; end

  sig { returns(T::Boolean) }
  def summary?; end
end
