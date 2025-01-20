# frozen_string_literal: true

require_relative "../test_helper"
require_relative "../issues_graph_server_helper"

module IssuesGraph
  class ClientIntegrationTest < Minitest::Test
    include Minitest::Hooks

    MAX_NUMBER = 92_233_720_368
    SERVER_ADDR = "127.0.0.1:8989"
    TWIRP_ADDR = "http://#{SERVER_ADDR}/twirp/"

    ###############################################################################
    # Main Tests
    ###############################################################################

    def test_update_issue
      client = IssuesGraph::Client.new(TWIRP_ADDR, ENV.fetch("HMAC_KEY", nil))

      parent = get_issue(number: 1)
      to_update_issue = get_issue(number: 2)
      tracking_block = get_tracking_block(order: 1, name: "parent", issues: [to_update_issue])

      result_replace_blocks = client.replace_tracking_blocks_for_parent(parent, [tracking_block])
      assert_equal true, result_replace_blocks.success?

      get_parent = client.get_issue(key: parent.key)
      assert_equal false, get_parent.error?

      found_issue = get_parent.data.tracking[0].issues.find { |item| item.key.itemId == to_update_issue.key.itemId }

      assert found_issue

      response = client.update_issue(issue: found_issue)
      assert_equal true, response.success?
      assert_nil response.error
    end

    def test_get_issue
      client = IssuesGraph::Client.new(TWIRP_ADDR, ENV.fetch("HMAC_KEY", nil))

      parent = get_issue(number: 1)
      tracked_issue = get_issue(number: 2)
      tracking_block = get_tracking_block(order: 1, name: "parent", issues: [tracked_issue])
      parent.completion = get_completion(key: parent.key, tracking_blocks: [tracking_block])
      response = client.replace_tracking_blocks_for_parent(parent, [tracking_block])
      assert_nil response.error

      response = client.get_issue(key: parent.key)
      assert_nil response.error

      responseIssue = response.data.issue
      assert_equal parent.title, responseIssue.title
      assert_equal parent.key.itemId, responseIssue.key.itemId
      assert_equal parent.key.ownerId, responseIssue.key.ownerId

      assert_equal response.data.queryType, :DEFAULT
    end

    def test_get_issue_return_error_if_not_found
      client = IssuesGraph::Client.new(TWIRP_ADDR, ENV.fetch("HMAC_KEY", nil))

      issue = get_issue(number: 1)
      result_update = client.update_issue(issue: issue)
      assert_equal true, result_update.success?

      key = ::IssuesGraph::Proto::Key.new(
        ownerId: issue.key.ownerId,
        itemId: -1
      )
      result = client.get_issue(key: key)
      assert_equal false, result.success?
      assert_nil result.data

      assert_equal :not_found, result.error_code
    end

    def test_get_issue_with_disabled_denormalization
      client = IssuesGraph::Client.new(TWIRP_ADDR, ENV.fetch("HMAC_KEY", nil))

      parent = get_issue(number: 1)
      tracked_issue = get_issue(number: 2)
      tracking_block = get_tracking_block(order: 1, name: "parent", issues: [tracked_issue])
      parent.completion = get_completion(key: parent.key, tracking_blocks: [tracking_block])
      response = client.replace_tracking_blocks_for_parent(parent, [tracking_block])
      assert_nil response.error

      response = client.get_issue(key: parent.key, use_denormalized_data: false)
      assert_nil response.error

      responseIssue = response.data.issue
      assert_equal parent.title, responseIssue.title
      assert_equal parent.key.itemId, responseIssue.key.itemId
      assert_equal parent.key.ownerId, responseIssue.key.ownerId

      assert_equal response.data.queryType, :FORCE_GRAPH
      assert_equal response.data.responseSourceType, :GRAPH
    end

    def test_update_issue_handles_v1_key
      client = IssuesGraph::Client.new(TWIRP_ADDR, ENV.fetch("HMAC_KEY", nil))

      parent = get_issue(number: 1)
      to_update_issue = get_issue_as_hash(number: 2)
      tracking_block = get_tracking_block(order: 1, name: "parent", issues: [to_update_issue])
      response = client.replace_tracking_blocks_for_parent(parent, [tracking_block])
      assert_nil response.error

      response = client.get_issue(key: parent.key)
      assert_nil response.error

      found_issue = response.data.tracking[0].issues.find { |item| item.key.itemId == to_update_issue[:key][:itemId] }

      assert found_issue

      result = client.update_issue(issue: to_v1_hash(issue: found_issue))
      assert_nil result.error
      assert_equal false, result.error?
      assert_equal true, result.success?
    end

    # deprecated
    def test_upsert_issues_and_relationships
      client = IssuesGraph::Client.new(TWIRP_ADDR, ENV.fetch("HMAC_KEY", nil))

      from = get_issue(number: 1)
      to = get_issue(number: 2)

      result = client.upsert_issues_and_relationships(from: from, to: [to])
      assert_equal true, result.success?
    end

    def test_twirp_get_project_item_completions
      hmac_key = ENV.fetch("HMAC_KEY", nil)
      client = IssuesGraph::Client.new(TWIRP_ADDR, hmac_key)

      parent = get_issue(number: 1)
      issues = [get_issue(number: 2), get_issue(number: 3)]
      tracking_block = get_tracking_block(order: 1, name: "parent", issues: issues)
      response = client.replace_tracking_blocks_for_parent(parent, [tracking_block])
      assert_nil response.error

      project = get_project(number: 1)

      response = client.upsert_project_and_relationships(from: project, to: [parent])
      assert_equal false, response.error?

      response = client.get_project_item_completions(
        owner_id: project.key.ownerId,
        item_id: project.key.itemId
      )

      assert_equal 1, response.data.items.size

      completion_parent_issue = response.data.items.find { |item| item.key.itemId == parent.key.itemId }
      assert completion_parent_issue

      assert_equal 0, completion_parent_issue.completed
      assert_equal 2, completion_parent_issue.total
      assert_equal 0, completion_parent_issue.percent
    end

    def test_twirp_get_project_item_completions_options
      project_client = OpenStruct.new
      project_client.stubs(:get_project_item_completions)
      client = IssuesGraph::Client.new(TWIRP_ADDR, ENV.fetch("HMAC_KEY", nil))
      client.instance_variable_set(:@project_client, project_client)
      key = ::IssuesGraph::Proto::Key.new(ownerId: 123, itemId: 123)

      # default case
      ::IssuesGraph::Proto::GetProjectItemCompletionsRequest
        .expects(:new)
        .with({ key: key, queryType: ::IssuesGraph::Proto::QueryType::DEFAULT, actorId: 456 })

      response = client.get_project_item_completions(
        owner_id: 123,
        item_id: 123,
        actor_id: 456
      )

      # force graph
      ::IssuesGraph::Proto::GetProjectItemCompletionsRequest
        .expects(:new)
        .with({ key: key, queryType: ::IssuesGraph::Proto::QueryType::FORCE_GRAPH, actorId: 456 })

      response = client.get_project_item_completions(
        owner_id: 123,
        item_id: 123,
        force_graph: true,
        actor_id: 456
      )

      # force denormalized
      ::IssuesGraph::Proto::GetProjectItemCompletionsRequest
        .expects(:new)
        .with({ key: key, queryType: ::IssuesGraph::Proto::QueryType::FORCE_DENORMALIZED, actorId: 456 })

      response = client.get_project_item_completions(
        owner_id: 123,
        item_id: 123,
        force_denormalized: true,
        actor_id: 456
      )
    end

    def test_handles_project_deletes
      hmac_key = ENV.fetch("HMAC_KEY", nil)
      client = IssuesGraph::Client.new(TWIRP_ADDR, hmac_key)

      parent = get_issue(number: 1)
      issues = [get_issue(number: 2), get_issue(number: 3)]
      tracking_block = get_tracking_block(order: 1, name: "parent", issues: issues)
      response = client.replace_tracking_blocks_for_parent(parent, [tracking_block])
      assert_nil response.error

      project = get_project(number: 1)

      keyResponse = client.upsert_project_and_relationships(from: project, to: [parent])
      assert_nil keyResponse.error

      response = client.get_project_item_completions(
        owner_id: project.key.ownerId,
        item_id: project.key.itemId
      )
      assert_nil response.error

      assert_equal 1, response.data.items.size

      response = client.delete_issue_from_project(from: keyResponse.data.from, to: keyResponse.data.to[0])
      assert_nil response.error

      response = client.get_project_item_completions(
        owner_id: project.key.ownerId,
        item_id: project.key.itemId
      )
      assert_nil response.error

      assert_equal 0, response.data.items.size
    end

    ###############################################################################
    # tracking blocks
    ###############################################################################

    def test_add_tracking_block
      hmac_key = ENV.fetch("HMAC_KEY", nil)
      client = IssuesGraph::Client.new(TWIRP_ADDR, hmac_key)

      parent = get_issue(number: 1)
      issues = [get_issue(number: 2), get_issue(number: 3)]
      tracking_block = get_tracking_block(order: 1, name: "parent", issues: issues)
      response = client.replace_tracking_blocks_for_parent(parent, [tracking_block])
      assert_equal true, response.success?

      response = client.get_issue(key: parent.key)
      assert_equal 1, response.data.tracking.size
    end

    def test_update_tracking_block
      hmac_key = ENV.fetch("HMAC_KEY", nil)
      client = IssuesGraph::Client.new(TWIRP_ADDR, hmac_key)

      parent = get_issue(number: 4, owner_id: 2)
      issues = [get_issue(number: 5, owner_id: 2), get_issue(number: 6, owner_id: 2)]
      tracking_block = get_tracking_block(order: 1, name: "parent", issues: issues)
      response = client.replace_tracking_blocks_for_parent(parent, [tracking_block])
      assert_nil response.error

      response = client.get_issue(key: parent.key)
      assert_nil response.error

      issues = [get_issue(number: 5, owner_id: 2), get_issue(number: 8, owner_id: 2), get_issue(number: 9, owner_id: 2)]
      tracking_block = get_tracking_block(order: 1, name: "parent", issues: issues)
      response = client.replace_tracking_blocks_for_parent(parent, [tracking_block])
      assert_nil response.error

      response = client.get_issue(key: parent.key)
      assert_nil response.error
      assert_equal 1, response.data.tracking.size
      assert_equal 3, response.data.tracking[0].issues.size
    end

    def test_remove_tracking_block
      hmac_key = ENV.fetch("HMAC_KEY", nil)
      client = IssuesGraph::Client.new(TWIRP_ADDR, hmac_key)

      parent = get_issue(number: 1)
      issues = [get_issue(number: 2), get_issue(number: 3)]
      tracking_block = get_tracking_block(order: 1, name: "parent", issues: issues)
      response = client.replace_tracking_blocks_for_parent(parent, [tracking_block])
      assert_nil response.error

      response = client.replace_tracking_blocks_for_parent(parent, [])
      assert_nil response.error
    end

    def test_calls_distribution_metrics_when_available
      log_tag = "test:tag"
      hmac_key = ENV.fetch("HMAC_KEY", nil)

      statter = GitHub::Timing.new
      client = IssuesGraph::Client.new(TWIRP_ADDR, hmac_key, {
                                         dogstats: statter
                                       })

      parent = get_issue(number: 1)
      issues = [get_issue(number: 2), get_issue(number: 3)]
      tracking_block = get_tracking_block(order: 1, name: "parent", issues: issues)

      client.replace_tracking_blocks_for_parent(parent, [tracking_block], stat_tags: [log_tag])

      stat, _, tags_hash = statter.calls.first
      raise "Expected statter to have stats" unless stat

      assert_equal "#{IssuesGraph::Client::STAT_PREFIX}.round_trip", stat
      assert_equal true, tags_hash[:tags].include?(log_tag)
    end

    def test_replace_tracking_blocks_for_parent
      hmac_key = ENV.fetch("HMAC_KEY", nil)
      client = IssuesGraph::Client.new(TWIRP_ADDR, hmac_key)

      parent = get_issue(number: 1)
      old_issues = [get_issue(number: 2), get_issue(number: 3)]
      old_tracking_block = get_tracking_block(order: 1, name: "old", issues: old_issues)
      new_issues = [get_issue(number: 4), get_issue(number: 5)]
      new_tracking_block = get_tracking_block(order: 1, name: "new", issues: new_issues)

      response = client.replace_tracking_blocks_for_parent(parent, [old_tracking_block])
      assert_nil response.error

      response = client.replace_tracking_blocks_for_parent(parent, [new_tracking_block])
      assert_nil response.error

      response = client.get_issue(key: parent.key)
      assert_equal "new", response.data.tracking.first.name
    end

    ###############################################################################
    # tracked by items
    ###############################################################################

    def test_get_project_tracked_by_items
      hmac_key = ENV.fetch("HMAC_KEY", nil)
      client = IssuesGraph::Client.new(TWIRP_ADDR, hmac_key)

      parent = get_issue(number: 100)
      issues = [get_issue(number: 200), get_issue(number: 300)]
      tracking_block = get_tracking_block(order: 1, name: "parent", issues: issues)
      response = client.replace_tracking_blocks_for_parent(parent, [tracking_block])
      assert_nil response.error

      project = get_project(number: 10)

      response = client.upsert_project_and_relationships(from: project, to: [parent] + issues)
      assert_nil response.error

      response = client.get_project_tracked_by_items(
        owner_id: project.key.ownerId,
        item_id: project.key.itemId
      )

      assert_equal issues.size, response.data.items.size
      response.data.items.each do |item|
        trackedByItem = item["trackedByItems"].first
        assert_equal parent.title, trackedByItem.title
        assert_equal parent.key.itemId, trackedByItem.key.itemId
        assert_equal parent.key.ownerId, trackedByItem.key.ownerId
      end
    end

    ###############################################################################
    # Utility
    ###############################################################################

    def get_tracking_block(order:, name:, issues:, opts: {})
      id = opts.fetch(:id, rand(100_000))
      owner_id = opts.fetch(:owner_id, rand(100_000))
      ::IssuesGraph::Proto::TrackingBlock.new(
        key: ::IssuesGraph::Proto::Key.new(
          ownerId: owner_id,
          itemId: id
        ),
        order: order,
        name: name,
        issues: issues
      )
    end

    def get_completion(key:, tracking_blocks:)
      ::IssuesGraph::Proto::Completion.new(
        key: key,
        completed: 0,
        total: tracking_blocks.reduce(0) { |total, tracking_block| total + tracking_block.issues.length },
        percent: 0
      )
    end

    def get_issue(number:, owner_id: 1, state: "open", state_reason: nil, position: 0)
      id = rand(100_000)
      ::IssuesGraph::Proto::Issue.new(
        key: ::IssuesGraph::Proto::Key.new(
          ownerId: owner_id,
          itemId: id
        ),
        title: "issue id:#{id}",
        number: number,
        state: state,
        stateReason: state_reason,
        position: position
      )
    end

    def get_issue_as_hash(number:, owner_id: 1, state: "open", state_reason: nil)
      id = rand(10_000)
      {
        key: {
          ownerId: owner_id,
          itemId: id
        },
        title: "issue id:#{id}",
        number: number,
        state: state,
        stateReason: state_reason,
        repoId: 1
      }
    end

    def get_project(number:, owner_id: 1)
      id = rand(MAX_NUMBER)
      ::IssuesGraph::Proto::Project.new(
        key: ::IssuesGraph::Proto::Key.new(
          ownerId: owner_id,
          itemId: id
        ),
        title: "project id:#{id}",
        number: number
      )
    end

    def to_v1_key(issue:)
      {
        repoId: issue.repoId,
        issueId: issue.key.itemId
      }
    end

    def to_v1_hash(issue:)
      {
        key: to_v1_key(issue: issue),
        title: issue.title,
        url: issue.url,
        state: issue.state,
        stateReason: issue.stateReason,
        userName: issue.userName,
        repoName: issue.repoName,
        number: issue.number,
        userId: issue.key.ownerId
      }
    end
  end
end

# A class to mock the Dogstatsd client in the monolith
class GitHub
  class Timing
    attr_reader :calls

    def initialize
      @calls = []
    end

    def distribution_timing_since(*args)
      @calls << args
      self
    end
  end

  def self.dogstats
    Timing.new
  end
end
