# frozen_string_literal: true

module GitHubTrilogyAdapter
  module Quoting
    # Upstream uses "TRUE" and "FALSE". There's no functional difference, but
    # switching over is probably not worth the potention confusion (it'd change
    # query digests, for example).
    def quoted_true
      "1"
    end

    def quoted_false
      "0"
    end
  end
end
