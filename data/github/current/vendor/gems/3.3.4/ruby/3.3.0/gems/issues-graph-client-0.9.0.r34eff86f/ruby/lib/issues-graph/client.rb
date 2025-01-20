# frozen_string_literal: true

require "openssl"
require_relative "./proto/v1/service_pb"
require_relative "./proto/v1/service_twirp"
require_relative "./result"

module IssuesGraph
  # Null object pattern class for missing logger
  class NullLogger
    def log(*_args)
      self
    end
  end

  # Null object pattern class for missing statter
  class NullStatter
    def distribution_timing_since(*_args)
      self
    end

    def increment(*_args)
      self
    end
  end

  # The Ruby client for the IssuesGraph service.
  class Client
    ALGORITHM = "sha256"
    HMAC_HEADER = "Request-HMAC"
    STAT_PREFIX = "issues_graph.client"

    # conn     - http_client
    # hmac_key - authentication HMAC key (https://en.wikipedia.org/wiki/HMAC)
    # options  - used to provide non-required statter and logger dependency (default: {}):
    #            :dogstats - Datadog client
    #            :logger   - Logger that responds to `log` method
    def initialize(conn, hmac_key, options = {})
      @client = ::IssuesGraph::Proto::IssuesGraphClient.new(conn)
      @tracking_blocks_client = ::IssuesGraph::Proto::TrackingBlocksClient.new(conn)
      @project_client = ::IssuesGraph::Proto::ProjectsClient.new(conn)
      @hmac_key = hmac_key

      @dogstats = options[:dogstats] || ::IssuesGraph::NullStatter.new
      @logger = options[:logger] || ::IssuesGraph::NullLogger.new
    end

    ########################################################################
    # main api
    ########################################################################

    def update_issue(issue:, log_tags: [], stat_tags: [])
      wrap_result(__method__, log_tags: log_tags, stat_tags: stat_tags) do
        if issue.is_a?(Hash)

          # deal with any left over v1 issues in the sync job
          issue_key = issue[:key]
          if issue_key.key?(:repoId) && issue_key.key?(:issueId) && issue.key?(:userId)

            issue = {
              key: {
                ownerId: issue[:userId],
                itemId: issue_key[:issueId]
              },
              title: issue[:title],
              url: issue[:url],
              state: issue[:state],
              repoName: issue[:repoName],
              repoId: issue_key[:repoId],
              userName: issue[:userName],
              number: issue[:number],
              labels: issue[:labels],
              assignees: issue[:assignees],
              itemType: issue[:itemType]
            }

          end
        end

        req = ::IssuesGraph::Proto::UpdateIssueRequest.new(issue: issue)
        @client.update_issue(req, headers: request_headers)
      end
    end

    def delete_issue_from_tracking_block(from:, to:, log_tags: [], stat_tags: [])
      wrap_result(__method__, log_tags: log_tags, stat_tags: stat_tags) do
        req = ::IssuesGraph::Proto::DeleteRelationshipRequest.new(from: from, to: to)
        @project_client.delete_issue_from_tracking_block(req, headers: request_headers)
      end
    end

    def delete_tracking_block_from_issue(from:, to:, log_tags: [], stat_tags: [])
      wrap_result(__method__, log_tags: log_tags, stat_tags: stat_tags) do
        req = ::IssuesGraph::Proto::DeleteRelationshipRequest.new(from: from, to: to)
        @project_client.delete_tracking_block_from_issue(req, headers: request_headers)
      end
    end

    def get_issue(key:, use_denormalized_data: true, actor_id: actor_id_from_context, log_tags: [], stat_tags: [])
      log_tags |= log_tags_from_key(key)
      actor_id ||= actor_id_from_context

      wrap_result(__method__, log_tags: log_tags, stat_tags: stat_tags) do
        req = ::IssuesGraph::Proto::GetIssueRequest.new(
          key: key,
          queryType: use_denormalized_data ? ::IssuesGraph::Proto::QueryType::DEFAULT : ::IssuesGraph::Proto::QueryType::FORCE_GRAPH,
          actorId: actor_id
        )
        @client.get_issue(req, headers: request_headers)
      end
    end

    ########################################################################
    # tracking blocks
    ########################################################################

    def add_tracking_block_for_parent(parent, tracking_blocks, log_tags: [], stat_tags: [])
      wrap_result(__method__, log_tags: log_tags, stat_tags: stat_tags) do
        req = ::IssuesGraph::Proto::AddTrackingBlockRequest.new(parent: parent, type: :Tracks, blocks: tracking_blocks)
        @tracking_blocks_client.add_for_parent(req, headers: request_headers)
      end
    end

    def update_tracking_block_by_key(block_key, issues_to_add, issues_to_remove, log_tags: [], stat_tags: [])
      wrap_result(__method__, log_tags: log_tags, stat_tags: stat_tags) do
        req = ::IssuesGraph::Proto::UpdateTrackingBlockByKeyRequest.new(key: block_key, type: :Tracks, issuesToAdd: issues_to_add, issuesToRemove: issues_to_remove)
        @tracking_blocks_client.update_by_key(req, headers: request_headers)
      end
    end

    def update_tracking_block_in_place_by_key(block_key, issues_to_update, log_tags: [], stat_tags: [])
      wrap_result(__method__, log_tags: log_tags, stat_tags: stat_tags) do
        req = ::IssuesGraph::Proto::UpdateTrackingBlockByKeyRequest.new(
          key: block_key,
          type: :Tracks,
          issuesToUpdate: issues_to_update
        )
        @tracking_blocks_client.update_by_key(req, headers: request_headers)
      end
    end

    def get_tracking_blocks_by_parent(owner_id, item_id, log_tags: [], stat_tags: [])
      log_tags |= ["owner_id:#{owner_id}"]
      log_tags |= ["item_id:#{item_id}"]

      wrap_result(__method__, log_tags: log_tags, stat_tags: stat_tags) do
        parent = ::IssuesGraph::Proto::Key.new(ownerId: owner_id, itemId: item_id)
        req = ::IssuesGraph::Proto::GetTrackingBlockRequest.new(parent: parent, type: :Tracks)
        @tracking_blocks_client.get_by_parent(req, headers: request_headers)
      end
    end

    def remove_tracking_block(owner_id, item_id, tracking_block_id, log_tags: [], stat_tags: [])
      log_tags |= ["owner_id:#{owner_id}"]
      log_tags |= ["item_id:#{item_id}"]
      log_tags |= ["tracking_block_id:#{tracking_block_id}"]

      wrap_result(__method__, log_tags: log_tags, stat_tags: stat_tags) do
        primary_key = ::IssuesGraph::Proto::PrimaryKey.new(uuid: tracking_block_id)
        tracking_block = ::IssuesGraph::Proto::Key.new(ownerId: owner_id, itemId: item_id, primaryKey: primary_key)
        req = ::IssuesGraph::Proto::RemoveTrackingBlockRequest.new(trackingBlock: tracking_block)
        @tracking_blocks_client.remove_tracking_block(req, headers: request_headers)
      end
    end

    def replace_tracking_blocks_for_parent(parent, tracking_blocks, actor_id: actor_id_from_context, log_tags: [], stat_tags: [])
      actor_id ||= actor_id_from_context
      wrap_result(__method__, log_tags: log_tags, stat_tags: stat_tags) do
        req = ::IssuesGraph::Proto::ReplaceForParentRequest.new(parent: parent, type: :Tracks, blocks: tracking_blocks, actorId: actor_id)
        @tracking_blocks_client.replace_for_parent(req, headers: request_headers)
      end
    end

    ########################################################################
    # projects
    ########################################################################

    def upsert_project_and_relationships(from:, to:, user: nil, log_tags: [], stat_tags: [])
      wrap_result(__method__, log_tags: log_tags, stat_tags: stat_tags) do
        req = ::IssuesGraph::Proto::UpsertProjectAndRelationshipsRequest.new(from: from, to: to, type: :Tracks, upsertingUser: user)
        @project_client.upsert_project_and_relationships(req, headers: request_headers)
      end
    end

    def get_project_item_completions(owner_id:, item_id:, actor_id: actor_id_from_context, log_tags: [], stat_tags: [], **opts)
      actor_id ||= actor_id_from_context
      wrap_result(__method__, log_tags: log_tags, stat_tags: stat_tags) do
        key = ::IssuesGraph::Proto::Key.new(ownerId: owner_id, itemId: item_id)
        req = ::IssuesGraph::Proto::GetProjectItemCompletionsRequest.new(
          key: key,
          queryType: query_type_from(opts),
          actorId: actor_id
        )
        @project_client.get_project_item_completions(req, headers: request_headers)
      end
    end

    def delete_issue_from_project(from:, to:, log_tags: [], stat_tags: [])
      wrap_result(__method__, log_tags: log_tags, stat_tags: stat_tags) do
        req = ::IssuesGraph::Proto::DeleteRelationshipRequest.new(from: from, to: to)
        @project_client.delete_issue_from_project(req, headers: request_headers)
      end
    end

    def get_project_tracked_by_items(owner_id:, item_id:, actor_id: actor_id_from_context, log_tags: [], stat_tags: [], **opts)
      actor_id ||= actor_id_from_context
      wrap_result(__method__, log_tags: log_tags, stat_tags: stat_tags) do
        key = ::IssuesGraph::Proto::Key.new(ownerId: owner_id, itemId: item_id)
        req = ::IssuesGraph::Proto::GetProjectTrackedByItemsRequest.new(
          key: key,
          queryType: query_type_from(opts),
          actorId: actor_id
        )
        @project_client.get_project_tracked_by_items(req, headers: request_headers)
      end
    end

    # Private: retrieves the query type based on the options provided.
    #
    # opts - hash containing the query options
    #
    # Returns the query type to be used by the server.
    private def query_type_from(opts = {})
      return ::IssuesGraph::Proto::QueryType::FORCE_GRAPH if opts[:force_graph] == true
      return ::IssuesGraph::Proto::QueryType::FORCE_DENORMALIZED if opts[:force_denormalized] == true

      ::IssuesGraph::Proto::QueryType::DEFAULT
    end

    # Private: extracts the key information as tags to be used by the logger and statter,
    #          normalizing hash or key object access
    #
    # key - Hash or Key object to extract the information from
    #
    # Returns a string array containing the key fields.
    private def log_tags_from_key(key)
      tags = []

      if key.is_a?(Hash)
        tags.push("item_id:#{key[:itemId]}") if key.key?(:itemId)
        tags.push("owner_id:#{key[:ownerId]}") if key.key?(:ownerId)
      else
        tags.push("item_id:#{key.itemId}") if key.respond_to?(:itemId)
        tags.push("owner_id:#{key.ownerId}") if key.respond_to?(:ownerId)
      end

      tags
    end

    ########################################################################
    # deprecated: to be removed
    ########################################################################

    def upsert_issues_and_relationships(from:, to:)
      ::IssuesGraph::Result.success([])
    end

    def get_issue_relationships_and_completions(owner_id:, item_id:, type:)
      ::IssuesGraph::Result.success([])
    end

    private

    # Private: creates the request headers to be used by the http client for every call
    #
    # Returns a hash containing the headers.
    def request_headers
      headers = {}
      headers[HMAC_HEADER] = request_hmac
      headers
    end

    # Private: calculates the hmac string based off of the hmac_key provided
    #
    # Returns the calculated string.
    def request_hmac
      return "" if @hmac_key.nil?

      hmac = OpenSSL::HMAC.hexdigest(ALGORITHM, @hmac_key, header_timestamp)
      "#{header_timestamp}.#{hmac}"
    end

    def header_timestamp
      Time.now.to_i.to_s
    end

    # Private: wrapper around the client's request method that:
    # + normalizes success and errors results
    # + sends distribution metrics if the statting method is defined
    # + sends timeout stats
    # + log and stats raised errors
    #
    # method_name - name of the method to be used in the logs and stats
    # log_tags    - extra tags that can be added to the logs passed in
    #               by the consumers of the client to provide
    #               more context and make the errors easier to track
    # stat_tags   - extra tags to be used when statting calls. Ideally
    #               they should be tags that can be used to group stats.
    #               Avoid request specific tags.
    #
    # Returns an instance of the ::IssuesGraph::Result with all relevant information
    # obtained from the Twirp::Response and/or any error raised by the http client.
    def wrap_result(method_name, log_tags: [], stat_tags: [], &block)
      raise ::Issues::Errors::ArgumentError, "#{__method__}: Block is required" unless block

      success_proc = create_wrap_result_success_handler(method_name, log_tags, stat_tags)
      error_proc = create_wrap_result_error_handler(method_name, log_tags, stat_tags)

      begin
        with_dist(method_name, tags: stat_tags) do
          response = yield

          if promise_response?(response)
            response.then(success_proc, error_proc)
          else
            success_proc.call(response)
          end
        end
      rescue StandardError => e
        error_proc.call(e)
      end
    end

    def create_wrap_result_success_handler(method_name, log_tags, stat_tags)
      proc do |response|
        stat_and_log_error(method_name, response.error, log_tags: log_tags, stat_tags: stat_tags) if response.error

        ::IssuesGraph::Result.response(response)
      end
    end

    def create_wrap_result_error_handler(method_name, log_tags, stat_tags)
      proc do |error|
        if timeout_error?(error)
          increment_timeout_stat(method_name, stat_tags: stat_tags)
          twirp_error = ::Twirp::Error.canceled("Timeout exceeded for #{method_name} request")
        else
          twirp_error = ::Twirp::Error.unknown(error.message)
        end

        stat_and_log_error(method_name, error, log_tags: log_tags, stat_tags: stat_tags)

        ::IssuesGraph::Result.error(twirp_error, error)
      end
    end

    # Private: a wrapper around the client's request method that sends
    # distribution metrics if the statting method is defined. If dogstats is available,
    # each invocation will call the distribution_timing_since method. of the block.
    #
    # method_name - The name of the method being called or what you want the stat to be
    #               named
    # tags        - tags to be added to the time distribution stat.
    #               format convention: "{key}:{value}"
    #
    # Returns the result of the block.
    def with_dist(method_name, tags: [])
      start = Time.now

      response = yield if block_given?

      tags |= ["concurrent:true"] if promise_response?(response)
      with_dist_proc = create_with_dist_handler(method_name, start, tags)

      if promise_response?(response)
        response.then(with_dist_proc)
      else
        with_dist_proc.call(response)
      end
    end

    def create_with_dist_handler(method_name, start_time, tags)
      proc do |response|
        responseSourceType = ""
        responseSourceType = response.data.responseSourceType if defined?(response.data.responseSourceType)

        @dogstats.distribution_timing_since(
          "#{STAT_PREFIX}.round_trip",
          start_time,
          tags: ["method:#{method_name}", "responseSourceType:#{responseSourceType}"] | tags
        )
        response
      end
    end

    # Private: infer timeout error based on the error class name to avoid direct references
    # to Faraday inside the client, keeping it independent of the Faraday implementation
    def timeout_error?(error)
      return false if error.nil?

      error.class.name.include? "Timeout"
    end

    # Private: as long as the http client uses the Promise interface, it's possible to identify
    # if the call was done asynchronously
    # (prioritizing the Faraday Future API because the ruby-twirp implementation already depends on it )
    def promise_response?(response)
      # :then cannot be checked because it's defined by ruby already
      response&.respond_to?(:sync) && response&.respond_to?(:fulfill)
    end

    # Private: separate log method used for timeout error only
    #
    # method_name - The name of the method being called to be added as a "required" tag
    #               of the stat
    # stat_tags   - string array of tags to be added as tags of the timeout stat
    #
    # Returns nothing.
    def increment_timeout_stat(method_name, stat_tags: [])
      @dogstats.increment(
        "#{STAT_PREFIX}.timeout",
        tags: ["method:#{method_name}"] | stat_tags
      )
    end

    # Private: returns the actor_id from the GitHub context if available
    def actor_id_from_context
      GitHub.context[:actor_id] if defined?(GitHub) && defined?(GitHub.context) && GitHub.context[:actor_id]
    end

    # Private: logs and stats information of the provided error.
    #
    # method_name - The name of the method being called to be added as a tag or field
    # error       - an instance of ::StandardError or descendant, where to extract
    #               the error message to be logged
    # log_tags    - string array of tags in the format "{key}:{value}" that are going
    #               to be converted to log fields. If no log_tags is provided, it'll
    #               be set to the stat_tags
    # stat_tags   - string array of tags in the format "{key}:{value}", to be used
    #               to tag the stat of the error
    #
    # Returns nothing.
    def stat_and_log_error(method_name, error, log_tags: [], stat_tags: [])
      Failbot.report(error) if defined?(Failbot) && error.is_a?(::StandardError)

      log_tags = stat_tags if log_tags.empty?

      # normalizing twirp error and ruby error messages
      error_message = defined?(error.msg) ? error.msg : error.message

      # including GitHub context info to logs, if available
      actor_id = actor_id_from_context
      request_id = defined?(GitHub) && defined?(GitHub.context) && GitHub.context[:request_id]

      options = log_tags
                .map { |tag| tag.split(":") }
                .to_h
                .merge(
                  exception: error_message,
                  user_id: actor_id,
                  request_id: request_id
                )
      @logger.log(
        msg: "#{STAT_PREFIX}.#{method_name} failed",
        **options
      )

      error_tags = defined?(error.code) ? ["result:#{error.code}"] : []
      @dogstats.increment(
        "#{STAT_PREFIX}.error",
        tags: ["method:#{method_name}"] | error_tags | stat_tags
      )
    end
  end
end
