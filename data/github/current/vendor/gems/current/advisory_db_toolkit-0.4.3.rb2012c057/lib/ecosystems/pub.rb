# frozen_string_literal: true

module AdvisoryDBToolkit::Ecosystems
  module Pub
    extend self
    # https://pub.dev/help/api
    API_ENDPOINT = "https://pub.dev/api/"

    # https://github.com/dart-lang/pub/blob/master/doc/repository-spec-v2.md#list-all-versions-of-a-package
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
        raise AdvisoryDBToolkit::Ecosystems::Exceptions::ApiError.new("Pub.dev API error", response:)
      end
    end

    def get_package_url(package_name)
      return nil unless package_name

      package = get_package(package_name)
      return nil unless package

      URI.join("https://pub.dev/packages/", package_name).to_s
    end
  end
end
