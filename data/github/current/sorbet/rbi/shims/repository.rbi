# frozen_string_literal: true
# typed: true

  # Methods in this class overrides the automatic generated ones
  # in sorbet/rbi/dsl/repository.rbi. It can help adjust the signature
  # for columns that has a default value in the database since sorbet
  # isn't migration aware.
class Repository

  # This column has a default value of 0
  # and it doesn't return nil.
  sig { returns(::Integer) }
  def disk_usage; end

  # Defined via Spam::Spammable#setup_spammable
  sig { returns(T::Boolean) }
  def spammy?; end

  # Renamed column from watcher_count to stargazer_count
  sig { returns(T.nilable(::Integer)) }
  def stargazer_count; end
end
