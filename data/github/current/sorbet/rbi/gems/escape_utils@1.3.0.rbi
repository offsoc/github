# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for types exported from the `escape_utils` gem.
# Please instead update this file by running `bin/tapioca gem escape_utils`.

# source://escape_utils//lib/escape_utils/version.rb#1
module EscapeUtils
  extend ::EscapeUtils

  def escape_html_once(_arg0); end
  def escape_javascript(_arg0); end
  def escape_uri(_arg0); end
  def escape_uri_component(_arg0); end
  def escape_xml(_arg0); end

  # Default String class to return from HTML escaping
  #
  # source://escape_utils//lib/escape_utils.rb#18
  def html_safe_string_class; end

  # source://escape_utils//lib/escape_utils.rb#20
  def html_safe_string_class=(klass); end

  # source://escape_utils//lib/escape_utils.rb#8
  def html_secure; end

  # source://escape_utils//lib/escape_utils.rb#13
  def html_secure=(val); end

  def unescape_javascript(_arg0); end
  def unescape_uri(_arg0); end
  def unescape_uri_component(_arg0); end

  class << self
    # source://escape_utils//lib/escape_utils.rb#42
    def escape_html(html, secure = T.unsafe(nil)); end

    # source://escape_utils//lib/escape_utils.rb#47
    def escape_html_as_html_safe(html); end

    # source://escape_utils//lib/escape_utils.rb#31
    def escape_html_once_as_html_safe(html); end

    # source://escape_utils//lib/escape_utils.rb#65
    def escape_url(string); end

    # source://escape_utils//lib/escape_utils.rb#60
    def unescape_html(html); end

    # source://escape_utils//lib/escape_utils.rb#70
    def unescape_url(string); end
  end
end

# source://escape_utils//lib/escape_utils/html_safety.rb#2
module EscapeUtils::HtmlSafety
  # source://escape_utils//lib/escape_utils/html_safety.rb#13
  def _escape_html(s); end

  class << self
    # @yield [s.to_s]
    #
    # source://escape_utils//lib/escape_utils/html_safety.rb#4
    def escape_once(s); end
  end
end

# source://escape_utils//lib/escape_utils/version.rb#2
EscapeUtils::VERSION = T.let(T.unsafe(nil), String)
