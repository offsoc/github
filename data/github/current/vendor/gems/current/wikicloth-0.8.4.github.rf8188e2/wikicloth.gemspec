# -*- encoding: utf-8 -*-
lib = File.expand_path('../lib/', __FILE__)
$:.unshift lib unless $:.include?(lib)

require 'wikicloth/version'

spec = Gem::Specification.new do |s|
  s.name = "wikicloth"
  s.version = WikiCloth::VERSION
  s.author = "David Ricciardi"
  s.email = "nricciar@gmail.com"
  s.homepage = "https://github.com/github/wikicloth"
  s.platform = Gem::Platform::RUBY
  s.summary = "An implementation of the mediawiki markup in ruby"
  s.files = `git ls-files`.split("\n")
  s.test_files = `git ls-files -- {test,spec,features}/*`.split("\n")
  s.require_path = "lib"
  s.description = File.read("README")
  s.has_rdoc = false
  s.extra_rdoc_files = ["README","MIT-LICENSE"]
  s.description = %q{mediawiki parser}
  s.license = "MIT"
  s.add_dependency 'builder', '~> 3.2'
  s.add_dependency 'expression_parser', '~> 0.9.0'
  s.add_dependency 'rinku', '~> 2.0'
  s.add_dependency 'i18n', '~> 1.7'
  s.add_development_dependency 'test-unit', '~> 3.2.1'
  s.add_development_dependency 'activesupport', '~> 5.0.0'
  s.add_development_dependency 'rake', '~> 11.2.2'
  s.add_development_dependency 'rdoc', '~> 4.2.2'
  s.add_development_dependency "simplecov", '0.12.0'
end
