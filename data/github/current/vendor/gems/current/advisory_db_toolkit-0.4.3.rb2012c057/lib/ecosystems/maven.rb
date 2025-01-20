# frozen_string_literal: true

module AdvisoryDBToolkit::Ecosystems
  module Maven
    extend self
    # https://central.sonatype.org/search/rest-api-guide/
    API_ENDPOINT = "https://search.maven.org/solrsearch/select"

    def api(params)
      AdvisoryDBToolkit::PackageUrlObtainer.http_client.get(API_ENDPOINT, params)
    end

    def get_artifact_by_group_id(artifact_name, group_id)
      return nil unless artifact_name && group_id

      search_coords = format_search_options({ a: artifact_name, g: group_id })
      res = api({ q: search_coords })
      case res.status
      when 200
        res_body = JSON.parse res.body
        return nil unless res_body&.dig("response", "numFound") == 1

        res_body.dig("response", "docs").first
      else
        raise AdvisoryDBToolkit::Ecosystems::Exceptions::ApiError.new("Maven API error", response: res)
      end
    end

    # package_name should be formatted like group_id:artifact_name
    def get_package_url(package_name)
      return nil unless package_name

      split_package = package_name.split(":")
      return nil unless split_package.count == 2

      group_id = split_package[0]
      artifact_name = split_package[1]
      artifact = get_artifact_by_group_id(artifact_name, group_id)
      return nil unless artifact

      URI.join("https://central.sonatype.com", "artifact/#{group_id}/#{artifact_name}/#{artifact["latestVersion"]}").to_s
    end

    private

    # Formats a hash of search options for Maven Central Repository Search into a string
    # Hash keys for common search option include:
    #  - Group -> g
    #  - Artifact -> a
    #  - Version -> v
    # See "Advanced Options" on https://search.maven.org/ For more options
    def format_search_options(options)
      options.map { |k, v| "#{k}:#{v}" }.join(" AND ")
    end
  end
end
