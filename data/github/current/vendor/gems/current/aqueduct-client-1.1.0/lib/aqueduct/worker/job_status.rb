module Aqueduct
  module Worker
    # Records the outcome of a job.
    class JobStatus
      def failed!(error = nil)
        @error = error
        @failed = true
      end

      def failed?
        @failed
      end

      def error
        @error
      end
    end
  end
end
