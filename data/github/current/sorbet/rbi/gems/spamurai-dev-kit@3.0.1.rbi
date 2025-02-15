# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for types exported from the `spamurai-dev-kit` gem.
# Please instead update this file by running `bin/tapioca gem spamurai-dev-kit`.

# source://spamurai-dev-kit//lib/spamurai_dev_kit.rb#1
module SpamuraiDevKit; end

# source://spamurai-dev-kit//lib/lib/global_id.rb#6
module SpamuraiDevKit::GlobalId
  class << self
    # Public: Extract an entity's model type and database ID from its
    # global ID.
    #
    # New GitHub Platform ids are base64 encoded model and database id
    # representations. The prefix maps to a specific model, and the rest of the id
    # base64 decodes to a msgpacked array with a template id and database id (for
    # account types). For example, the id "U_kgDOAAGn5g" is of type "User" with
    # a database id of 108518, since the contained data is [0, 108518]. (We can
    # ignore the template id for our purposes.)
    #
    # Spamurai and old GitHub Platform ids are base64 encoded model and database
    # id representations. They look like this when decoded:
    #
    #   04:User623
    #   12:Organization9919
    #
    # The first part describes how long the model name is and the second part is
    # the model name and the database id. Extract the database id by splitting on
    # ':' and then using the model name length from the first part to remove the
    # model name from the second part, leaving the database id as the remainder.
    #
    # graphql_id - String.
    #
    # Returns a tuple of [model_name, database_id].
    #
    # source://spamurai-dev-kit//lib/lib/global_id.rb#44
    def extract_model_and_database_id(graphql_id); end

    # @raise [SpamuraiDevKit::GlobalId::ParseError]
    #
    # source://spamurai-dev-kit//lib/lib/global_id.rb#66
    def extract_model_and_database_id_next(graphql_id); end

    # source://spamurai-dev-kit//lib/lib/global_id.rb#52
    def extract_model_and_database_id_original(graphql_id); end

    # Public: Construct a global relay ID for an entity. We only support Account
    # types, as defined by the GitHub GraphQL API e.g. User and Organization,
    # and SpamuraiNode types, as defined by the Spamurai Next GraphQL API e.g.
    # Queue and QueueEntry.
    #
    # model_name - String.
    # database_id - Integer.
    # quiet - Boolean. Should we throw an error or warn when given an unsupported model?
    #
    # Returns a String.
    #
    # source://spamurai-dev-kit//lib/lib/global_id.rb#105
    def global_relay_id(model_name, database_id, quiet: T.unsafe(nil)); end

    # Public: Construct a classic global relay ID for an entity. Used for
    # all spamurai-next types and for legacy purposes on dotcom types.
    #
    # model_name - String.
    # database_id - Integer.
    #
    # Returns a String.
    #
    # source://spamurai-dev-kit//lib/lib/global_id.rb#91
    def global_relay_id_classic(model_name, database_id); end
  end
end

# source://spamurai-dev-kit//lib/lib/global_id.rb#14
class SpamuraiDevKit::GlobalId::EncodeError < ::StandardError; end

# source://spamurai-dev-kit//lib/lib/global_id.rb#17
SpamuraiDevKit::GlobalId::MALFORMED_ID_ERROR = T.let(T.unsafe(nil), String)

# source://spamurai-dev-kit//lib/lib/global_id.rb#7
SpamuraiDevKit::GlobalId::METADATA = T.let(T.unsafe(nil), Hash)

# source://spamurai-dev-kit//lib/lib/global_id.rb#12
SpamuraiDevKit::GlobalId::NEW_GRID_DELIMITER = T.let(T.unsafe(nil), String)

# source://spamurai-dev-kit//lib/lib/global_id.rb#15
class SpamuraiDevKit::GlobalId::ParseError < ::StandardError; end

# source://spamurai-dev-kit//lib/lib/global_id.rb#9
SpamuraiDevKit::GlobalId::SPAMURAI_NODE_TYPES = T.let(T.unsafe(nil), Array)

# source://spamurai-dev-kit//lib/lib/global_id.rb#10
SpamuraiDevKit::GlobalId::SUPPORTED_MODELS = T.let(T.unsafe(nil), Array)

# source://spamurai-dev-kit//lib/lib/global_id.rb#18
SpamuraiDevKit::GlobalId::SUPPORTED_MODELS_ERROR = T.let(T.unsafe(nil), String)

# source://spamurai-dev-kit//lib/lib/global_id.rb#8
SpamuraiDevKit::GlobalId::TYPE_HINT_TO_MODEL = T.let(T.unsafe(nil), Hash)

