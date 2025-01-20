# typed: true
# frozen_string_literal: true

class GitHub::DataCollector::GCStatsCollector
  attr_accessor :gc_count, :minor_gc_count, :major_gc_count, :allocated_objs, :oldmalloc_increase_bytes, :old_objects, :gc_time
end
