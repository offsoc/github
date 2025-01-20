# frozen_string_literal: true

module AdvisoryDBToolkit::Ecosystems
  module Actions
    extend self
    API_ENDPOINT = "https://api.github.com/repos/"

    # https://docs.github.com/en/rest/repos/repos#get-a-repository
    def get_repo(package_name)
      return nil unless package_name

      url = URI.join(API_ENDPOINT, package_name)
      response = AdvisoryDBToolkit::PackageUrlObtainer::http_client.get(url)
      case response.status
      when 200
        JSON.parse response.body
      when 404
        nil
      else
        raise AdvisoryDBToolkit::Ecosystems::Exceptions::ApiError.new("Actions API error", response:)
      end
    end

    def get_package_url(package_name)
      return nil unless package_name

      repo = get_repo(package_name)
      return nil unless repo

      repo["html_url"]
    end
  end
end
