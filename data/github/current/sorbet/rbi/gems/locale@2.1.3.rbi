# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for types exported from the `locale` gem.
# Please instead update this file by running `bin/tapioca gem locale`.

# Locale module manages the locale informations of the application.
# These functions are the most important APIs in this library.
# Almost of all i18n/l10n programs use this APIs only.
#
# source://locale//lib/locale/tag/simple.rb#11
module Locale
  private

  # Returns the app_language_tags. Default is nil. See set_app_language_tags for more details.
  #
  # source://locale//lib/locale.rb#323
  def app_language_tags; end

  # Returns the language tags which are variations of the current locales order by priority.
  #
  # For example, if the current locales are ["fr", "ja_JP", "en_US", "en-Latn-GB-VARIANT"],
  # then returns ["fr", "ja_JP", "en_US", "en-Latn-GB-VARIANT", "en_Latn_GB", "en_GB", "ja", "en"].
  # "en" is the default locale(You can change it using set_default).
  # The default locale is added at the end of the list even if it isn't exist.
  #
  # Usually, this method is used to find the locale data as the path(or a kind of IDs).
  # * options: options as a Hash or nil.
  #   * :supported_language_tags -
  #     An Array of the language tags order by the priority. This option
  #     restricts the locales which are supported by the library/application.
  #     Default is nil if you don't need to restrict the locales.
  #      (e.g.1) ["fr_FR", "en_GB", "en_US", ...]
  #   * :type -
  #     The type of language tag. :common, :rfc, :cldr, :posix and
  #     :simple are available. Default value is :common
  #
  # source://locale//lib/locale.rb#212
  def candidates(options = T.unsafe(nil)); end

  # Gets the current charset.
  #
  # This returns the current user/system charset. This value is
  # read only, so you can't set it by yourself.
  #
  # * Returns: the current charset.
  #
  # source://locale//lib/locale.rb#270
  def charset; end

  # Clear current locale.
  # * Returns: self
  #
  # source://locale//lib/locale.rb#276
  def clear; end

  # Clear all locales and charsets of all threads.
  # This doesn't clear the default and app_language_tags.
  # Use Locale.default = nil to unset the default locale.
  # * Returns: self
  #
  # source://locale//lib/locale.rb#286
  def clear_all; end

  # collect tag candidates.
  # The result is shared from all threads.
  #
  # source://locale//lib/locale.rb#227
  def collect_candidates(type, tags, supported_tags); end

  # source://locale//lib/locale.rb#33
  def create_language_tag(tag); end

  # Gets the current locales (Locale::Tag's class).
  # If the current locale is not set, this returns system/default locale.
  #
  # This method returns the current language tags even if it isn't included in app_language_tags.
  #
  # Usually, the programs should use Locale.candidates to find the correct locale, not this method.
  #
  # * Returns: an Array of the current locales (Locale::Tag's class).
  #
  # source://locale//lib/locale.rb#177
  def current; end

  # Sets a current locale. This is a single argument version of Locale.set_current.
  #
  # * tag: the language tag such as "ja-JP"
  # * Returns: an Array of the current locale (Locale::Tag's class).
  #
  #    Locale.current = "ja-JP"
  #    Locale.current = "ja_JP.eucJP"
  #
  # source://locale//lib/locale.rb#164
  def current=(tag); end

  # Gets the default locale(language tag).
  #
  # If the default language tag is not set, this returns nil.
  #
  # * Returns: the default locale (Locale::Tag's class).
  #
  # source://locale//lib/locale.rb#121
  def default; end

  # Same as Locale.set_default.
  #
  # * locale: the default locale (Locale::Tag's class) or a String such as "ja-JP".
  # * Returns: locale.
  #
  # source://locale//lib/locale.rb#111
  def default=(tag); end

  # Gets the driver module.
  #
  # Usually you don't need to call this method.
  #
  # * Returns: the driver module.
  #
  # source://locale//lib/locale.rb#86
  def driver_module; end

  # Deprecated.
  #
  # source://locale//lib/locale.rb#186
  def get; end

  # Initialize Locale library.
  # Usually, you don't need to call this directly, because
  # this is called when Locale's methods are called.
  #
  # If you use this library with CGI or the kind of CGI.
  # You need to call Locale.init(:driver => :cgi).
  #
  # ==== For Framework designers/programers:
  # If your framework is for WWW, call this once like: Locale.init(:driver => :cgi).
  #
  # ==== To Application programers:
  # If your framework doesn't use ruby-locale and the application is for WWW,
  # call this once like: Locale.init(:driver => :cgi).
  #
  # ==== To Library authors:
  # Don't call this, even if your application is only for WWW.
  #
  # * opts: Options as a Hash.
  #   * :driver - The driver. :cgi if you use Locale module with CGI,
  #     nil if you use system locale.
  #       (ex) Locale.init(:driver => :cgi)
  #
  # source://locale//lib/locale.rb#67
  def init(opts = T.unsafe(nil)); end

  # source://locale//lib/locale.rb#28
  def require_driver(name); end

  # Deprecated.
  #
  # source://locale//lib/locale.rb#191
  def set(tag); end

  # Set the language tags which is supported by the Application.
  # This value is same with supported_language_tags in Locale.candidates
  # to restrict the result but is the global setting.
  # If you set a language tag, the application works as the single locale
  # application.
  #
  # If the current locale is not included in app_language_tags,
  # Locale.default value is used.
  # Use Locale.set_default() to set correct language
  # if "en" is not included in the language tags.
  #
  # Set nil if clear the value.
  #
  # Note that the libraries/plugins shouldn't set this value.
  #
  #  (e.g.) Locale.set_app_language_tags("fr_FR", "en-GB", "en_US", ...)
  #
  # source://locale//lib/locale.rb#311
  def set_app_language_tags(*tags); end

  # Sets the locales of the current thread order by the priority.
  # Each thread has a current locales.
  # The system locale/default locale is used if the thread doesn't have current locales.
  #
  # * tag: Locale::Language::Tag's class or the language tag as a String. nil if you need to
  #   clear current locales.
  # * charset: the charset (override the charset even if the locale name has charset) or nil.
  # * Returns: self
  #
  # (e.g.)
  #    Locale.set_current("ja_JP.eucJP")
  #    Locale.set_current("ja-JP")
  #    Locale.set_current("en_AU", "en_US", ...)
  #    Locale.set_current(Locale::Tag::Simple.new("ja", "JP"), ...)
  #
  # source://locale//lib/locale.rb#139
  def set_current(*tags); end

  # Sets the default locale as the language tag
  # (Locale::Tag's class or String(such as "ja_JP")).
  #
  # * tag: the default language_tag
  # * Returns: self.
  #
  # source://locale//lib/locale.rb#98
  def set_default(tag); end

  class << self
    # Returns the app_language_tags. Default is nil. See set_app_language_tags for more details.
    #
    # source://locale//lib/locale.rb#323
    def app_language_tags; end

    # Returns the language tags which are variations of the current locales order by priority.
    #
    # For example, if the current locales are ["fr", "ja_JP", "en_US", "en-Latn-GB-VARIANT"],
    # then returns ["fr", "ja_JP", "en_US", "en-Latn-GB-VARIANT", "en_Latn_GB", "en_GB", "ja", "en"].
    # "en" is the default locale(You can change it using set_default).
    # The default locale is added at the end of the list even if it isn't exist.
    #
    # Usually, this method is used to find the locale data as the path(or a kind of IDs).
    # * options: options as a Hash or nil.
    #   * :supported_language_tags -
    #     An Array of the language tags order by the priority. This option
    #     restricts the locales which are supported by the library/application.
    #     Default is nil if you don't need to restrict the locales.
    #      (e.g.1) ["fr_FR", "en_GB", "en_US", ...]
    #   * :type -
    #     The type of language tag. :common, :rfc, :cldr, :posix and
    #     :simple are available. Default value is :common
    #
    # source://locale//lib/locale.rb#212
    def candidates(options = T.unsafe(nil)); end

    # Gets the current charset.
    #
    # This returns the current user/system charset. This value is
    # read only, so you can't set it by yourself.
    #
    # * Returns: the current charset.
    #
    # source://locale//lib/locale.rb#270
    def charset; end

    # Clear current locale.
    # * Returns: self
    #
    # source://locale//lib/locale.rb#276
    def clear; end

    # Clear all locales and charsets of all threads.
    # This doesn't clear the default and app_language_tags.
    # Use Locale.default = nil to unset the default locale.
    # * Returns: self
    #
    # source://locale//lib/locale.rb#286
    def clear_all; end

    # collect tag candidates.
    # The result is shared from all threads.
    #
    # source://locale//lib/locale.rb#227
    def collect_candidates(type, tags, supported_tags); end

    # source://locale//lib/locale.rb#33
    def create_language_tag(tag); end

    # Gets the current locales (Locale::Tag's class).
    # If the current locale is not set, this returns system/default locale.
    #
    # This method returns the current language tags even if it isn't included in app_language_tags.
    #
    # Usually, the programs should use Locale.candidates to find the correct locale, not this method.
    #
    # * Returns: an Array of the current locales (Locale::Tag's class).
    #
    # source://locale//lib/locale.rb#177
    def current; end

    # Sets a current locale. This is a single argument version of Locale.set_current.
    #
    # * tag: the language tag such as "ja-JP"
    # * Returns: an Array of the current locale (Locale::Tag's class).
    #
    #    Locale.current = "ja-JP"
    #    Locale.current = "ja_JP.eucJP"
    #
    # source://locale//lib/locale.rb#164
    def current=(tag); end

    # Gets the default locale(language tag).
    #
    # If the default language tag is not set, this returns nil.
    #
    # * Returns: the default locale (Locale::Tag's class).
    #
    # source://locale//lib/locale.rb#121
    def default; end

    # Same as Locale.set_default.
    #
    # * locale: the default locale (Locale::Tag's class) or a String such as "ja-JP".
    # * Returns: locale.
    #
    # source://locale//lib/locale.rb#111
    def default=(tag); end

    # Gets the driver module.
    #
    # Usually you don't need to call this method.
    #
    # * Returns: the driver module.
    #
    # source://locale//lib/locale.rb#86
    def driver_module; end

    # Deprecated.
    #
    # source://locale//lib/locale.rb#186
    def get; end

    # Initialize Locale library.
    # Usually, you don't need to call this directly, because
    # this is called when Locale's methods are called.
    #
    # If you use this library with CGI or the kind of CGI.
    # You need to call Locale.init(:driver => :cgi).
    #
    # ==== For Framework designers/programers:
    # If your framework is for WWW, call this once like: Locale.init(:driver => :cgi).
    #
    # ==== To Application programers:
    # If your framework doesn't use ruby-locale and the application is for WWW,
    # call this once like: Locale.init(:driver => :cgi).
    #
    # ==== To Library authors:
    # Don't call this, even if your application is only for WWW.
    #
    # * opts: Options as a Hash.
    #   * :driver - The driver. :cgi if you use Locale module with CGI,
    #     nil if you use system locale.
    #       (ex) Locale.init(:driver => :cgi)
    #
    # source://locale//lib/locale.rb#67
    def init(opts = T.unsafe(nil)); end

    # source://locale//lib/locale.rb#28
    def require_driver(name); end

    # Deprecated.
    #
    # source://locale//lib/locale.rb#191
    def set(tag); end

    # Set the language tags which is supported by the Application.
    # This value is same with supported_language_tags in Locale.candidates
    # to restrict the result but is the global setting.
    # If you set a language tag, the application works as the single locale
    # application.
    #
    # If the current locale is not included in app_language_tags,
    # Locale.default value is used.
    # Use Locale.set_default() to set correct language
    # if "en" is not included in the language tags.
    #
    # Set nil if clear the value.
    #
    # Note that the libraries/plugins shouldn't set this value.
    #
    #  (e.g.) Locale.set_app_language_tags("fr_FR", "en-GB", "en_US", ...)
    #
    # source://locale//lib/locale.rb#311
    def set_app_language_tags(*tags); end

    # Sets the locales of the current thread order by the priority.
    # Each thread has a current locales.
    # The system locale/default locale is used if the thread doesn't have current locales.
    #
    # * tag: Locale::Language::Tag's class or the language tag as a String. nil if you need to
    #   clear current locales.
    # * charset: the charset (override the charset even if the locale name has charset) or nil.
    # * Returns: self
    #
    # (e.g.)
    #    Locale.set_current("ja_JP.eucJP")
    #    Locale.set_current("ja-JP")
    #    Locale.set_current("en_AU", "en_US", ...)
    #    Locale.set_current(Locale::Tag::Simple.new("ja", "JP"), ...)
    #
    # source://locale//lib/locale.rb#139
    def set_current(*tags); end

    # Sets the default locale as the language tag
    # (Locale::Tag's class or String(such as "ja_JP")).
    #
    # * tag: the default language_tag
    # * Returns: self.
    #
    # source://locale//lib/locale.rb#98
    def set_default(tag); end
  end
