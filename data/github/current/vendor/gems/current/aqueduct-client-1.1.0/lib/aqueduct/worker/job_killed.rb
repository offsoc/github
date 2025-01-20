module Aqueduct
  module Worker
    # A job was killed during processing by a hard shutdown.
    class JobKilled < Exception
    end
  end
end
