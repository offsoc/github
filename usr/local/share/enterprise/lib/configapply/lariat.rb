# frozen_string_literal: true
module Enterprise
  module ConfigApply
    module Lariat
      def lariat_cachedir
        "/data/user/tmp"
      end

      def absolute_min_free
        amf = raw_config.dig("lariat", "absolute-min-free")
        if !amf.nil?
          return amf.to_i
        end
        2147483648
      end

      def percent_min_free
        pmf = raw_config.dig("lariat", "percent-min-free")
        if !pmf.nil?
          return pmf.to_i
        end
        10
      end

      def cache_fs_size
        num_blocks=`stat -f --format="%b" #{lariat_cachedir}`.to_i
        blocksize=`stat -f --format="%S" #{lariat_cachedir}`.to_i
        return num_blocks*blocksize
      end

      def relative_min_free
        return cache_fs_size * percent_min_free/100
      end

      def lariat_min_space
        return [absolute_min_free, relative_min_free].max.to_s
      end
    end
  end
end