end

# source://locale//lib/locale.rb#91
Locale::DEFAULT_LANGUAGE_TAG = T.let(T.unsafe(nil), Locale::Tag::Simple)

# Locale::Driver::Win32 module for win32.
# Detect the user locales and the charset.
# This is a low-level class. Application shouldn't use this directly.
#
# source://locale//lib/locale/driver.rb#21
module Locale::Driver; end

# source://locale//lib/locale/driver.rb#22
Locale::Driver::MODULES = T.let(T.unsafe(nil), Hash)

# Language tag / locale identifiers.
#
# source://locale//lib/locale/tag/simple.rb#12
module Locale::Tag
  private

  # Parse a language tag/locale name and return Locale::Tag
  # object.
  # * tag: a tag as a String. e.g.) ja-Hira-JP
  # * Returns: a Locale::Tag subclass.
  #
  # source://locale//lib/locale/tag.rb#26
  def parse(tag); end

  class << self
    # Parse a language tag/locale name and return Locale::Tag
    # object.
    # * tag: a tag as a String. e.g.) ja-Hira-JP
    # * Returns: a Locale::Tag subclass.
    #
    # source://locale//lib/locale/tag.rb#26
    def parse(tag); end
  end
end

# Unicode locale identifier class for CLDR-1.6.1.
# (Unicode Common Locale Data Repository).
#
# source://locale//lib/locale/tag/cldr.rb#18
class Locale::Tag::Cldr < ::Locale::Tag::Common
  # Create Locale::Tag::Cldr.
  #
  # variants should be upcase.
  #
  # @return [Cldr] a new instance of Cldr
  #
  # source://locale//lib/locale/tag/cldr.rb#58
  def initialize(language, script = T.unsafe(nil), region = T.unsafe(nil), variants = T.unsafe(nil), extensions = T.unsafe(nil)); end

  # Returns the value of attribute extensions.
  #
  # source://locale//lib/locale/tag/cldr.rb#27
  def extensions; end

  # Sets the extensions as an Hash.
  #
  # source://locale//lib/locale/tag/cldr.rb#65
  def extensions=(val); end

  private

  # source://locale//lib/locale/tag/cldr.rb#70
  def convert_to(klass); end

  # Returns the language tag.
  # (e.g.) "ja_Hira_JP_VARIANT1_VARIANT2@foo1=var1;foo2=var2"
  #
  # This is used in internal only. Use to_s instead.
  #
  # source://locale//lib/locale/tag/cldr.rb#89
  def to_string; end

  class << self
    # Parse the language tag and return the new Locale::Tag::CLDR.
    #
    # source://locale//lib/locale/tag/cldr.rb#31
    def parse(tag); end
  end
