#!/usr/bin/env ruby
# typed: true
# frozen_string_literal: true

require "json"
require "csv"

memsize_by_type          = Hash.new 0
count_by_type            = Hash.new 0
memsize_by_file_and_line = Hash.new 0
count_by_file_and_line   = Hash.new 0
memsize_by_library       = Hash.new 0
count_by_library         = Hash.new 0

## Stolen from profile-boot.rb
NORMALIZE_ROOTS = [
  "#{RbConfig::CONFIG["rubylibdir"]}/",
  "#{Gem.dir}/gems/",
  "#{ENV["RAILS_ROOT"]}/",
]

def normalize_file(f)
  return f unless f
  NORMALIZE_ROOTS.each do |root|
    return f[root.size, 9999] if f.start_with?(root)
  end
  f
end

def normalize_library(f)
  if f.start_with?("#{Gem.dir}/gems/")
    normalize_file(f)[/[^\/]*/]
  else
    normalize_file(f)
  end
end

## End of theft

total_memsize = 0
total_objects = 0

File.open(ARGV[0]) do |f|
  f.each_line do |line|
    slot = JSON.parse line

    type = slot["type"]
    if type == "IMEMO"
      type = slot["imemo_type"]
    elsif type == "DATA"
      type = slot["struct"] || "DATA"
    end

    # These objects exist only because we've enabled allocation tracing, so
    # skip over them in reporting
    if type == "ObjectTracing/allocation_info_tracer"
      next
    end

    memsize = slot["memsize"] || 0 # Roots don't have a memsize
    total_memsize += memsize
    memsize_by_type[type] += memsize
    count_by_type[type] += 1
    total_objects += 1

    if slot["file"]
      file = normalize_file(slot["file"])
      library = normalize_library(slot["file"])
      line = slot["line"]
      memsize_by_file_and_line[[file, line]] += memsize
      count_by_file_and_line[[file, line]] += 1
      memsize_by_library[library] += memsize
      count_by_library[library] += 1
    end
  end
end

puts "::group::Allocations By Type"
CSV do |out|
  out << %w{ type memsize count }
  memsize_by_type.sort_by { |_, v| v }.reverse_each do |type, size|
    out << [type, size, count_by_type[type]]
  end
end
puts "::endgroup::"
puts

total_memsize = total_memsize.to_f
total_objects = total_objects.to_f

puts "::group::Top 50 Allocations By Location"
CSV do |out|
  out << %w{ file line memsize count memory_pct count_pct }
  memsize_by_file_and_line.sort_by { |_, v| v }.last(50).reverse_each do |file_and_line, size|
    count = count_by_file_and_line[file_and_line]
    out << file_and_line + [size, count, size / total_memsize, count / total_objects]
  end
end
puts "::endgroup::"

puts "::group::Top 50 Allocations By Library"
CSV do |out|
  out << %w{ library memsize count memory_pct count_pct }
  memsize_by_library.sort_by { |_, v| v }.last(50).reverse_each do |library, size|
    count = count_by_library[library]
    out << [library, size, count, size / total_memsize, count / total_objects]
  end
end
puts "::endgroup::"
