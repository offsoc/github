# -*- encoding: utf-8 -*-
# stub: money-open-exchange-rates 1.3.0 ruby lib

Gem::Specification.new do |s|
  s.name = "money-open-exchange-rates".freeze
  s.version = "1.3.0".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Laurent Arnoud".freeze]
  s.date = "2019-01-20"
  s.description = "A gem that calculates the exchange rate using published rates from open-exchange-rates. Compatible with the money gem.".freeze
  s.email = "laurent@spkdev.net".freeze
  s.extra_rdoc_files = ["README.md".freeze]
  s.files = ["README.md".freeze]
  s.homepage = "http://github.com/spk/money-open-exchange-rates".freeze
  s.licenses = ["MIT".freeze]
  s.required_ruby_version = Gem::Requirement.new(">= 2.2".freeze)
  s.rubygems_version = "2.7.6".freeze
  s.summary = "A gem that calculates the exchange rate using published rates from open-exchange-rates.".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<money>.freeze, ["~> 6.12".freeze])
  s.add_development_dependency(%q<minitest>.freeze, ["~> 5".freeze])
  s.add_development_dependency(%q<minitest-focus>.freeze, ["~> 1".freeze])
  s.add_development_dependency(%q<mocha>.freeze, ["~> 1.2".freeze])
  s.add_development_dependency(%q<monetize>.freeze, [">= 1.3.1".freeze, "< 2".freeze])
  s.add_development_dependency(%q<rake>.freeze, ["~> 12".freeze])
  s.add_development_dependency(%q<rubocop>.freeze, ["~> 0.63".freeze])
  s.add_development_dependency(%q<timecop>.freeze, ["~> 0.9".freeze])
  s.add_development_dependency(%q<webmock>.freeze, ["~> 3.5".freeze])
end
