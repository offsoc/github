  require 'rubygems'
  spec = eval(File.read("meuse-client.gemspec"), nil, "meuse-client.gemspec")
  spec.version = "1.16.0"
  spec
