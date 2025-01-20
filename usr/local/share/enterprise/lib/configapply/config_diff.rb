# frozen_string_literal: true

module Enterprise
  module ConfigApply
    # ConfigDiff contains methods for comparing GHES config files which are in the git format.
    module ConfigDiff
      class MissingConfigFileError < StandardError; end
      class ScopeError < StandardError; end

      SCOPES = ["github", "cluster", "secrets"]
      ARCHIVE_DIR_REGEX = /^20[0-9][0-9][01][0-9](0[1-9]|[12]\d|3[01])-/

      def config_diff(*filters)
        ConfigDiff.config_diff(*filters)
      end

      class << self
        def config_diff(*filters)
          SCOPES.each_with_object({}) do |scope, diff|
            diff.merge!(config_diff_for(scope, *filters))
          end
        end

        def config_diff_for(scope, *filters)
          raise ScopeError.new("scope must be github, cluster or secrets") unless SCOPES.include?(scope)

          current_file = current_file(scope)

          # it's an error if the github.conf or secrets.conf file is missing, but cluster.conf can be absent on standalone appliances
          unless scope == "cluster"
            raise MissingConfigFileError.new("the #{scope}.conf file is missing from #{path}") unless File.exist?(current_file)
          end

          compare(latest_archive_file(scope), current_file, *filters)
        end

        def compare(file1, file2, *filters)
          c1 = comparison_config(file1, *filters)
          c2 = comparison_config(file2, *filters)

          diff = (c1.keys | c2.keys).to_h { |k| [k, nil] }
          diff.each do |k, v|
            v1 = c1[k].to_s
            v2 = c2[k].to_s
            case
            when !v1.empty? && !v2.empty? && v1 != v2
                diff[k] = [v1, v2]
            when v1.empty? && !v2.empty?
              diff[k] = ["", v2]
            when !v1.empty? && v2.empty?
              diff[k] = [v1, ""]
            else
              diff.delete(k)
            end
          end
        end

        def latest_archive_file(scope)
          latest_dir = latest_archive_path
          return nil unless latest_dir
          file_path = File.join(archive_path, latest_dir, "#{scope}.conf")
          return nil unless File.exist?(file_path)
          file_path
        end

        def latest_archive_path
          return nil unless Dir.exist?(archive_path)
          return nil if Dir.glob(File.join(archive_path, '*')).none?{ |f| File.directory?(f) }

          latest_dir = Dir.entries(archive_path).select { |e|
            File.directory?(File.join(archive_path, e)) && e[ARCHIVE_DIR_REGEX]
          }.sort[-1]

          # If there are no directories that match the archive dir regex.
          return nil unless latest_dir

          # If the status.json file is missing, we can't be sure the archive was produced by config-apply.
          return nil unless File.exist?(File.join(archive_path, latest_dir, "status.json"))

          latest_dir
        end

        private

        def archive_path
          ENV.fetch('GHE_CONFIG_APPLY_ARCHIVE_DIR', "/data/user/common/ghe-config-apply/config-file-history")
        end

        def path
          ENV.fetch('GHE_CONFIG_APPLY_DIR', "/data/user/common")
        end

        def current_file(scope)
          File.join(path, "#{scope}.conf")
        end

        def comparison_config(file, *filters)
          if file.nil? || file.empty?
            {}
          else
            filter(flatten_conf(GheConfig.new.load_config(file)), filters)
          end
        end

        def flatten_conf(h)
          h.each_with_object({}) do |(k, v), h|
            if v.is_a? Hash
              flatten_conf(v).map do |vk, vv|
                h["#{k}.#{vk}"] = vv
              end
            else
              h[k] = v
            end
          end
        end

        def filter(conf, filters)
          return conf if filters.empty?
          conf.select do |k|
            filters.find { |f| File.fnmatch(f, k) }
          end
        end
      end
    end
  end
end
