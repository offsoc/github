# frozen_string_literal: true

module Authzd::Proto
  class BatchRequest
    def rpc_name
      "batch_authorize"
    end

    def batch?
      true
    end
  end

  class BatchDecision
    def batch?
      true
    end

    # Given a reference batch_request, returns a map from Request to Decision.
    #
    # The map happens on the assumption that requests and decisions map to each other
    # by order in the array. i.e, request[0] is mapped to decision[0]
    def map_to_requests(batch_request)
      if batch_request.requests.size != decisions.size
        raise Authzd::Error.new("BatchRequest and BatchDecision sizes differ")
      end
      map = {}
      decisions.each_with_index do |decision, index|
        key = batch_request.requests[index]
        if block_given?
          map[key] = yield key, decision
        else
          map[key] = decision
        end
      end
      map
    end
  end
end