# source://spamurai-dev-kit//lib/octocaptcha/octocaptcha.rb#11
class SpamuraiDevKit::Octocaptcha
  include ::SpamuraiDevKit::OctocaptchaUrlHelpers

  # @return [Octocaptcha] a new instance of Octocaptcha
  # @yield [_self]
  # @yieldparam _self [SpamuraiDevKit::Octocaptcha] the object that the method was called on
  #
  # source://spamurai-dev-kit//lib/octocaptcha/octocaptcha.rb#23
  def initialize(app_name, feature_name); end

  # Returns the value of attribute app_name.
  #
  # source://spamurai-dev-kit//lib/octocaptcha/octocaptcha.rb#18
  def app_name; end

  # Returns the value of attribute app_url.
  #
  # source://spamurai-dev-kit//lib/octocaptcha/octocaptcha.rb#19
  def app_url; end

  # Sets the attribute app_url
  #
  # @param value the value to set the attribute app_url to.
  #
  # source://spamurai-dev-kit//lib/octocaptcha/octocaptcha.rb#19
  def app_url=(_arg0); end

  # Returns the value of attribute env.
  #
  # source://spamurai-dev-kit//lib/octocaptcha/octocaptcha.rb#19
  def env; end

  # Sets the attribute env
  #
  # @param value the value to set the attribute env to.
  #
  # source://spamurai-dev-kit//lib/octocaptcha/octocaptcha.rb#19
  def env=(_arg0); end

  # Returns the value of attribute feature_name.
  #
  # source://spamurai-dev-kit//lib/octocaptcha/octocaptcha.rb#18
  def feature_name; end

  # Returns the value of attribute is_captcha_disabled.
  #
  # source://spamurai-dev-kit//lib/octocaptcha/octocaptcha.rb#20
  def is_captcha_disabled; end

  # Sets the attribute is_captcha_disabled
  #
  # @param value the value to set the attribute is_captcha_disabled to.
  #
  # source://spamurai-dev-kit//lib/octocaptcha/octocaptcha.rb#20
  def is_captcha_disabled=(_arg0); end

  # Private: User provided function to check if captcha is disabled
  #
  # Returns a boolean
  #
  # @return [Boolean]
  #
  # source://spamurai-dev-kit//lib/octocaptcha/octocaptcha.rb#94
  def is_captcha_disabled?; end

  # Returns the value of attribute is_captcha_service_disabled.
  #
  # source://spamurai-dev-kit//lib/octocaptcha/octocaptcha.rb#20
  def is_captcha_service_disabled; end

  # Sets the attribute is_captcha_service_disabled
  #
  # @param value the value to set the attribute is_captcha_service_disabled to.
  #
  # source://spamurai-dev-kit//lib/octocaptcha/octocaptcha.rb#20
  def is_captcha_service_disabled=(_arg0); end

  # Private: User provided function to check if captcha service is disabled
  #
  # Returns a boolean
  #
  # @return [Boolean]
  #
  # source://spamurai-dev-kit//lib/octocaptcha/octocaptcha.rb#108
  def is_captcha_service_disabled?; end

  # @return [Boolean]
  #
  # source://spamurai-dev-kit//lib/octocaptcha/octocaptcha.rb#146
  def is_development_env?; end

  # @return [Boolean]
  #
  # source://spamurai-dev-kit//lib/octocaptcha/octocaptcha.rb#150
  def is_production_env?; end

  # @return [Boolean]
  #
  # source://spamurai-dev-kit//lib/octocaptcha/octocaptcha.rb#154
  def is_staging_env?; end

  # @return [Boolean]
  #
  # source://spamurai-dev-kit//lib/octocaptcha/octocaptcha.rb#142
  def is_test_env?; end

  # source://spamurai-dev-kit//lib/octocaptcha/octocaptcha.rb#158
  def new_session(token: T.unsafe(nil)); end

  # Returns the value of attribute octocaptcha_uri.
  #
  # source://spamurai-dev-kit//lib/octocaptcha/octocaptcha.rb#21
  def octocaptcha_uri; end

  # Sets the attribute octocaptcha_uri
  #
  # @param value the value to set the attribute octocaptcha_uri to.
  #
  # source://spamurai-dev-kit//lib/octocaptcha/octocaptcha.rb#21
  def octocaptcha_uri=(_arg0); end

  # Returns the value of attribute private_key.
  #
  # source://spamurai-dev-kit//lib/octocaptcha/octocaptcha.rb#19
  def private_key; end

  # Sets the attribute private_key
  #
  # @param value the value to set the attribute private_key to.
  #
  # source://spamurai-dev-kit//lib/octocaptcha/octocaptcha.rb#19
  def private_key=(_arg0); end

  # Returns the value of attribute stats.
  #
  # source://spamurai-dev-kit//lib/octocaptcha/octocaptcha.rb#18
  def stats; end

  # Returns the value of attribute use_arkose_V4_api.
  #
  # source://spamurai-dev-kit//lib/octocaptcha/octocaptcha.rb#19
  def use_arkose_V4_api; end

  # Sets the attribute use_arkose_V4_api
  #
  # @param value the value to set the attribute use_arkose_V4_api to.
  #
  # source://spamurai-dev-kit//lib/octocaptcha/octocaptcha.rb#19
  def use_arkose_V4_api=(_arg0); end

  # Private: Use arkose v4 api
  #
  # Returns a boolean
  #
  # @return [Boolean]
  #
  # source://spamurai-dev-kit//lib/octocaptcha/octocaptcha.rb#83
  def use_arkose_V4_api?; end
