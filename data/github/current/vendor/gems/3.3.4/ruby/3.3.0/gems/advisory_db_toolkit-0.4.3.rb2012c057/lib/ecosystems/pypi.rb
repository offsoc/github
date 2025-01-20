# frozen_string_literal: true

module AdvisoryDBToolkit::Ecosystems
  module Pypi
    extend self
    # https://warehouse.pypa.io/api-reference/json.html
    JSON_API_ENDPOINT = "https://pypi.org/pypi/"

    # https://warehouse.pypa.io/api-reference/json.html#project
    def get_project(project_name)
      return nil unless project_name

      project_url = URI.join(JSON_API_ENDPOINT, "#{project_name}/json")
      res = AdvisoryDBToolkit::PackageUrlObtainer.http_client.get(project_url)
      case res.status
      when 200
        JSON.parse res.body
      when 404
        nil
      else
        raise AdvisoryDBToolkit::Ecosystems::Exceptions::ApiError.new("PyPI API error", response: res)
      end
    end

    def get_package_url(package_name)
      return nil unless package_name

      project = get_project(package_name)
      project&.dig("info", "package_url")
    end
  end
end
