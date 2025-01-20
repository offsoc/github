module AdvisoryDBToolkit
  class FQNSearchKeysAdapter
    attr_reader :log_verbose, :log_errors_only

    def initialize(log_verbose: false, log_errors_only: false, client: nil, **aleph_options)
      @client = client || AlephVEA::InboxClient.new
      @log_verbose = log_verbose
      @log_errors_only = log_errors_only
      raise StandardError, "Only one of log_verbose and log_errors_only can be true" if log_verbose && log_errors_only
    end

    def replicate_v1_to_v0(ghsa_id, advisory_payload)
      vulnerabilities_payload = advisory_payload["vulnerabilities"]
      return if vulnerabilities_payload.blank?

      vulnerabilities_payload.each do |vulnerability_index, vulnerability_payload|
        # Skip if there are no FQNs.
        next if vulnerability_payload["affected_functions_v1"].blank?

        count_of_functions = vulnerability_payload["affected_functions_v1"]&.count { |_index, af| af.present? && af["fqn"].present? }
        next unless count_of_functions.present? && count_of_functions > 0

        # This transition is only valid for python today.
        vulnerability_payload["affected_functions_v1"] = case AdvisoryDB.ghsa_ecosystem_to_aleph_language(vulnerability_payload["ecosystem"])&.first
        when "python"
          replicate_v1_to_v0_for_python(ghsa_id, vulnerability_payload["affected_functions_v1"])
        else
          # Unchanged if it's not Python.
          puts "Skipping vulnerability in ecosystem #{vulnerability_payload["ecosystem"]}" if log_verbose
          vulnerability_payload["affected_functions_v1"]
        end
      end

      vulnerabilities_payload
    end

    def to_fqn_v1(ghsa_id, advisory_payload)
      vulnerabilities_payload = advisory_payload["vulnerabilities"]
      return if vulnerabilities_payload.blank?

      vulnerabilities_payload.each do |vulnerability_index, vulnerability_payload|
        # Skip if there are no FQNs.
        next if vulnerability_payload["affected_functions_v1"].blank?

        count_of_functions = vulnerability_payload["affected_functions_v1"]&.count { |_index, af| af.present? && af["fqn"].present? }
        next unless count_of_functions.present? && count_of_functions > 0

        # Each ecosystem can have multiple languages, but right now we only care about pip and JS which correspond 1:1.
        vulnerability_payload["affected_functions_v1"] = case AdvisoryDB.ghsa_ecosystem_to_aleph_language(vulnerability_payload["ecosystem"])&.first
        when "python"
          for_python(@client, ghsa_id, vulnerability_payload["affected_functions_v1"], vulnerability_payload["fix_commits"]&.compact_blank)
        when "javascript"
          puts "Skipping vulnerability in ecosystem npm" if log_verbose
          vulnerability_payload["affected_functions_v1"]
        else
          # Unchanged if it's not Python or JS.
          puts "Skipping vulnerability in ecosystem #{vulnerability_payload["ecosystem"]}" if log_verbose
          vulnerability_payload["affected_functions_v1"]
        end
      end

      vulnerabilities_payload
    end

    private

    def get_nwo_and_sha(commit_url)
      # The URL may be in two forms:
      # - https://github.com/<user/repo>/commit/<commit_sha>
      # - https://github.com/<user/repo>/pulls/pr_number/commits/<commit_sha>
      matches = /\/(?<repo_nwo>[^\/]+\/[^\/]+)\/(pull\/\d+\/)?commits?\/(?<commit_sha>\w+)/.match(commit_url) 

      if matches.blank? || matches[:repo_nwo].blank? || matches[:commit_sha].blank?
        return nil, nil, false
      end

      return matches[:repo_nwo], matches[:commit_sha], true
    end

    def replicate_v1_to_v0_for_python(ghsa_id, affected_functions_v1)      
      new_affected_functions = {}
      index = 0

      affected_functions_v1.each do |_, fqn_info|
        # Sometimes we have blank FQNs - we don't need to preserve these.
        next if fqn_info["fqn"].blank?

        # If it's a v1 FQN, we should keep it and make sure it has a v0 entry. this is only valid for pip
        if fqn_info["fqn_version"] == 1
          new_affected_functions[index] = fqn_info
          index += 1

          matching_fqn0 = affected_functions_v1.values.filter do |value|
            value["fqn"] == fqn_info["fqn"] && value["fqn_version"] == 0
          end

          if matching_fqn0.blank?
            fqn_info = fqn_info.deep_dup
            fqn_info["fqn_version"] = 0
            fqn_info["search_keys"] = []
            new_affected_functions[index] = fqn_info
            index += 1
          end

          next
        else
          new_affected_functions[index] = fqn_info
          index += 1
        end
      end

      new_affected_functions
    end

    def for_python(client, ghsa_id, affected_functions_v1, fix_commit_urls)
      # Sometimes fix_commit_urls is empty
      puts "GHSA #{ghsa_id} affected_functions_v1 had a FQN inside of it, but no fix commit." if fix_commit_urls.blank? && !log_errors_only
      return affected_functions_v1 if fix_commit_urls.blank?
      
      new_affected_functions = {}
      index = 0

      affected_functions_v1.each do |_, fqn_info|
        # Sometimes we have blank FQNs - we don't need to preserve these.
        next if fqn_info["fqn"].blank?

        # If it's a v1 FQN, we should keep it.
        if fqn_info["fqn_version"] == 1
          new_affected_functions[index] = fqn_info
          index += 1
          next
        end

        symbol_info = nil
        # Find the first commit that has the desired function.
        fix_commit_urls.each do |commit_url|
          repo_nwo, commit_sha, successful = get_nwo_and_sha(commit_url)
          if !successful
            puts "commit url #{commit_url} failed to be parsed as a github commit"
            next
          end

          was_indexed_successfully = wait_for_repo_to_index(client, repo_nwo, commit_sha)
          if !was_indexed_successfully
            puts "ghsa #{ghsa_id}: for repo #{repo_nwo} and commit url #{commit_url} failed to be indexed"
            next
          end

          puts "calling aleph with nwo #{repo_nwo} fqn #{fqn_info["fqn"]} commit #{commit_sha}" if log_verbose
          response = client.get_symbol_info(nwo: repo_nwo, fqn: fqn_info["fqn"], language: "python", commit_oid: commit_sha)

          # No data in response object means this FQN was not found in the commit.
          puts "response data was blank" if response.data.blank?
          next if response.data.blank?
          puts "no symbols were returned for get_symbol_info, response was: #{response.data.to_h}" if response.data.symbols.blank?
          next if response.data.symbols.blank?

          valid_symbol_infos = response.data.symbols.filter {|s| s.search_keys.to_a.count > 0}
          puts "Multiple valid symbols present for #{fqn_info["fqn"]} in #{repo_nwo} at #{commit_sha}" if valid_symbol_infos.count > 1
          if valid_symbol_infos.count < 1
            puts "One iteration produced no valid symbol infos for #{fqn_info["fqn"]} in #{repo_nwo} at #{commit_sha}"
            next
          end
  
          puts "found a valid symbol #{symbol_info.to_h}" if log_verbose
          symbol_info = valid_symbol_infos.first
          break
        end
        
        old_fqn = fqn_info["fqn"]
        # If no symbol info is found for a v0 FQN, retain it.
        new_affected_functions[index] = if symbol_info
          puts "populating found symbol" if log_verbose
          found_fqn = symbol_info.fully_qualified_names.first
          puts "found symbol FQN was different than old fqn. New: #{found_fqn} Old: #{old_fqn}" if found_fqn != old_fqn && !log_errors_only
          {
            fqn: symbol_info.fully_qualified_names.first,
            search_keys: symbol_info.search_keys.to_a,
            fqn_version: 1,
          }
        else
          puts "GHSA #{ghsa_id} No symbols found for #{fqn_info["fqn"]}"
          fqn_info
        end

        index += 1
      end

      new_affected_functions
    end

    def for_javascript(client, vulnerability_payload, fix_commit_urls)
      # For now, just return the original payload - we have no idea how to transition javascript.
      vulnerability_payload["affected_functions_v1"]
    end

    def wait_for_repo_to_index(client, nwo, commit_oid)
      repo_info = client.get_repo_info(nwo: nwo)
      client.request_repo_be_indexed(nwo: nwo, commit_oid: commit_oid)
  
      timeout_seconds = 30
      started_at = Time.now
      response = client.indexing_status(nwo: nwo, repo_info: repo_info, commit_oid: commit_oid)
      if response.data
        indexing_status = response.data.result.status
      
        while indexing_status == :INDEXING_ENQUEUED || indexing_status == :INDEXING_IN_PROGRESS
          response = client.indexing_status(nwo: nwo, repo_info: repo_info, commit_oid: commit_oid)
          if !response.data
            puts "Indexing returned an unexpected result for #{nwo} at commit #{commit_oid}"
            break
          end

          indexing_status = response.data.result.status

          sleep 3
          if Time.now - started_at > timeout_seconds
            puts "Indexing didn't finish within #{timeout_seconds} seconds for #{nwo} at commit #{commit_oid}"
            break
          end
        end
      else
        puts "Didn't get an expected response for indexing request for #{nwo} at commit #{commit_oid}"
      end

      if indexing_status != :INDEXED_SUCCESSFULLY
        puts "Indexing didn't complete as expected (#{indexing_status.to_s}) for #{nwo} at commit #{commit_oid}"
        return false
      end
  
      return true
    rescue StandardError => error
      puts "Indexing threw an unexpected exception for #{nwo} at commit #{commit_oid}"
      puts error.full_message
      return false
    end
  end
end
