$:.unshift File.expand_path(File.join( __dir__, "..", "lib"))

require "timeout"
require "benchmark"
require "codeowners"

Codeowners::Parser.const_set(:WILDCARD_LIMIT, 150)

MALICIOUS_PATTERN = "a*a*a*a*a*a*a*a*a*a*a*aa*a*a*a*a*a*a*a*a*a*a*aa*a*a*a*a*a*a*a*a*a*a*aa*a*a*a*a*a*a*a*a*a*a*aa*a*a*a*a*a*a*a*a*a*a*aa*a*a*a*a*a*a*a*a*a*a*aa*a*a*a*a*a*a*a*a*a*a*aa*a*a*a*a*a*a*a*a*a*a*aa*a*a*a*a*a*a*a*a*a*a*aa*a*a*a*a*a*a*a*a*a*a*aa*a*a*a*a*a*a*a*a*a*a*"
MALICIOUS_PATH = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaab"

results = []

MALICIOUS_PATTERN.split("*").reduce("ab @monalisa") do |pattern, part|
  putc "."
  pattern = "#{part}*#{pattern}".strip
  count = pattern.count("*")

  benchmark = begin
    Timeout.timeout(5) do
      Benchmark.measure { Codeowners::File.new(pattern).match(MALICIOUS_PATH) }
    end
  rescue Timeout::Error
    putc "X"
    break
  end

  results << ["#{count} - #{pattern.split(" ").first}", benchmark]
  pattern
end

puts "\n\n"

width = results.last.first.strip.length

puts "#{"Pattern".ljust(width)}   #{Benchmark::CAPTION.strip}"

results.each do |(pattern, result)|
  puts "#{pattern.strip.ljust(width)} #{result}"
end
