# frozen_string_literal: true

module AdvisoryDBToolkit::Ecosystems
  module RubyGems
    extend self
    # https://guides.rubygems.org/rubygems-org-api/
    API_ENDPOINT = "https://rubygems.org/api/v1/"

    def api(route, params: {})
      url = URI.join(API_ENDPOINT, route)
      AdvisoryDBToolkit::PackageUrlObtainer.http_client.get(url, params)
    end

    # https://guides.rubygems.org/rubygems-org-api/#gem-methods
    def get_gem(gem_name)
      return nil unless gem_name

      res = api("gems/#{gem_name}.json")
      case res.status
      when 200
        JSON.parse res.body
      when 404
        nil
      else
        raise AdvisoryDBToolkit::Ecosystems::Exceptions::ApiError.new("RubyGems API error", response: res)
      end
    end

    def get_package_url(package_name)
      return nil unless package_name

      gem = get_gem(package_name)
      gem&.dig("project_uri")
    end
  end
end
