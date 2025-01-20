#!/usr/bin/env ruby
# typed: true
# frozen_string_literal: true

require "./config/basic"
require "./config/environment"
require "objspace"

GC.start

stats = GC.stat
memrss = GitHub::Memory.memrss
all_objects = ObjectSpace.each_object.to_a

def print_table(table, heading: nil)
  table = table.to_a if table.is_a?(Hash)
  table.unshift(heading) if heading
  table = table.map { |row| row.map(&:to_s) }
  widths = table[0].zip(*table[1..]).map { |col| col.map(&:size).max }
  widths.map! { |w| w < 100 ? w : 100 }

  fmt = widths.map { |w| "%#{w}s" }.join(" | ")
  if heading
    head_str = fmt % table.shift
    puts head_str
    puts "-" * head_str.size
  end
  table.each do |row|
    puts fmt % row
  end
end

NORMALIZE_ROOTS = [
  "#{RbConfig::CONFIG["rubylibdir"]}/",
  "#{Gem.dir}/gems/",
  "#{ENV["RAILS_ROOT"]}/",
]

def normalize_file(f)
  return f unless f
  NORMALIZE_ROOTS.each do |root|
    return f[root.size, 9999] if f.starts_with?(root)
  end
  f
end

puts
puts "Total memory:"
puts "#{(memrss / 1024.0 / 1024.0).round}MB (#{memrss} bytes)"

puts
puts "GC statistics:"
print_table GC.stat

puts
puts "Heap statistics:"
heap_keys = %i[slot_size heap_allocatable_pages heap_eden_pages heap_eden_slots]
heap_table = GC.stat_heap.map do |idx, h|
  [idx, *h.values_at(*heap_keys)]
end
print_table heap_table, heading: [:idx, *heap_keys]

puts
puts "Object usage:"
object_counts = ObjectSpace.count_objects
object_sizes = ObjectSpace.count_objects_size
print_table object_counts.map { |(type, count)| [type, count, object_sizes[type]]  }, heading: ["TYPE", "count", "total bytes"]

puts
puts "T_IMEMO usage:"
print_table ObjectSpace.count_imemo_objects.sort_by(&:last), heading: %w[imemo_type count]

puts
puts "T_DATA usage:"
print_table ObjectSpace.count_tdata_objects.sort_by(&:last).last(10), heading: %w[class count]

puts
puts "Top classes:"

original_class_method = Kernel.instance_method(:class)

print_table all_objects.group_by { |obj| original_class_method.bind_call(obj) }.transform_values(&:count).sort_by(&:last).last(20).map { |(klass, count)| [klass, count, ObjectSpace.memsize_of_all(klass)] }, heading: ["class", "count", "total bytes"]

puts
puts "Top strings"
print_table T.cast(all_objects.grep(String), T::Array[String]).group_by(&:itself).sort_by { |_, strings| strings.map { ObjectSpace.memsize_of(_1) }.sum }.last(20).map { |(value, strings)| [value.inspect, strings.count, strings.map { ObjectSpace.memsize_of(_1) }.sum] }, heading: ["value", "count", "total bytes"]

# Allow GC of all_objects
all_objects = nil
GC.start

puts
puts "GC Profile"
GC::Profiler.enable
50_000_000.times { String.new }
GC::Profiler.report