end

# source://locale//lib/locale/tag/cldr.rb#21
Locale::Tag::Cldr::EXTENSION = T.let(T.unsafe(nil), String)

# source://locale//lib/locale/tag/cldr.rb#23
Locale::Tag::Cldr::TAG_RE = T.let(T.unsafe(nil), Regexp)

# source://locale//lib/locale/tag/cldr.rb#20
Locale::Tag::Cldr::VARIANT = T.let(T.unsafe(nil), String)

# Common Language tag class for Ruby.
# Java and MS Windows use this format.
#
# * ja (language: RFC4646)
# * ja_JP (country: RFC4646(2 alpha or 3 digit))
# * ja-JP
# * ja_Hira_JP (script: 4 characters)
# * ja-Hira-JP
# * ja_Hira_JP_MOBILE (variants: more than 2 characters or 3 digit)
# * ja_Hira_JP_MOBILE_IPHONE (2 variants example)
#
# source://locale//lib/locale/tag/common.rb#26
class Locale::Tag::Common < ::Locale::Tag::Simple
  # Create a Locale::Tag::Common.
  #
  # @return [Common] a new instance of Common
  #
  # source://locale//lib/locale/tag/common.rb#56
  def initialize(language, script = T.unsafe(nil), region = T.unsafe(nil), variants = T.unsafe(nil)); end

  # Returns an Array of tag-candidates order by priority.
  # Use Locale.candidates instead of this method.
  #
  # Locale::Tag::Rfc, Cldr don't have their own candidates,
  # because it's meaningless to compare the extensions, privateuse, etc.
  #
  # source://locale//lib/locale/tag/common.rb#79
  def candidates; end

  # Returns the value of attribute script.
  #
  # source://locale//lib/locale/tag/common.rb#34
  def script; end

  # Set the script (with capitalize)
  #
  # source://locale//lib/locale/tag/common.rb#63
  def script=(val); end

  # Returns the value of attribute variants.
  #
  # source://locale//lib/locale/tag/common.rb#34
  def variants; end

  # Set the variants as an Array.
  #
  # source://locale//lib/locale/tag/common.rb#70
  def variants=(val); end

  private

  # source://locale//lib/locale/tag/common.rb#91
  def convert_to(klass); end

  # Returns the common language tag with "_".
  #   <language>_<Script>_<REGION>_VARIANTS1_VARIANTS2
  #   (e.g.) "ja_Hira_JP_VARIANTS1_VARIANTS2"
  #
  # This is used in internal only. Use to_s instead.
  #
  # source://locale//lib/locale/tag/common.rb#113
  def to_string; end

  class << self
    # Parse the language tag and return the new Locale::Tag::Common.
    #
    # source://locale//lib/locale/tag/common.rb#38
    def parse(tag); end
  end
