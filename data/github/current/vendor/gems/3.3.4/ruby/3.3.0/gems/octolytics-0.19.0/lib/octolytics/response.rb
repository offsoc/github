module Octolytics
  # Response object that is returned from all adapter requests.
  class Response
    # Public: Return the success state of the given request.
    def success?
      raise "Not implemented - implement in your subclass!"
    end

    # Public : Return the failure state of the given request.
    def failure?
      !success?
    end

    # Public: Return an Exception instance, if available, for
    # the error raised by the underlying request.
    def error
      return nil if success?

      raise "Not implemented - implement in your subclass!"
    end
  end

  # Represents success without any accompanying metadata.
  class SuccessfulResponse < Response
    def success?
      true
    end
  end

  # Represents failure represented by an Exception object.
  class FailedResponse < Response
    attr_reader :error

    def initialize(error)
      @error = error
    end

    def success?
      false
    end
  end
end
