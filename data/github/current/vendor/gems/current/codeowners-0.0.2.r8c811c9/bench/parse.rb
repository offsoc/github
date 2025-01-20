$:.unshift File.expand_path(File.join( __dir__, "..", "lib"))

require "codeowners"
require "benchmark/ips"

text = File.read("#{__dir__}/CODEOWNERS")

Benchmark.ips do |x|
  x.report("MultibyteParser") do
    Codeowners::File.new(text, parser_class: Codeowners::MultibyteParser)
  end

  x.report("Parser") do
    Codeowners::File.new(text)
  end
end
