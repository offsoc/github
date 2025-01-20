module AdvisoryDBToolkit
  class PackageUrlObtainer

    SUPPORTED_ECOSYSTEMS = {
      "actions" => AdvisoryDBToolkit::Ecosystems::Actions,
      "composer" => AdvisoryDBToolkit::Ecosystems::Packagist,
      "erlang" => AdvisoryDBToolkit::Ecosystems::Hex,
      "go" => AdvisoryDBToolkit::Ecosystems::Go,
      "maven" => AdvisoryDBToolkit::Ecosystems::Maven,
      "npm" => AdvisoryDBToolkit::Ecosystems::NPM,
      "nuget" => AdvisoryDBToolkit::Ecosystems::Nuget,
      "pip" => AdvisoryDBToolkit::Ecosystems::Pypi,
      "pub" => AdvisoryDBToolkit::Ecosystems::Pub,
      "rubygems" => AdvisoryDBToolkit::Ecosystems::RubyGems,
      "rust" => AdvisoryDBToolkit::Ecosystems::Crates,

    }

    def self.supported_ecosystem?(ecosystem)
      !SUPPORTED_ECOSYSTEMS[ecosystem].nil?
    end
    
    def self.get_url(ecosystem, package_name, http_client)
      @http_client = http_client
      SUPPORTED_ECOSYSTEMS[ecosystem]&.get_package_url(package_name)
    end

    def self.http_client=(http_client)
      http_client.respond_to?(:get) || raise(ArgumentError, "HTTP client must implement get method")
      @http_client = http_client
    end

    def self.http_client
      raise "HTTP client not set" unless @http_client
      @http_client
    end
  end
end