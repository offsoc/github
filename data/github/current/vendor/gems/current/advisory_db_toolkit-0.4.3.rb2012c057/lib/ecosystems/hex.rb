# frozen_string_literal: true

module AdvisoryDBToolkit::Ecosystems
  module Hex
    extend self
    # https://hexpm.docs.apiary.io/#
    API_ENDPOINT = "https://hex.pm/api/"

    # https://hexpm.docs.apiary.io/#reference/packages/package/fetch-a-package
    def get_package(package_name)
      return nil unless package_name

      url = URI.join(API_ENDPOINT, "packages/#{package_name}")
      response = AdvisoryDBToolkit::PackageUrlObtainer.http_client.get(url)
      case response.status
      when 200
        JSON.parse response.body
      when 404
        nil
      else
        raise AdvisoryDBToolkit::Ecosystems::Exceptions::ApiError.new("Hex API error", response:)
      end
    end

    def get_package_url(package_name)
      return nil unless package_name

      package = get_package(package_name)
      return nil unless package

      package["html_url"]
    end
  end
end
