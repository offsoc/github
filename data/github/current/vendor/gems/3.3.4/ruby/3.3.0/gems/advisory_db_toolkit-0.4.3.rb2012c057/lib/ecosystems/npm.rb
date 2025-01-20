# frozen_string_literal: true

module AdvisoryDBToolkit::Ecosystems
  module NPM
    extend self

    API_ENDPOINT = "https://registry.npmjs.org"

    def api(route, params: {})
      url = URI.join(API_ENDPOINT, route)
      AdvisoryDBToolkit::PackageUrlObtainer.http_client.get(url, params)
    end

    def get_package_info(package_name)
      return nil unless package_name

      res = api(package_name)
      case res.status
      when 200
        JSON.parse res.body
      when 404
        nil
      else
        raise AdvisoryDBToolkit::Ecosystems::Exceptions::ApiError.new("npm API error", response: res)
      end
    end

    def get_package_url(package_name)
      return nil unless package_name

      res = api(package_name)
      case res.status
      when 200
        URI.join("https://www.npmjs.com/package/", package_name).to_s
      when 404
        nil
      else
        raise AdvisoryDBToolkit::Ecosystems::Exceptions::ApiError.new("npm API error", response: res)
      end
    end
  end
end
