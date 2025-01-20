  require 'rubygems'
  spec = eval(File.read("aqueduct-client.gemspec"), nil, "aqueduct-client.gemspec")
  spec.version = "1.1.0"
  spec
