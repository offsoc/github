require "aleph/version"
require "aleph/proto/code_nav_twirp"
require "aleph/proto/lsp_twirp"

module Aleph
  class Client
    attr_reader :rpc, :proxy

    def initialize(conn, hmac_key: nil)
      @rpc = Aleph::Proto::CodeNavClient.new(conn)
      @proxy = Aleph::Proto::LanguageServerProxyClient.new(conn)
      @hmac_key = hmac_key
    end

    # Public: Find all symbols for a path.
    #
    # root_id    - Integer repository id of fork repo network's root repo
    # network_id - Integer id of the fork repo network
    # repo_id    - Integer repository id
    # repo_owner - String username of repository owner
    # repo_name  - String name of repository
    # sha        - String commit sha
    # path       - String repo relative filepath
    # ref        - String named ref (optional, default: nil)
    #
    # Returns a Twirp::ClientResp where #data is a FindSymbolsResponse (see github/aleph/proto/code_nav.proto#FindSymbolsResponse for more info).
    def find_symbols_for_path(root_id:, network_id:, repo_id:, repo_owner:, repo_name:, sha:, path:, ref: nil, opt_headers: {})
      req = Aleph::Proto::FindSymbolsForPathRequest.new(
        root_id: root_id,
        network_id: network_id,
        repository_id: repo_id,
        repository_owner: repo_owner,
        repository_name: repo_name,
        sha: sha,
        path: path,
        ref: ref
      )
      rpc.find_symbols_for_path(req, headers: headers.merge(opt_headers))
    end

    # Public: Requests that a particular repo-commit be indexed.
    #
    # network_id                 - Integer id of the fork repo network
    # repo_id                    - Integer repository id
    # commit_oid                 - String commit oid
    # should_index_future_pushes - Whether we should index future pushes to this
    #                              repository.  If true, you must provide `ref`.
    # reason                     - The reason for requesting this repository be
    #                              indexed.
    # ref                        - A strng ref name that currently resolves to
    #                              `commit_oid`. If given, we will mark the
    #                              commit as the "most recently indexed commit"
    #                              for the ref.  If `should_index_future_pushes`
    #                              is true, we will also index any future pushes
    #                              to this ref.
    #
    # Returns a Twirp::ClientResp where #data is a RequestIndexResponse (see github/aleph/proto/code_nav.proto#RequestIndexResponse for more info).
    def request_index(network_id:, repo_id:, commit_oid:, reason:, should_index_future_pushes: false, ref: nil, opt_headers: {})
      repo = Aleph::Proto::Repo.new(
        network_id: network_id,
        repo_id: repo_id,
      )
      repo_commit = Aleph::Proto::RepoCommit.new(
        repo: repo,
        commit_oid: commit_oid,
      )
      req = Aleph::Proto::RequestIndexRequest.new(
        repo_commit: repo_commit,
        should_index_future_pushes: should_index_future_pushes,
        reason: reason,
        ref: ref
      )
      rpc.request_index(req, headers: headers.merge(opt_headers))
    end

    # Public: Requests that a particular search key be indexed.
    #
    # search_key                 - String search key to index
    # reason                     - The reason for requesting this repository be
    #                              indexed.
    #
    # Returns a Twirp::ClientResp where #data is a RequestIndexResponse (see github/aleph/proto/code_nav.proto#RequestIndexResponse for more info).
    def request_index_for_search_key(search_key:, reason:, opt_headers: {})
      req = Aleph::Proto::RequestIndexRequest.new(
        search_key: search_key,
        reason: reason,
      )
      rpc.request_index(req, headers: headers.merge(opt_headers))
    end

    # Public: Returns information about any pending or completed indexing operations.
    #
    # network_id                 - Integer id of the fork repo network
    # repo_id                    - Integer repository id
    # commit_oid                 - String commit oid
    def get_indexing_status(network_id:, repo_id:, commit_oid:, opt_headers: {})
      repo = Aleph::Proto::Repo.new(
        network_id: network_id,
        repo_id: repo_id,
      )
      repo_commit = Aleph::Proto::RepoCommit.new(
        repo: repo,
        commit_oid: commit_oid,
      )
      req = Aleph::Proto::GetIndexingStatusRequest.new(
        repo_commit: repo_commit,
      )
      rpc.get_indexing_status(req, headers: headers.merge(opt_headers))
    end

    # Public: Returns information about any pending or completed indexing
    # operations for a search key.
    #
    # search_key                 - String search key
    def get_indexing_status_for_search_key(search_key:, opt_headers: {})
      req = Aleph::Proto::GetIndexingStatusRequest.new(
        search_key: search_key,
      )
      rpc.get_indexing_status(req, headers: headers.merge(opt_headers))
    end

    # Public: Force an index of a repository.
    # DEPRECATED: Use request_index for future requests
    #
    # network_id - Integer id of the fork repo network
    # repo_id    - Integer repository id
    # repo_owner - String username of repository owner
    # repo_name  - String name of repository
    # ref        - String ref (optional, default: nil). Use nil to specify the default branch.
    #
    # Returns a Twirp::ClientResp where #data is an IndexRepositoryResponse (see github/aleph/proto/code_nav.proto#IndexRepositoryResponse for more info).
    def index_repository(network_id:, repo_id:, repo_owner:, repo_name:, ref: nil, opt_headers: {})
      req = Aleph::Proto::IndexRepositoryRequest.new(
        network_id: network_id,
        repository_id: repo_id,
        repository_owner: repo_owner,
        repository_name: repo_name,
        ref: ref
      )
      rpc.index_repository(req, headers: headers.merge(opt_headers))
    end

    # Public: Determines if an index exists for the given repository at the given commit oid.
    #
    # root_id              - Integer repository id of fork repo network's root repo
    # network_id           - Integer id of the fork repo network
    # repo_id              - Integer repository id
    # repo_owner           - String username of repository owner
    # repo_name            - String name of repository
    # commit_oid           - String commit oid
    # backends             - Array of string backends to query (order-sensitive).
    # actor_id             - Integer id of the user making the request.
    # request_ip           - String ip address from where the request is made.
    # access_token         - String the blackbird access token.
    # access_token_expires - Integer the expiration for the blackbird access token.
    # access_token_kind    - String the kind of access token.
    # session_id           - String the session id.
    #
    # Returns a Twirp::ClientResp where #data is an ExistResponse (see github/aleph/proto/lsp.proto#ExistResponse for more info).
    def exist(root_id:, network_id:, repo_id:, repo_owner:, repo_name:, commit_oid:, backends: [], actor_id:, request_ip:, access_token:, access_token_expires:, access_token_kind:, session_id:, opt_headers: {})
      req = Aleph::Proto::ExistRequest.new(
        root_id: root_id,
        network_id: network_id,
        repository_id: repo_id,
        repository_owner: repo_owner,
        repository_name: repo_name,
        commit_oid: commit_oid,
        backends: backends,
        actor: Aleph::Proto::Actor.new(
          actor_id: actor_id,
          request_ip: request_ip,
          access_token: access_token,
          access_token_expires: access_token_expires,
          access_token_kind: access_token_kind,
          session_id: session_id,
        ),
      )
      proxy.exist(req, headers: headers.merge(opt_headers))
    end

    # Public: Find the definition(s) of a symbol at the given path, row, and column for the provided repository.
    #
    # root_id              - Integer repository id of fork repo network's root repo
    # network_id           - Integer id of the fork repo network
    # repo_id              - Integer repository id
    # repo_owner           - String username of repository owner
    # repo_name            - String name of repository
    # commit_oid           - String commit oid
    # path                 - String repo relative filepath
    # row                  - Integer row position of symbol
    # column               - Integer column position of symbol
    # query                - String the query symbol for the code nav request.
    # backends             - Array of string backends to query (order-sensitive).
    # actor_id             - Integer id of the user making the request.
    # request_ip           - String ip address from where the request is made.
    # access_token         - String the blackbird access token.
    # access_token_expires - Integer the expiration for the blackbird access token.
    # access_token_kind    - String the kind of access token.
    # session_id           - String the session id.
    # language             - String language name.
    #
    # Returns a Twirp::ClientResp where #data is a TextDocumentLocationResponse (see github/aleph/proto/lsp.proto#TextDocumentLocationResponse for more info).
    def text_document_definition(root_id:, network_id:, repo_id:, repo_owner:, repo_name:, commit_oid:, path:, row:, col:, query:, backends: [], search_dependencies: false, ref:, actor_id:, request_ip:, access_token:, access_token_expires:, access_token_kind:, session_id:, language:, symbol_kind:, opt_headers: {})
      req = Aleph::Proto::TextDocumentPositionRequest.new(
        root_id: root_id,
        network_id: network_id,
        repository_id: repo_id,
        repository_owner: repo_owner,
        repository_name: repo_name,
        commit_oid: commit_oid,
        path: path,
        position: Aleph::Proto::Position.new(
          line: row,
          character: col,
        ),
        query: query,
        backends: backends,
        search_dependencies: search_dependencies,
        ref: ref,
        actor: Aleph::Proto::Actor.new(
          actor_id: actor_id,
          request_ip: request_ip,
          access_token: access_token,
          access_token_expires: access_token_expires,
          access_token_kind: access_token_kind,
          session_id: session_id,
        ),
        language: language,
        symbol_kind: symbol_kind,
      )
      proxy.text_document_definition(req, headers: headers.merge(opt_headers))
    end

    # Public: Find all references of a symbol at the given path, row, and column for the provided repository.
    #
    # root_id              - Integer repository id of fork repo network's root repo
    # network_id           - Integer id of the fork repo network
    # repo_id              - Integer repository id
    # repo_owner           - String username of repository owner
    # repo_name            - String name of repository
    # commit_oid           - String commit oid
    # path                 - String repo relative filepath
    # row                  - Integer row position of symbol
    # column               - Integer column position of symbol
    # query                - String the query symbol for the code nav request.
    # backends             - Array of string backends to query (order-sensitive).
    # actor_id             - Integer id of the user making the request.
    # request_ip           - String ip address from where the request is made.
    # access_token         - String the blackbird access token.
    # access_token_expires - Integer the expiration for the blackbird access token.
    # access_token_kind    - String the kind of access token.
    # session_id           - String the session id.
    # language             - String language name.
    #
    # Returns a Twirp::ClientResp where #data is a TextDocumentLocationResponse (see github/aleph/proto/lsp.proto#TextDocumentLocationResponse for more info).
    def text_document_references(root_id:, network_id:, repo_id:, repo_owner:, repo_name:, commit_oid:, path:, row:, col:, query:, backends: [], search_dependencies: false, ref:, actor_id:, request_ip:, access_token:, access_token_expires:, access_token_kind:, session_id:, language:, symbol_kind:, opt_headers: {})
      req = Aleph::Proto::TextDocumentPositionRequest.new(
        root_id: root_id,
        network_id: network_id,
        repository_id: repo_id,
        repository_owner: repo_owner,
        repository_name: repo_name,
        commit_oid: commit_oid,
        path: path,
        position: Aleph::Proto::Position.new(
          line: row,
          character: col,
        ),
        query: query,
        backends: backends,
        search_dependencies: search_dependencies,
        ref: ref,
        actor: Aleph::Proto::Actor.new(
          actor_id: actor_id,
          request_ip: request_ip,
          access_token: access_token,
          access_token_expires: access_token_expires,
          access_token_kind: access_token_kind,
          session_id: session_id,
        ),
        language: language,
        symbol_kind: symbol_kind,
      )
      proxy.text_document_references(req, headers: headers.merge(opt_headers))
    end

    def workspace_asset(uri:, opt_headers: {})
      req = Aleph::Proto::WorkspaceAssetRequest.new(uri: uri)
      proxy.workspace_asset(req, headers: headers.merge(opt_headers))
    end

    # Public: Find all references in a repo for the given list of fully qualified names.
    #
    # root_id         - Integer repository id of fork repo network's root repo
    # network_id      - Integer id of the fork repo network
    # repo_id         - Integer repository id
    # commit_oid      - String commit sha
    # qualified_names - List of fully qualified names to search for
    # language        - String language name
    #
    # Returns a Twirp::ClientResp where #data is a FindReferencesToQualifiedNamesResponse (see github/aleph/proto/lsp.proto#FindReferencesToQualifiedNamesResponse for more info).
    def find_references_to_qualified_names(root_id: nil, network_id:, repo_id:, commit_oid:, qualified_names:, language: "", ref: "", opt_headers: {})
      req = Aleph::Proto::FindReferencesToQualifiedNamesRequest.new(
        root_id: root_id,
        network_id: network_id,
        repository_id: repo_id,
        commit_oid: commit_oid,
        qualified_names: qualified_names,
        language: language,
        ref: ref,
      )
      proxy.find_references_to_qualified_names(req, headers: headers.merge(opt_headers))
    end

    # Public: Find all definitions in a repo for the given list of fully qualified names.
    #
    # network_id      - Integer id of the fork repo network
    # repo_id         - Integer repository id
    # commit_oid      - String commit sha
    # qualified_names - List of fully qualified names to search for
    # language        - String language name
    #
    # Returns a Twirp::ClientResp where #data is a FindDefinitionsOfQualifiedNamesResponse (see github/aleph/proto/lsp.proto#FindDefinitionsOfQualifiedNamesResponse for more info).
    def find_definitions_of_qualified_names(network_id:, repo_id:, commit_oid:, qualified_names:, language: "", ref: "", opt_headers: {})
      req = Aleph::Proto::FindDefinitionsOfQualifiedNamesRequest.new(
        network_id: network_id,
        repository_id: repo_id,
        commit_oid: commit_oid,
        qualified_names: qualified_names,
        language: language,
        ref: ref,
      )
      proxy.find_definitions_of_qualified_names(req, headers: headers.merge(opt_headers))
    end

    # Public: Find the location of the defined name who's definiens contains a given location
    #
    # network_id      - Integer id of the fork repo network
    # repo_id         - Integer repository id
    # commit_oid      - String commit sha
    # path            - String repo relative filepath
    # start_line      - First line of the span to query
    # start_character - First character of the span to query
    # end_line        - Last line of the span to query
    #                   NOTE: this is INCLUDED in the span, i.e. up to and including this line
    # end_character   - Last character of the span to query
    #                   NOTE: this is EXCLUDED from the span, i.e. up to but not including this character)
    # language        - String language name
    # ref             - String named ref
    #
    # Returns a Twirp::ClientResp where #data is a FindDefinedNameByDefiniensLocationResponse (see github/aleph/proto/lsp.proto#FindDefinedNameByDefiniensLocationResponse for more info).
    def find_name_by_definiens_location(network_id:, repo_id:, commit_oid:, path:, start_line:, start_character:, end_line:, end_character:, language:, ref: "", backends:,opt_headers: {})
      req = Aleph::Proto::FindDefinedNameByDefiniensLocationRequest.new(
        network_id: network_id,
        repository_id: repo_id,
        commit_oid: commit_oid,
        path: path,
        range: {
          start: { line: start_line, character: start_character },
          end: { line: end_line, character: end_character }
        },
        language: language,
        ref: ref,
        backends: backends
      )
      proxy.find_defined_name_by_definiens_location(req, headers: headers.merge(opt_headers))
    end

    # Public: Get symbol information about a qualified name.
    #
    # commit_oid            - String commit sha
    # network_id            - Integer id of the fork repo network
    # repo_id               - Integer repository id
    # language              - String language name
    # ref                   - String named ref
    # fully_qualified_name  - String fully qualified namee
    #
    # Returns a Twirp::ClientResp where #data is a FindSymbolInformationForFullyQualifiedNameResponse (see github/aleph/proto/lsp.proto#FindSymbolInformationForFullyQualifiedNameResponse for more info).
    def find_symbol_information_for_fully_qualified_name(commit_oid:, network_id:, repo_id:, language:, ref: "", fully_qualified_name:, opt_headers: {})
      req = Aleph::Proto::FindSymbolInformationForFullyQualifiedNameRequest.new(
        commit_oid: commit_oid,
        network_id: network_id,
        repository_id: repo_id,
        language: language,
        ref: ref,
        fully_qualified_name: fully_qualified_name
      )
      proxy.find_symbol_information_for_fully_qualified_name(req, headers: headers.merge(opt_headers))
    end

    # Public: Find the locations of references that match any one of the given search keys.
    #
    # network_id  - Integer id of the fork repo network
    # repo_id     - Integer repository id
    # commit_oid  - String commit sha
    # search_keys - List of search keys
    # ref         - String named ref
    #
    # Returns a Twirp::ClientResp where #data is a FindReferencesForSearchKeysResponse (see github/aleph/proto/lsp.proto#FindReferencesForSearchKeysResponse for more info).
    def find_references_for_search_keys(network_id:, repo_id:, commit_oid:, search_keys:, references_to_consider: Aleph::Proto::ReferencesForSearchKeysAllowAliasedReferences::OnlyDirectReferences, ref: "", opt_headers: {})
      req = Aleph::Proto::FindReferencesForSearchKeysRequest.new(
        network_id: network_id,
        repository_id: repo_id,
        commit_oid: commit_oid,
        search_keys: search_keys,
        references_to_consider: references_to_consider,
        ref: ref,
      )
      proxy.find_references_for_search_keys(req, headers: headers.merge(opt_headers))
    end

    # Public: Returns information about any pending or completed indexing operations.
    #
    # network_id                 - Integer id of the fork repo network
    # repo_id                    - Integer repository id
    # operation                  - String operation must be one of "enable" or "disable"
    #
    # Returns a Twirp::ClientResp where #data is a ToggleRepoNetworkResponse (see github/aleph/proto/code_nav.proto#ToggleRepoNetworkResponse for more info).
    def toggle_repo_network(network_id:, repo_id:, operation:, opt_headers: {})
      req = Aleph::Proto::ToggleRepoNetworkRequest.new(
        network_id: network_id,
        repository_id: repo_id,
        operation: operation == "enable" ? Aleph::Proto::ToggleRepoNetworkOperation::ENABLE : Aleph::Proto::ToggleRepoNetworkOperation::DISABLE
      )
      rpc.toggle_repo_network(req, headers: headers.merge(opt_headers))
    end

    # Public: Find the location of the defined names which call directly or indirectly into definitions whos definiens contains a given location
    #
    # network_id      - Integer id of the fork repo network
    # repo_id         - Integer repository id
    # commit_oid      - String commit sha
    # path            - String repo relative filepath
    # start_line      - First line of the span to query
    # start_character - First character of the span to query
    # end_line        - Last line of the span to query
    #                   NOTE: this is INCLUDED in the span, i.e. up to and including this line
    # end_character   - Last character of the span to query
    #                   NOTE: this is EXCLUDED from the span, i.e. up to but not including this character)
    # language        - String language name
    # ref             - String named ref
    # ranges          - Ranges/spans that determine the locations to look up
    #
    # Returns a Twirp::ClientResp where #data is a FindReflexiveTransitiveCallersByDefiniensLocationResponse (see github/aleph/proto/lsp.proto#FindReflexiveTransitiveCallersByDefiniensLocationResponse for more info).
    def find_reflexive_transitive_callers_by_definiens_location(network_id:, repo_id:, commit_oid:, path:, start_line:, start_character:, end_line:, end_character:, language:, ref: "", backends:, ranges: [], opt_headers: {})
      if !start_line.nil?
        range = {
          start: { line: start_line, character: start_character },
          end: { line: end_line, character: end_character }
        }
        ranges.push range
      end
      req = Aleph::Proto::FindReflexiveTransitiveCallersByDefiniensLocationRequest.new(
        network_id: network_id,
        repository_id: repo_id,
        commit_oid: commit_oid,
        path: path,
        language: language,
        ref: ref,
        backends: backends,
        ranges: ranges
      )
      proxy.find_reflexive_transitive_callers_by_definiens_location(req, headers: headers.merge(opt_headers))
    end

    # Public: Get the partial call graph from an initial symbol at the given path, row, and column for the provided repository.
    #
    # network_id           - Integer id of the fork repo network
    # repo_id              - Integer repository id
    # repo_owner           - String username of repository owner
    # repo_name            - String name of repository
    # commit_oid           - String commit oid
    # path                 - String repo relative filepath
    # row                  - Integer row position of symbol
    # column               - Integer column position of symbol
    # query                - String the query symbol for the code nav request.
    # backends             - Array of string backends to query (order-sensitive).
    # actor_id             - Integer id of the user making the request.
    # request_ip           - String ip address from where the request is made.
    # access_token         - String the blackbird access token.
    # access_token_expires - Integer the expiration for the blackbird access token.
    # access_token_kind    - String the kind of access token.
    # session_id           - String the session id.
    # language             - String language name.
    #
    # Returns a Twirp::ClientResp where #data is a GetPartialCallGraphResponse (see github/aleph/proto/lsp.proto#GetPartialCallGraphResponse for more info).
    def get_partial_call_graph(root_id:, network_id:, repo_id:, repo_owner:, repo_name:, commit_oid:, path:, row:, col:, query:, backends: [], search_dependencies: false, ref:, actor_id:, request_ip:, access_token:, access_token_expires:, access_token_kind:, session_id:, language:, symbol_kind:, opt_headers: {})
      req = Aleph::Proto::TextDocumentPositionRequest.new(
        network_id: network_id,
        repository_id: repo_id,
        repository_owner: repo_owner,
        repository_name: repo_name,
        commit_oid: commit_oid,
        path: path,
        position: Aleph::Proto::Position.new(
          line: row,
          character: col,
        ),
        query: query,
        backends: backends,
        search_dependencies: search_dependencies,
        ref: ref,
        actor: Aleph::Proto::Actor.new(
          actor_id: actor_id,
          request_ip: request_ip,
          access_token: access_token,
          access_token_expires: access_token_expires,
          access_token_kind: access_token_kind,
          session_id: session_id,
        ),
        language: language,
        symbol_kind: symbol_kind,
      )
      proxy.get_partial_call_graph(req, headers: headers.merge(opt_headers))
    end

    private

    def headers
      return {} unless @hmac_key
      {
        "Request-HMAC": hmac_token
      }
    end

    def hmac_token
      timestamp = Time.now.to_i.to_s
      digest = OpenSSL::Digest::SHA256.new
      hmac = OpenSSL::HMAC.new(@hmac_key, digest)
      hmac << timestamp
      "#{timestamp}.#{hmac}"
    end
  end
end
