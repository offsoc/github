# -*- encoding: utf-8 -*-
# stub: github-trilogy-adapter 3.0.0.r2b62ea7 ruby lib

Gem::Specification.new do |s|
  s.name = "github-trilogy-adapter".freeze
  s.version = "3.0.0.r2b62ea7".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.metadata = { "bug_tracker_uri" => "https://github.com/github/github-trilogy-adapter/issues", "changelog_uri" => "https://github.com/github/github-trilogy-adapter/blob/master/CHANGELOG.md", "source_code_uri" => "https://github.com/github/github-trilogy-adapter" } if s.respond_to? :metadata=
  s.require_paths = ["lib".freeze]
  s.authors = ["GitHub Engineering".freeze]
  s.date = "2024-08-24"
  s.email = ["opensource+trilogy@github.com".freeze]
  s.extra_rdoc_files = ["README.md".freeze, "LICENSE.md".freeze]
  s.files = ["LICENSE.md".freeze, "README.md".freeze]
  s.homepage = "https://github.com/github/github-trilogy-adapter".freeze
  s.licenses = ["MIT".freeze]
  s.required_ruby_version = Gem::Requirement.new("~> 3.0".freeze)
  s.rubygems_version = "3.5.11".freeze
  s.summary = "github/github customizations for https://github.com/github/trilogy-adapter.".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<trilogy>.freeze, [">= 2.3.0".freeze])
  s.add_runtime_dependency(%q<activerecord>.freeze, [">= 7.1.0.alpha.a".freeze])
  s.add_development_dependency(%q<minitest>.freeze, ["~> 5.11".freeze])
  s.add_development_dependency(%q<minitest-focus>.freeze, ["~> 1.1".freeze])
  s.add_development_dependency(%q<pry>.freeze, ["~> 0.10".freeze])
  s.add_development_dependency(%q<rake>.freeze, ["~> 12.3".freeze])
  s.add_development_dependency(%q<debug>.freeze, [">= 1.0.0".freeze])
end
