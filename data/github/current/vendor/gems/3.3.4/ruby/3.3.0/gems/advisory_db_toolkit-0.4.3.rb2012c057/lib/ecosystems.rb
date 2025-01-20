# frozen_string_literal: true

module AdvisoryDBToolkit
  module Ecosystems
    # As of OSV Schema Version 1.1.0
    # https://ossf.github.io/osv-schema/#affectedpackage-field
    ECOSYSTEM_OSV_MAP = {
      "actions" => "GitHub Actions",
      "composer" => "Packagist",
      "erlang" => "Hex",
      "go" => "Go",
      "maven" => "Maven",
      "npm" => "npm",
      "nuget" => "NuGet",
      "other" => nil, # Not currently supported by OSV
      "pip" => "PyPI",
      "pub" => "Pub",
      "rubygems" => "RubyGems",
      "rust" => "crates.io",
      "swift" => "SwiftURL",

      # These are PURL types that are not officially supported by OSV, but we
      # still want to be able to publish them so we've agreed with our Google
      # counterparts that we will prefix these with `purl-type:` until official
      # support is added.
      "alpm" => "purl-type:alpm",
      "apk" => "purl-type:apk",
      "bitbucket_repository" => "purl-type:bitbucket-repository",
      "cocoapods" => "purl-type:cocoapods",
      "conan_center" => "purl-type:conan-center",
      "conda_forge" => "purl-type:conda-forge",
      "cran" => "purl-type:cran",
      "deb" => "purl-type:deb",
      "docker_hub" => "purl-type:docker-hub",
      "generic" => "purl-type:generic",
      "github_repository" => "purl-type:github-repository",
      "hackage" => "purl-type:hackage",
      "huggingface" => "purl-type:huggingface",
      "mlflow" => "purl-type:mlflow",
      "qpkg" => "purl-type:qpkg",
      "oci" => "purl-type:oci",
      "rpm" => "purl-type:rpm",
      "swid" => "purl-type:swid",
    }.freeze

    def self.ghsa_to_osv_ecosystem(ecosystem)
      ECOSYSTEM_OSV_MAP[ecosystem]
    end

    def self.osv_to_ghsa_ecosystem(ecosystem)
      ECOSYSTEM_OSV_MAP.key(ecosystem)
    end
  end
end
