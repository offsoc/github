# -*- encoding: utf-8 -*-
# stub: zstd-ruby 1.5.1.1 ruby lib
# stub: ext/zstdruby/extconf.rb

Gem::Specification.new do |s|
  s.name = "zstd-ruby".freeze
  s.version = "1.5.1.1".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["SpringMT".freeze]
  s.bindir = "exe".freeze
  s.date = "2021-12-28"
  s.description = "Ruby binding for zstd(Zstandard - Fast real-time compression algorithm). See https://github.com/facebook/zstd".freeze
  s.email = ["today.is.sky.blue.sky@gmail.com".freeze]
  s.extensions = ["ext/zstdruby/extconf.rb".freeze]
  s.files = ["ext/zstdruby/extconf.rb".freeze]
  s.homepage = "https://github.com/SpringMT/zstd-ruby".freeze
  s.licenses = ["MIT".freeze]
  s.rubygems_version = "3.3.3".freeze
  s.summary = "Ruby binding for zstd(Zstandard - Fast real-time compression algorithm)".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_development_dependency(%q<bundler>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<rake>.freeze, ["~> 13.0".freeze])
  s.add_development_dependency(%q<rake-compiler>.freeze, ["~> 1".freeze])
  s.add_development_dependency(%q<rspec>.freeze, ["~> 3.0".freeze])
end
