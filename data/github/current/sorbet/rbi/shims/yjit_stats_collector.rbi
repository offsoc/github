# typed: true
# frozen_string_literal: true

class GitHub::DataCollector::YJITStatsCollector
  attr_accessor :inline_code_size,
    :outlined_code_size,
    :vm_insns_count,
    :yjit_alloc_size,
    :compile_time_ns,

    :yjit_insns_count,
    :ratio_in_yjit,
    :side_exit_count,
    :total_exit_count,
    :avg_len_in_yjit
end