end

# RFC4646 (ISO639/reserved/registered)
#
# source://locale//lib/locale/tag/common.rb#27
Locale::Tag::Common::LANGUAGE = T.let(T.unsafe(nil), String)

# source://locale//lib/locale/tag/common.rb#28
Locale::Tag::Common::SCRIPT = T.let(T.unsafe(nil), String)

# source://locale//lib/locale/tag/common.rb#31
Locale::Tag::Common::TAG_RE = T.let(T.unsafe(nil), Regexp)

# RFC3066 compatible
#
# source://locale//lib/locale/tag/common.rb#29
Locale::Tag::Common::VARIANT = T.let(T.unsafe(nil), String)

# Broken tag class.
#
# source://locale//lib/locale/tag/irregular.rb#18
class Locale::Tag::Irregular < ::Locale::Tag::Simple
  # @return [Irregular] a new instance of Irregular
  #
  # source://locale//lib/locale/tag/irregular.rb#20
  def initialize(tag); end

  # Returns an Array of tag-candidates order by priority.
  #
  # source://locale//lib/locale/tag/irregular.rb#27
  def candidates; end

  private

  # source://locale//lib/locale/tag/irregular.rb#33
  def convert_to(klass); end
end

# Locale tag class for POSIX locale
# * ja
# * ja_JP
# * ja_JP.UTF-8
# * ja_JP.UTF-8@Osaka
# * C/POSIX (-> en_US)
#
# source://locale//lib/locale/tag/posix.rb#22
class Locale::Tag::Posix < ::Locale::Tag::Simple
  # @return [Posix] a new instance of Posix
  #
  # source://locale//lib/locale/tag/posix.rb#28
  def initialize(language, region = T.unsafe(nil), charset = T.unsafe(nil), modifier = T.unsafe(nil)); end

  # Returns an Array of tag-candidates order by priority.
  # Use Locale.candidates instead of this method.
  #
  # source://locale//lib/locale/tag/posix.rb#71
  def candidates; end

  # Returns the value of attribute charset.
  #
  # source://locale//lib/locale/tag/posix.rb#26
  def charset; end

  # Set the charset.
  #
  # source://locale//lib/locale/tag/posix.rb#60
  def charset=(val); end

  # Returns the value of attribute modifier.
  #
  # source://locale//lib/locale/tag/posix.rb#26
  def modifier; end

  # Set the modifier as a String
  #
  # source://locale//lib/locale/tag/posix.rb#65
  def modifier=(val); end

  # Returns the language tag.
  #   <language>_<COUNTRY>.<CHARSET>@<MODIFIER>
  #   (e.g.) "ja_JP.EUC-JP@Modifier"
  #
  # source://locale//lib/locale/tag/posix.rb#51
  def to_s; end

  private

  # source://locale//lib/locale/tag/posix.rb#85
  def convert_to(klass); end

  class << self
    # source://locale//lib/locale/tag/posix.rb#33
    def parse(tag); end
  end
