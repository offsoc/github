require 'rake'
require 'rake/testtask'
require 'rake/rdoctask'
require 'rake/gempackagetask'

desc 'Generate documentation for the expression_parser plugin.'
Rake::RDocTask.new(:rdoc) do |rdoc|
  rdoc.rdoc_dir = 'rdoc'
  rdoc.title    = 'expression_parser'
  rdoc.options << '--line-numbers' << '--inline-source'
  rdoc.rdoc_files.include('README')
  rdoc.rdoc_files.include('lib/**/*.rb')
end

spec = Gem::Specification.new do |s|
  s.name = "expression_parser"
  s.version = "0.9.0"
  s.author = "Lukasz Wrobel"
  s.homepage = "http://lukaszwrobel.pl/blog/math-parser-part-3-implementation"
  s.platform = Gem::Platform::RUBY
  s.summary = "A math parser"
  s.files = FileList["{lib}/**/*"].to_a +
    ["Rakefile","parser_spec.rb"]
  s.require_path = "lib"
  s.description = File.read("README")
  s.has_rdoc = false
  s.extra_rdoc_files = ["README"]
  s.description = %q{math parser}
end
Rake::GemPackageTask.new(spec) do |pkg|
    pkg.need_tar = true
end
