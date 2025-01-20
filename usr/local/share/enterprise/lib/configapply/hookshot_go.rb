# frozen_string_literal: true

module Enterprise
  module ConfigApply
    module HookshotGo

      def hookshot_go_worker_count
        raw_config.dig("app", "hookshot-go", "workers-per-queue") || "75"
      end

      def hookshot_go_conns_per_queue
        raw_config.dig("app", "hookshot-go", "conns-per-queue") || "25"
      end

      def hookshot_go_worker_http_timeout
        raw_config.dig("app", "hookshot-go", "worker-http-timeout") || "30s"
      end

    end
  end
end
