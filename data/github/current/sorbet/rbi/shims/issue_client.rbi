# typed: true
# frozen_string_literal: true

# This file is a typed shim for the Issues Graph client, so we can perform parameter-level typechecking
# and ensure no `nil` values are being passed to the API.
#
# Eventually we'll upstream this to the `github/issues-graph` repository but for now this will address
# some availabilty-related work.

class IssuesGraph::Client
  sig { params(conn: T.untyped, hmac_key: String, options: T::Hash[Symbol, T.untyped]).void }
  def initialize(conn, hmac_key, options = {}); end

  ########################################################################
  # main api
  ########################################################################

  sig {
    params(
      issue: T::Hash[Symbol, T.untyped],
      log_tags: T::Array[String],
      stat_tags: T::Array[String],
    ).void
  }
  def update_issue(issue:, log_tags: [], stat_tags: []); end

  sig {
    params(
      from: T::Hash[Symbol, T.untyped],
      to: T::Hash[Symbol, T.untyped],
      log_tags: T::Array[String],
      stat_tags: T::Array[String],
    ).void
  }
  def delete_issue_from_tracking_block(from:, to:, log_tags: [], stat_tags: []); end

  sig {
    params(
      from: T::Hash[Symbol, T.untyped],
      to: T::Hash[Symbol, T.untyped],
      log_tags: T::Array[String],
      stat_tags: T::Array[String],
    ).void
  }
  def delete_tracking_block_from_issue(from:, to:, log_tags: [], stat_tags: []); end

  sig {
    params(
      key: T.any(T::Hash[Symbol, T.untyped], Class),
      use_denormalized_data: T::Boolean,
      actor_id: T.nilable(Integer),
      log_tags: T::Array[String],
      stat_tags: T::Array[String],
    ).returns(T.untyped)
  }
  def get_issue(key:, use_denormalized_data: true, actor_id: actor_id_from_context, log_tags: [], stat_tags: []); end

  ########################################################################
  # tracking blocks
  ########################################################################

  sig {
    params(
      parent: T::Hash[Symbol, T.untyped],
      tracking_blocks: T::Array[T::Hash[Symbol, T.untyped]],
      log_tags: T::Array[String],
      stat_tags: T::Array[String],
    ).returns(T.untyped)
  }
  def add_tracking_block_for_parent(parent, tracking_blocks, log_tags: [], stat_tags: []); end

  sig {
    params(
      block_key: IssuesGraph::Proto::Key,
      issues_to_add: T::Array[T::Hash[Symbol, T.untyped]],
      issues_to_remove: T::Array[T::Hash[Symbol, T.untyped]],
      log_tags: T::Array[String],
      stat_tags: T::Array[String]
    ).returns(T.untyped)
  }
  def update_tracking_block_by_key(block_key, issues_to_add, issues_to_remove, log_tags: [], stat_tags: []); end

  sig {
    params(
      block_key: IssuesGraph::Proto::Key,
      issues_to_update: T::Array[T::Hash[Symbol, T.untyped]],
      log_tags: T::Array[String],
       stat_tags: T::Array[String]
    ).returns(T.untyped)
  }
  def update_tracking_block_in_place_by_key(block_key, issues_to_update, log_tags: [], stat_tags: []); end

  sig {
    params(
      owner_id: T.any(Integer, String),
      item_id: T.any(Integer, String),
      log_tags: T::Array[String],
      stat_tags: T::Array[String],
    ).returns(T.untyped)
  }
  def get_tracking_blocks_by_parent(owner_id, item_id, log_tags: [], stat_tags: []); end

  sig {
    params(
      owner_id: T.any(Integer, String),
      item_id: T.any(Integer, String),
      tracking_block_id: T.any(Integer, String),
      log_tags: T::Array[String],
      stat_tags: T::Array[String],
    ).returns(T.untyped)
  }
  def remove_tracking_block(owner_id, item_id, tracking_block_id, log_tags: [], stat_tags: []); end

  sig {
    params(
      parent: T::Hash[Symbol, T.untyped],
      tracking_blocks: T::Array[T::Hash[Symbol, T.untyped]],
      actor_id: T.nilable(Integer),
      log_tags: T::Array[String],
      stat_tags: T::Array[String],
    ).void
  }
  def replace_tracking_blocks_for_parent(parent, tracking_blocks, actor_id: actor_id_from_context, log_tags: [], stat_tags: []); end

  ########################################################################
  # projects
  ########################################################################

  sig {
    params(
      from: T::Hash[Symbol, T.untyped],
      to: T::Array[T::Hash[Symbol, T.untyped]],
      user: T::Hash[Symbol, T.untyped],
      log_tags: T::Array[String],
      stat_tags: T::Array[String]
    ).void
  }
  def upsert_project_and_relationships(from:, to:, user: nil, log_tags: [], stat_tags: []); end

  sig {
    params(
      owner_id: T.any(Integer, String),
      item_id: T.any(Integer, String),
      actor_id: T.nilable(Integer),
      log_tags: T::Array[String],
      stat_tags: T::Array[String],
      opts: T::Array[T.untyped],
    ).returns(T.untyped)
  }
  def get_project_item_completions(owner_id:, item_id:, actor_id: actor_id_from_context, log_tags: [], stat_tags: [], **opts); end

  sig {
    params(
      from: T::Hash[Symbol, T.untyped],
      to: T::Hash[Symbol, T.untyped],
      log_tags: T::Array[String],
      stat_tags: T::Array[String],
    ).void
  }
  def delete_issue_from_project(from:, to:, log_tags: [], stat_tags: []); end

  sig {
    params(
      owner_id: T.any(Integer, String),
      item_id: T.any(Integer, String),
      actor_id: T.nilable(Integer),
      log_tags: T::Array[String],
      stat_tags: T::Array[String],
      opts: T::Array[T.untyped],
    ).returns(T.untyped)
  }
  def get_project_tracked_by_items(owner_id:, item_id:, actor_id: actor_id_from_context, log_tags: [], stat_tags: [], **opts); end
end