end

# source://spamurai-dev-kit//lib/octocaptcha/octocaptcha.rb#14
SpamuraiDevKit::Octocaptcha::DEVELOPMENT_FUNCAPTCHA_PRIVATE_KEY = T.let(T.unsafe(nil), String)

# source://spamurai-dev-kit//lib/octocaptcha/octocaptcha.rb#16
class SpamuraiDevKit::Octocaptcha::InvalidConfiguration < ::Exception; end

# source://spamurai-dev-kit//lib/octocaptcha/octocaptcha.rb#104
SpamuraiDevKit::Octocaptcha::MAX_RETRIES_FOR_SERVICE_CHECK = T.let(T.unsafe(nil), Integer)

# source://spamurai-dev-kit//lib/octocaptcha/octocaptcha.rb#162
class SpamuraiDevKit::Octocaptcha::OctocaptchaSession
  # @return [OctocaptchaSession] a new instance of OctocaptchaSession
  #
  # source://spamurai-dev-kit//lib/octocaptcha/octocaptcha.rb#166
  def initialize(octocaptcha, token); end

  # Returns the value of attribute error.
  #
  # source://spamurai-dev-kit//lib/octocaptcha/octocaptcha.rb#164
  def error; end

  # Returns the value of attribute funcaptcha_response_body.
  #
  # source://spamurai-dev-kit//lib/octocaptcha/octocaptcha.rb#164
  def funcaptcha_response_body; end

  # Returns the value of attribute octocaptcha.
  #
  # source://spamurai-dev-kit//lib/octocaptcha/octocaptcha.rb#163
  def octocaptcha; end

  # @return [Boolean]
  #
  # source://spamurai-dev-kit//lib/octocaptcha/octocaptcha.rb#175
  def show_captcha?; end

  # @return [Boolean]
  #
  # source://spamurai-dev-kit//lib/octocaptcha/octocaptcha.rb#189
  def solved?; end

  # source://spamurai-dev-kit//lib/octocaptcha/octocaptcha.rb#198
  def start; end

  # Returns the value of attribute token.
  #
  # source://spamurai-dev-kit//lib/octocaptcha/octocaptcha.rb#164
  def token; end

  # source://spamurai-dev-kit//lib/octocaptcha/octocaptcha.rb#171
  def url; end

  # Returns the value of attribute value.
  #
  # source://spamurai-dev-kit//lib/octocaptcha/octocaptcha.rb#164
  def value; end

  # Evaluates the user and retrieves the value and error values
  #
  # source://spamurai-dev-kit//lib/octocaptcha/octocaptcha.rb#203
  def verify; end

  private

  # source://spamurai-dev-kit//lib/octocaptcha/octocaptcha.rb#222
  def get_results; end

  # source://spamurai-dev-kit//lib/octocaptcha/octocaptcha.rb#242
  def get_results_V4; end

  # source://spamurai-dev-kit//lib/octocaptcha/octocaptcha.rb#214
  def instrument_event(event_type); end

  # source://spamurai-dev-kit//lib/octocaptcha/octocaptcha.rb#263
  def response; end

  # source://spamurai-dev-kit//lib/octocaptcha/octocaptcha.rb#306
  def response_body; end
end

# source://spamurai-dev-kit//lib/octocaptcha/octocaptcha.rb#261
SpamuraiDevKit::Octocaptcha::OctocaptchaSession::CAPTCHA_URI = T.let(T.unsafe(nil), URI::HTTPS)

# source://spamurai-dev-kit//lib/octocaptcha/octocaptcha.rb#262
SpamuraiDevKit::Octocaptcha::OctocaptchaSession::CAPTCHA_V4_URI = T.let(T.unsafe(nil), URI::HTTPS)

# source://spamurai-dev-kit//lib/octocaptcha/octocaptcha.rb#305
class SpamuraiDevKit::Octocaptcha::OctocaptchaSession::EmptyResponseBody < ::Exception; end

# source://spamurai-dev-kit//lib/octocaptcha/octocaptcha.rb#260
SpamuraiDevKit::Octocaptcha::OctocaptchaSession::MAX_RETRIES_FOR_VERIFICATION = T.let(T.unsafe(nil), Integer)

