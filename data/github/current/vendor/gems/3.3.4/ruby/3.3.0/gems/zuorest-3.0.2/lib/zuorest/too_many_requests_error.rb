# Check out the official docs for more info:
#   https://knowledgecenter.zuora.com/BB_Introducing_Z_Business/Policies/Concurrent_Request_Limits
class Zuorest::TooManyRequestsError < Zuorest::HttpError

  def message
    @_message ||=
      begin
        msg = super
        if msg == "HTTP 429"
          "#{msg} - #{data}"
        else
          msg
        end
      end
  end

  def concurrent?
    message.include?("concurrent")
  end

  # For concurrent request limits, this is the amount of seconds to wait
  # before attempting another request
  def retry_after
    headers["Retry-After"].to_f
  end

  # The request limit quota for the time window closest to exhaustion.
  def rate_limit_info
    headers["RateLimit-Limit"]
  end

  # The number of requests remaining in the time window closest to quota exhaustion.
  def rate_limit_remaining
    headers["RateLimit-Remaining"].to_f
  end

  # The number of seconds until the quota resets for the time window closest to quota exhaustion.
  def rate_limit_reset
    datetime = DateTime.rfc2822(headers["RateLimit-Reset"])
    datetime.to_time - Time.now.utc
  rescue ArgumentError
    headers["RateLimit-Reset"].to_f
  end
end
