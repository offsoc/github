# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::MergeQueue::V1::Entities::MergeQueue`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::MergeQueue::V1::Entities::MergeQueue`.

class Hydro::Schemas::Github::MergeQueue::V1::Entities::MergeQueue
  sig do
    params(
      branch: T.nilable(String),
      check_response_timeout: T.nilable(Google::Protobuf::Duration),
      created_at: T.nilable(Google::Protobuf::Timestamp),
      current_merge_group_id: T.nilable(Integer),
      id: T.nilable(Integer),
      max_entries_to_build: T.nilable(Integer),
      max_entries_to_merge: T.nilable(Integer),
      merge_method: T.nilable(T.any(Symbol, Integer)),
      merging_strategy: T.nilable(T.any(Symbol, Integer)),
      min_entries_to_merge: T.nilable(Integer),
      min_entries_to_merge_wait: T.nilable(Google::Protobuf::Duration),
      updated_at: T.nilable(Google::Protobuf::Timestamp)
    ).void
  end
  def initialize(branch: nil, check_response_timeout: nil, created_at: nil, current_merge_group_id: nil, id: nil, max_entries_to_build: nil, max_entries_to_merge: nil, merge_method: nil, merging_strategy: nil, min_entries_to_merge: nil, min_entries_to_merge_wait: nil, updated_at: nil); end

  sig { returns(String) }
  def branch; end

  sig { params(value: String).void }
  def branch=(value); end

  sig { returns(T.nilable(Google::Protobuf::Duration)) }
  def check_response_timeout; end

  sig { params(value: T.nilable(Google::Protobuf::Duration)).void }
  def check_response_timeout=(value); end

  sig { void }
  def clear_branch; end

  sig { void }
  def clear_check_response_timeout; end

  sig { void }
  def clear_created_at; end

  sig { void }
  def clear_current_merge_group_id; end

  sig { void }
  def clear_id; end

  sig { void }
  def clear_max_entries_to_build; end

  sig { void }
  def clear_max_entries_to_merge; end

  sig { void }
  def clear_merge_method; end

  sig { void }
  def clear_merging_strategy; end

  sig { void }
  def clear_min_entries_to_merge; end

  sig { void }
  def clear_min_entries_to_merge_wait; end

  sig { void }
  def clear_updated_at; end

  sig { returns(T.nilable(Google::Protobuf::Timestamp)) }
  def created_at; end

  sig { params(value: T.nilable(Google::Protobuf::Timestamp)).void }
  def created_at=(value); end

  sig { returns(Integer) }
  def current_merge_group_id; end

  sig { params(value: Integer).void }
  def current_merge_group_id=(value); end

  sig { returns(Integer) }
  def id; end

  sig { params(value: Integer).void }
  def id=(value); end

  sig { returns(Integer) }
  def max_entries_to_build; end

  sig { params(value: Integer).void }
  def max_entries_to_build=(value); end

  sig { returns(Integer) }
  def max_entries_to_merge; end

  sig { params(value: Integer).void }
  def max_entries_to_merge=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def merge_method; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def merge_method=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def merging_strategy; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def merging_strategy=(value); end

  sig { returns(Integer) }
  def min_entries_to_merge; end

  sig { params(value: Integer).void }
  def min_entries_to_merge=(value); end

  sig { returns(T.nilable(Google::Protobuf::Duration)) }
  def min_entries_to_merge_wait; end

  sig { params(value: T.nilable(Google::Protobuf::Duration)).void }
  def min_entries_to_merge_wait=(value); end

  sig { returns(T.nilable(Google::Protobuf::Timestamp)) }
  def updated_at; end

  sig { params(value: T.nilable(Google::Protobuf::Timestamp)).void }
  def updated_at=(value); end
end
