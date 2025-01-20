# frozen_string_literal: true

module Enterprise
  module ConfigApply
    # LocalStorage supports creating local storage buckets in GHES
    module LocalStorage
      def create_bucket(name)
        ok, _ = system_log("/usr/local/bin/ghe-create-local-bucket #{name}")
        if !ok
          log_status "Creating local storage bucket #{name}", :failed
          exit(1)
        end
      end
    end
  end
end
