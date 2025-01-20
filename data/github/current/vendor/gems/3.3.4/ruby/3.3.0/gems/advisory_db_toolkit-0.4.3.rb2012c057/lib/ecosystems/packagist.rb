# frozen_string_literal: true

module AdvisoryDBToolkit::Ecosystems
  module Packagist
    extend self
    # https://packagist.org/apidoc
    METADATA_ENDPOINT = "https://repo.packagist.org/p2/"

    # https://packagist.org/apidoc#get-package-data
    def get_package_metadata(package_name)
      return nil unless package_name

      url = URI.join(METADATA_ENDPOINT, "#{package_name}.json")
      response = AdvisoryDBToolkit::PackageUrlObtainer.http_client.get(url)
      case response.status
      when 200
        JSON.parse response.body
      when 404
        nil
      else
        raise AdvisoryDBToolkit::Ecosystems::Exceptions::ApiError.new("Packagist API error", response:)
      end
    end

    def get_package_url(package_name)
      return nil unless package_name

      metadata = get_package_metadata(package_name)
      return nil unless metadata

      URI.join("https://packagist.org/packages/", package_name).to_s
    end
  end
end
