# frozen_string_literal: true

module Authzd::Proto
  class Request
    def rpc_name
      "authorize"
    end

    def batch?
      false
    end
  end
end

module Authzd::Enumerator
  class ForSubjectRequest
    def rpc_name
      "for_subject"
    end

    def batch?
      false
    end
  end

  class ForActorRequest
    def rpc_name
      "for_actor"
    end

    def batch?
      false
    end
  end
end
