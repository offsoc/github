module Octolytics
  class Util
    HTML_ESCAPE = {
      '&' => '&amp;',
      '>' => '&gt;',
      '<' => '&lt;',
      '"' => '&quot;',
      "'" => '&#39;',
    }

    def self.html_escape(s)
      s = s.to_s

      if s.respond_to?(:html_safe?)
        if s.html_safe?
          s
        else
          s.gsub(/[&"'><]/, HTML_ESCAPE).html_safe
        end
      else
        s.gsub(/[&"'><]/, HTML_ESCAPE)
      end
    end
  end
end