end

# source://locale//lib/locale/tag/posix.rb#23
Locale::Tag::Posix::LANGUAGE = T.let(T.unsafe(nil), String)

# source://locale//lib/locale/tag/posix.rb#24
Locale::Tag::Posix::TAG_RE = T.let(T.unsafe(nil), Regexp)

# Language tag class for RFC4646(BCP47).
#
# source://locale//lib/locale/tag/rfc.rb#17
class Locale::Tag::Rfc < ::Locale::Tag::Common
  # @return [Rfc] a new instance of Rfc
  #
  # source://locale//lib/locale/tag/rfc.rb#61
  def initialize(language, script = T.unsafe(nil), region = T.unsafe(nil), variants = T.unsafe(nil), extensions = T.unsafe(nil), privateuse = T.unsafe(nil)); end

  # Returns the value of attribute extensions.
  #
  # source://locale//lib/locale/tag/rfc.rb#28
  def extensions; end

  # Sets the extensions as an Array.
  #
  # source://locale//lib/locale/tag/rfc.rb#68
  def extensions=(val); end

  # Returns the value of attribute privateuse.
  #
  # source://locale//lib/locale/tag/rfc.rb#28
  def privateuse; end

  # Sets the privateuse as a String
  #
  # source://locale//lib/locale/tag/rfc.rb#73
  def privateuse=(val); end

  private

  # source://locale//lib/locale/tag/rfc.rb#78
  def convert_to(klass); end

  # Returns the language tag
  #   <language>-<Script>-<REGION>-<variants>-<extensions>-<PRIVATEUSE>
  #   (e.g.) "ja-Hira-JP-variant"
  #
  # This is used in internal only. Use to_s instead.
  #
  # source://locale//lib/locale/tag/rfc.rb#99
  def to_string; end

  class << self
    # Parse the language tag and return the new Locale::Tag::Rfc.
    #
    # source://locale//lib/locale/tag/rfc.rb#32
    def parse(tag); end
  end
