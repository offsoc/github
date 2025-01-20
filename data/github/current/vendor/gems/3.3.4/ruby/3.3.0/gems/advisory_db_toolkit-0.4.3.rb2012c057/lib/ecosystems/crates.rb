# frozen_string_literal: true

module AdvisoryDBToolkit::Ecosystems
  module Crates
    extend self
    # https://doc.rust-lang.org/nightly/cargo/reference/registries.html#web-api
    REGISTRY_URL = "https://crates.io/api/v1/"

    def get_crate(package_name)
      return nil unless package_name

      url = URI.join(REGISTRY_URL, "crates/#{package_name}")
      response = AdvisoryDBToolkit::PackageUrlObtainer.http_client.get(
        url,
        nil,
        {
          "User-Agent" => "GitHub Advisory Database (advisory-database@github.com)",
        },
      )
      case response.status
      when 200
        hash = JSON.parse response.body
        if AdvisoryDBToolkit::Utility.present?(hash["errors"])
          AdvisoryDBToolkit.logger.info(
            "error occurred while fetching crate information",
            "gh.advisory_inbox.crates.package_name": package_name,
            "gh.advisory_inbox.crates.errors": hash["errors"],
          )
          nil
        else
          hash
        end
      when 404
        nil
      else
        raise AdvisoryDBToolkit::Ecosystems::Exceptions::ApiError.new("crates.io API error", response:)
      end
    end

    def get_package_url(package_name)
      return nil unless package_name

      package = get_crate(package_name)
      return nil unless package

      URI.join("https://crates.io/crates/", package_name).to_s
    end
  end
end
