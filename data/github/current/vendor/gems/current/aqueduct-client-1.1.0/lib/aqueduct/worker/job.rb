module Aqueduct
  module Worker
    class Job
      attr_reader :id, :app, :queue, :payload, :headers, :backend_name, :sent_at

      def initialize(id:, app:, queue:, payload:, headers:, backend_name:, sent_at:)
        @id = id
        @app = app
        @queue = queue
        @payload = payload
        @headers = headers
        @backend_name = backend_name
        @sent_at = sent_at
      end

      def to_s
        "#<Job id=#{id.inspect} app=#{app} queue=#{queue.inspect} headers=#{headers.inspect} backend_name=#{backend_name.inspect} sent_at=#{@sent_at} payload=#{truncated_payload.inspect}>"
      end

      private

      def truncated_payload
        length = payload.to_s.length
        output = payload.to_s[0, 10]
        length > 10 ? output + "..." : output
      end
    end
  end
end
