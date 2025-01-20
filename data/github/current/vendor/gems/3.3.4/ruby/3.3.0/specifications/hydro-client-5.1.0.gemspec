# -*- encoding: utf-8 -*-
# stub: hydro-client 5.1.0 ruby lib

Gem::Specification.new do |s|
  s.name = "hydro-client".freeze
  s.version = "5.1.0".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.metadata = { "allowed_push_host" => "https://rubygems.pkg.github.com/github", "changelog_uri" => "https://github.com/github/hydro-client-ruby", "github_repo" => "ssh://github.com/github/hydro-client-ruby", "homepage_uri" => "https://github.com/github/hydro-client-ruby", "source_code_uri" => "https://github.com/github/hydro-client-ruby" } if s.respond_to? :metadata=
  s.require_paths = ["lib".freeze]
  s.authors = ["Shreyas Joshi".freeze]
  s.date = "2024-08-16"
  s.description = "Wrapper for Hydro.".freeze
  s.email = ["shreyasjoshis@github.com".freeze]
  s.homepage = "https://github.com/github/hydro-client-ruby".freeze
  s.licenses = ["MIT".freeze]
  s.rubygems_version = "3.5.11".freeze
  s.summary = "Wrapper for Hydro.".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<activesupport>.freeze, ["> 6.0".freeze])
  s.add_runtime_dependency(%q<google-protobuf>.freeze, [">= 3.7".freeze, "< 5.0".freeze])
  s.add_runtime_dependency(%q<ruby-kafka>.freeze, [">= 1.3".freeze, "< 1.6".freeze])
  s.add_runtime_dependency(%q<zstd-ruby>.freeze, ["~> 1.5".freeze, ">= 1.5.1.1".freeze])
  s.add_runtime_dependency(%q<twirp>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<bundler>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<rake>.freeze, ["~> 13.2".freeze])
  s.add_development_dependency(%q<minitest>.freeze, ["~> 5.0".freeze])
  s.add_development_dependency(%q<grpc-tools>.freeze, ["~> 1.4".freeze])
  s.add_development_dependency(%q<webmock>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<webrick>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<rackup>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<debug>.freeze, [">= 0".freeze])
end