end

# source://locale//lib/locale/tag/rfc.rb#20
Locale::Tag::Rfc::EXTENSION = T.let(T.unsafe(nil), String)

# source://locale//lib/locale/tag/rfc.rb#22
Locale::Tag::Rfc::GRANDFATHERED = T.let(T.unsafe(nil), String)

# source://locale//lib/locale/tag/rfc.rb#21
Locale::Tag::Rfc::PRIVATEUSE = T.let(T.unsafe(nil), String)

# source://locale//lib/locale/tag/rfc.rb#18
Locale::Tag::Rfc::SINGLETON = T.let(T.unsafe(nil), String)

# source://locale//lib/locale/tag/rfc.rb#24
Locale::Tag::Rfc::TAG_RE = T.let(T.unsafe(nil), Regexp)

# source://locale//lib/locale/tag/rfc.rb#19
Locale::Tag::Rfc::VARIANT = T.let(T.unsafe(nil), String)

# Abstract language tag class.
# This class has <language>, <region> which
# all of language tag specifications have.
#
# * ja (language: ISO 639 (2 or 3 alpha))
# * ja_JP (country: RFC4646 (ISO3166/UN M.49) (2 alpha or 3 digit)
# * ja-JP
# * ja-392
#
# source://locale//lib/locale/tag/simple.rb#21
class Locale::Tag::Simple
  # Create a Locale::Tag::Simple
  #
  # @return [Simple] a new instance of Simple
  #
  # source://locale//lib/locale/tag/simple.rb#68
  def initialize(language, region = T.unsafe(nil)); end

  # source://locale//lib/locale/tag/simple.rb#86
  def <=>(other); end

  # source://locale//lib/locale/tag/simple.rb#90
  def ==(other); end

  # Returns an Array of tag-candidates order by priority.
  # Use Locale.candidates instead of this method.
  #
  # source://locale//lib/locale/tag/simple.rb#125
  def candidates; end

  # For backward compatibility.
  #
  # source://locale//lib/locale/tag/simple.rb#107
  def country; end

  # @return [Boolean]
  #
  # source://locale//lib/locale/tag/simple.rb#94
  def eql?(other); end

  # source://locale//lib/locale/tag/simple.rb#98
  def hash; end

  # source://locale//lib/locale/tag/simple.rb#102
  def inspect; end

  # Returns the value of attribute language.
  #
  # source://locale//lib/locale/tag/simple.rb#31
  def language; end

  # Set the language (with downcase)
  #
  # source://locale//lib/locale/tag/simple.rb#110
  def language=(val); end

  # Returns the value of attribute region.
  #
  # source://locale//lib/locale/tag/simple.rb#31
  def region; end

  # Set the region (with upcase)
  #
  # source://locale//lib/locale/tag/simple.rb#117
  def region=(val); end

  # tag is set when .parse method is called.
  # This value is used when the program want to know the original
  # String.
  #
  # source://locale//lib/locale/tag/simple.rb#36
  def tag; end

  # tag is set when .parse method is called.
  # This value is used when the program want to know the original
  # String.
  #
  # source://locale//lib/locale/tag/simple.rb#36
  def tag=(_arg0); end

  def to_cldr; end
  def to_common; end
  def to_posix; end
  def to_rfc; end

  # Returns the language tag as the String.
  #   <language>_<REGION>
  #   (e.g.) "ja_JP"
  #
  # source://locale//lib/locale/tag/simple.rb#78
  def to_s; end

  def to_simple; end

  # source://locale//lib/locale/tag/simple.rb#82
  def to_str; end

  private

  # source://locale//lib/locale/tag/simple.rb#131
  def convert_to(klass); end

  # Return simple language tag which format is"<lanuguage>_<REGION>".
  # This is to use internal only. Use to_s instead.
  #
  # source://locale//lib/locale/tag/simple.rb#141
  def to_string; end

  class << self
    # Parse the language tag and return the new Locale::Tag::Simple.
    #
    # source://locale//lib/locale/tag/simple.rb#55
    def parse(tag); end
  end