# source://spamurai-dev-kit//lib/octocaptcha/octocaptcha_url_helpers.rb#2
module SpamuraiDevKit::OctocaptchaUrlHelpers
  # source://spamurai-dev-kit//lib/octocaptcha/octocaptcha_url_helpers.rb#3
  def host_name; end

  # source://spamurai-dev-kit//lib/octocaptcha/octocaptcha_url_helpers.rb#11
  def url; end

  # Generates octocaptcha iframe url
  # origin_url - the url of your website. ex enterprise.github.com
  #   Defaults to app_url configuration
  # origin_page - name of your page. defaults to app_name + feature name
  #
  # source://spamurai-dev-kit//lib/octocaptcha/octocaptcha_url_helpers.rb#23
  def url_for_iframe(origin_url: T.unsafe(nil), origin_page: T.unsafe(nil), responsive: T.unsafe(nil), nojs: T.unsafe(nil)); end
end

# source://spamurai-dev-kit//lib/lib/stats.rb#5
class SpamuraiDevKit::Stats
  class << self
    # source://spamurai-dev-kit//lib/lib/stats.rb#6
    def get_stats_client(namespace, app, feature, env, tags: T.unsafe(nil)); end
  end
end

# source://spamurai-dev-kit//lib/lib/stats.rb#21
class SpamuraiDevKit::Stats::NullDogstatsD
  # @return [NullDogstatsD] a new instance of NullDogstatsD
  #
  # source://spamurai-dev-kit//lib/lib/stats.rb#28
  def initialize(*_arg0); end

  # @yield [_self]
  # @yieldparam _self [SpamuraiDevKit::Stats::NullDogstatsD] the object that the method was called on
  #
  # source://spamurai-dev-kit//lib/lib/stats.rb#41
  def batch; end

  # source://spamurai-dev-kit//lib/lib/stats.rb#33
  def count(stat, count, opts = T.unsafe(nil)); end

  # source://spamurai-dev-kit//lib/lib/stats.rb#32
  def decrement(stat, opts = T.unsafe(nil)); end

  # source://spamurai-dev-kit//lib/lib/stats.rb#40
  def event(title, text, opts = T.unsafe(nil)); end

  # source://spamurai-dev-kit//lib/lib/stats.rb#34
  def gauge(stat, value, opts = T.unsafe(nil)); end

  # source://spamurai-dev-kit//lib/lib/stats.rb#35
  def histogram(stat, value, opts = T.unsafe(nil)); end

  # Returns the value of attribute host.
  #
  # source://spamurai-dev-kit//lib/lib/stats.rb#22
  def host; end

  # Sets the attribute host
  #
  # @param value the value to set the attribute host to.
  #
  # source://spamurai-dev-kit//lib/lib/stats.rb#22
  def host=(_arg0); end

  # source://spamurai-dev-kit//lib/lib/stats.rb#31
  def increment(stat, opts = T.unsafe(nil)); end

  # Returns the value of attribute max_buffer_size.
  #
  # source://spamurai-dev-kit//lib/lib/stats.rb#26
  def max_buffer_size; end

  # Sets the attribute max_buffer_size
  #
  # @param value the value to set the attribute max_buffer_size to.
  #
  # source://spamurai-dev-kit//lib/lib/stats.rb#26
  def max_buffer_size=(_arg0); end

  # Returns the value of attribute namespace.
  #
  # source://spamurai-dev-kit//lib/lib/stats.rb#25
  def namespace; end

  # Sets the attribute namespace
  #
  # @param value the value to set the attribute namespace to.
  #
  # source://spamurai-dev-kit//lib/lib/stats.rb#25
  def namespace=(_arg0); end

  # Returns the value of attribute port.
  #
  # source://spamurai-dev-kit//lib/lib/stats.rb#23
  def port; end

  # Sets the attribute port
  #
  # @param value the value to set the attribute port to.
  #
  # source://spamurai-dev-kit//lib/lib/stats.rb#23
  def port=(_arg0); end

  # source://spamurai-dev-kit//lib/lib/stats.rb#39
  def service_check(name, status, opts = T.unsafe(nil)); end

  # source://spamurai-dev-kit//lib/lib/stats.rb#38
  def set(stat, value, opts = T.unsafe(nil)); end

  # Returns the value of attribute tags.
  #
  # source://spamurai-dev-kit//lib/lib/stats.rb#24
  def tags; end

  # Sets the attribute tags
  #
  # @param value the value to set the attribute tags to.
  #
  # source://spamurai-dev-kit//lib/lib/stats.rb#24
  def tags=(_arg0); end

  # source://spamurai-dev-kit//lib/lib/stats.rb#37
  def time(stat, opts = T.unsafe(nil)); end

  # source://spamurai-dev-kit//lib/lib/stats.rb#36
  def timing(stat, ms, opts = T.unsafe(nil)); end
end
