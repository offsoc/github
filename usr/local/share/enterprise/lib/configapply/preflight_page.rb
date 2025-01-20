module Enterprise
  module ConfigApply
    # PreflightPage is used to update the github and enterprise-manage preflight pages
    class PreflightPage
      def initialize(loading: nil, unicorn: nil, loading_status: nil)
        @loading = loading
        @unicorn = unicorn
        @loading_status = loading_status
      end

      class << self
        def set_message(message)
          if File.exist?(enterprise_manage_index_file_path)
            contents = self.new(loading: 1, loading_status: message).render
            File.write(enterprise_manage_index_file_path, contents)
          end

          if File.exist?(github_index_file_path)
            contents = self.new(loading: 1, unicorn: 1, loading_status: message).render
            File.write(github_index_file_path, contents)
          end
        rescue StandardError => e
          Enterprise::ConfigApply.logger.error("Failed to update preflight page: #{e.message}")
        end

        def clear_message
          set_message("")
        end

        def remove_page
          if File.exist?(enterprise_manage_index_file_path)
            File.delete(enterprise_manage_index_file_path)
          end
        rescue StandardError => e
          Enterprise::ConfigApply.logger.error("Failed to remove preflight page: #{e.message}")
        end

        def enterprise_manage_index_file_path
          "/data/enterprise-manage/current/public/index.html"
        end

        def github_index_file_path
          "/data/github/current/public/index.html"
        end
      end

      def render
        b = binding
        template.result(b).tap do
          # The preflight.html.erb template sets some constants that if not removed will
          # pollute the Enterprise::ConfigApply::PreflightPage namespace and cause
          # issues in subsequent runs.
          self.class.constants.each { |c| self.class.send(:remove_const, c) }
        end
      end

      def template
        ERB.new(File.read("/usr/local/share/enterprise/preflight.html.erb"), trim_mode: "-")
      end
    end
  end
end
