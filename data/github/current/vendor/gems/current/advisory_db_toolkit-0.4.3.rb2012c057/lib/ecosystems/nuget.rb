# frozen_string_literal: true

module AdvisoryDBToolkit::Ecosystems
  module Nuget
    extend self
    CACHE_KEY_ROOT = "ecosystem_api_nuget"
    CACHE_TTL = 3600 # 1.hour

    API_ENDPOINT = "https://api.nuget.org/v3/"

    def api(route, params: {})
      url = URI.join(API_ENDPOINT, route)
      AdvisoryDBToolkit::PackageUrlObtainer.http_client.get(url, params)
    end

    # https://learn.microsoft.com/en-us/nuget/api/registration-base-url-resource
    def get_package_metadata(package_name)
      return nil unless package_name

      url = URI.join(registration_index, "#{package_name.downcase}/index.json")
      response = AdvisoryDBToolkit::PackageUrlObtainer.http_client.get(url)
      case response.status
      when 200
        JSON.parse response.body
      when 404
        nil
      else
        raise AdvisoryDBToolkit::Ecosystems::Exceptions::ApiError.new("NuGet API error", response:)
      end
    end

    def get_package_url(package_name)
      return nil unless package_name

      metadata = get_package_metadata(package_name)
      return nil unless metadata

      URI.join("https://www.nuget.org/packages/", package_name).to_s
    end

    private

    def registration_index
      cache_key = cache_key("registration_base_url")
      with_cache(cache_key) do
        registration_index = nil
        service_index["resources"].each do |resource|
          registration_index = resource["@id"] if resource["@type"] == "RegistrationsBaseUrl"
        end
        registration_index
      end
    end

    # https://learn.microsoft.com/en-us/nuget/api/service-index
    def service_index
      response = api("index.json")
      case response.status
      when 200
        JSON.parse response.body
      else
        raise AdvisoryDBToolkit::Ecosystems::Exceptions::ApiError.new("NuGet API error", response:)
      end
    end

    def cache_key(endpoint_specific)
      [AdvisoryDBToolkit.cache_prefix_key, CACHE_KEY_ROOT, ENV["RAILS_ENV"], endpoint_specific].join(":")
    end

    def with_cache(key)
      cached_value = AdvisoryDBToolkit.cache.get(key)
      AdvisoryDBToolkit.logger.debug { "found '#{cached_value}' at #{key}" }
      return JSON.parse(cached_value)["value"] if AdvisoryDBToolkit::Utility.present?(cached_value)

      value = yield
      AdvisoryDBToolkit.logger.debug { "storing '#{{ value: value }.to_json}' to #{key}" }
      AdvisoryDBToolkit.cache.set(key, { value: value }.to_json, ex: CACHE_TTL)
      value
    end
  end
end
