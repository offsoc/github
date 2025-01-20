# frozen_string_literal: true

module AdvisoryDBToolkit::Ecosystems
  module Go
    extend self
    REGISTRY_URL = "https://pkg.go.dev/"

    def get_package_page(package_name)
      return nil unless package_name
      return nil if package_name == "search"

      url = URI.join(REGISTRY_URL, package_name)
      response = AdvisoryDBToolkit::PackageUrlObtainer.http_client.get(url)
      case response.status
      when 200
        response
      when 404
        nil
      else
        raise AdvisoryDBToolkit::Ecosystems::Exceptions::ApiError.new("Go API error", response:)
      end
    end

    def get_package_url(package_name)
      return nil unless package_name

      package_page = get_package_page(package_name)
      return nil unless package_page

      package_page.env.url.to_s
    end
  end
end