end

# source://locale//lib/locale/tag/simple.rb#22
Locale::Tag::Simple::ALPHA = T.let(T.unsafe(nil), String)

# source://locale//lib/locale/tag/simple.rb#24
Locale::Tag::Simple::ALPHANUM = T.let(T.unsafe(nil), String)

# source://locale//lib/locale/tag/simple.rb#23
Locale::Tag::Simple::DIGIT = T.let(T.unsafe(nil), String)

# ISO 639
#
# source://locale//lib/locale/tag/simple.rb#26
Locale::Tag::Simple::LANGUAGE = T.let(T.unsafe(nil), String)

# RFC4646 (ISO3166/UN M.49)
#
# source://locale//lib/locale/tag/simple.rb#27
Locale::Tag::Simple::REGION = T.let(T.unsafe(nil), String)

# source://locale//lib/locale/tag/simple.rb#29
Locale::Tag::Simple::TAG_RE = T.let(T.unsafe(nil), Regexp)

# This provides the subclass of Array which behaves like
# the first(top priority) Locale::Tag object.
# "Locale.current.language" is same with "Locale.current[0].language".
#
# Locale.current returns an Array of Tag(s) now.
# But the old Locale.current(Ruby-GetText) and Locale.get
# returns Locale::Object (similier with Locale::Tag::Posix).
# This is the class for backward compatibility.
#
# It is recommanded to use Locale.current[0] or
# Locale.candidates to find the current locale instead
# of this function.
#
# source://locale//lib/locale/taglist.rb#26
class Locale::TagList < ::Array
  # Returns the top priority charset. (posix)
  #
  # source://locale//lib/locale/taglist.rb#44
  def charset; end

  # Returns the top priority region/country. (simple)
  #
  # source://locale//lib/locale/taglist.rb#32
  def country; end

  # Returns the top priority extensions.(common, rfc, cldr)
  #
  # source://locale//lib/locale/taglist.rb#65
  def extensions; end

  # Returns the top priority language. (simple)
  #
  # source://locale//lib/locale/taglist.rb#28
  def language; end

  # Returns the top priority modifier. (posix)
  #
  # source://locale//lib/locale/taglist.rb#55
  def modifier; end

  # Returns the top priority privateuse(rfc)
  #
  # source://locale//lib/locale/taglist.rb#70
  def privateuse; end

  # Returns the top priority region/country. (simple)
  #
  # source://locale//lib/locale/taglist.rb#36
  def region; end

  # Returns the top priority script. (common)
  #
  # source://locale//lib/locale/taglist.rb#40
  def script; end

  # source://locale//lib/locale/taglist.rb#94
  def to_cldr; end

  # source://locale//lib/locale/taglist.rb#82
  def to_common; end

  # source://locale//lib/locale/taglist.rb#98
  def to_posix; end

  # source://locale//lib/locale/taglist.rb#90
  def to_rfc; end

  # source://locale//lib/locale/taglist.rb#78
  def to_s; end

  # source://locale//lib/locale/taglist.rb#86
  def to_simple; end

  # source://locale//lib/locale/taglist.rb#74
  def to_str; end

  # Returns the top priority variants.(common, rfc, cldr)
  #
  # source://locale//lib/locale/taglist.rb#60
  def variants; end
end

# source://locale//lib/locale/version.rb#11
Locale::VERSION = T.let(T.unsafe(nil), String)
