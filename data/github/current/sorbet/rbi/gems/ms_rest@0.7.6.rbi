# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for types exported from the `ms_rest` gem.
# Please instead update this file by running `bin/tapioca gem ms_rest`.

# source://ms_rest//lib/ms_rest/version.rb#5
module MsRest
  class << self
    # @return [Hash] Hash of SSL options to be used for Faraday connection.
    #
    # source://ms_rest//lib/ms_rest/service_client.rb#112
    def ssl_options; end

    # Stores the SSL options to be used for Faraday connections.
    # ==== Examples
    #   MsRest.use_ssl_cert                                  # => Uses bundled certificate for all the connections
    #   MsRest.use_ssl_cert({:ca_file => "path_to_ca_file"}) # => Uses supplied certificate for all the connections
    #
    # @param ssl_options [Hash] Hash of SSL options for Faraday connection. It defaults to the bundled certificate.
    #
    # source://ms_rest//lib/ms_rest/service_client.rb#101
    def use_ssl_cert(ssl_options = T.unsafe(nil)); end
  end
end

# source://ms_rest//lib/ms_rest/credentials/basic_authentication_credentials.rb#10
class MsRest::BasicAuthenticationCredentials < ::MsRest::ServiceClientCredentials
  # Creates and initialize new instance of the BasicAuthenticationCredentials class.
  #
  # @param user_name [String] the username for authentication.
  # @param password [String] the password for authentication.
  # @param scheme = DEFAULT_SCHEME [String] the scheme for composing credentials.
  # @return [BasicAuthenticationCredentials] a new instance of BasicAuthenticationCredentials
  #
  # source://ms_rest//lib/ms_rest/credentials/basic_authentication_credentials.rb#32
  def initialize(user_name, password, scheme = T.unsafe(nil)); end

  # Attaches basic authentication header to the given HTTP request.
  #
  # @param request [Net::HTTPRequest] the request authentication header needs to be attached to.
  # @return [Net::HTTPRequest] request with attached authentication header.
  #
  # source://ms_rest//lib/ms_rest/credentials/basic_authentication_credentials.rb#47
  def sign_request(request); end

  private

  # @return [String] password for authentication.
  #
  # source://ms_rest//lib/ms_rest/credentials/basic_authentication_credentials.rb#23
  def password; end

  # @return [String] password for authentication.
  #
  # source://ms_rest//lib/ms_rest/credentials/basic_authentication_credentials.rb#23
  def password=(_arg0); end

  # @return [String] the scheme for composing credentials.
  #
  # source://ms_rest//lib/ms_rest/credentials/basic_authentication_credentials.rb#17
  def scheme; end

  # @return [String] the scheme for composing credentials.
  #
  # source://ms_rest//lib/ms_rest/credentials/basic_authentication_credentials.rb#17
  def scheme=(_arg0); end

  # @return [String] the username for authentication.
  #
  # source://ms_rest//lib/ms_rest/credentials/basic_authentication_credentials.rb#20
  def user_name; end

  # @return [String] the username for authentication.
  #
  # source://ms_rest//lib/ms_rest/credentials/basic_authentication_credentials.rb#20
  def user_name=(_arg0); end
end

# source://ms_rest//lib/ms_rest/credentials/basic_authentication_credentials.rb#14
MsRest::BasicAuthenticationCredentials::DEFAULT_SCHEME = T.let(T.unsafe(nil), String)

# Class which represents an error happening during deserialization of server response.
#
# source://ms_rest//lib/ms_rest/deserialization_error.rb#10
class MsRest::DeserializationError < ::MsRest::RestError
  # Creates and initialize new instance of the DeserializationError class.
  #
  # @param message [String] message the human readable description of error.
  # @param exception_message [String] the inner exception stacktrace.
  # @param exception_stacktrace [String] the inner exception stacktrace.
  # @param the [MsRest::HttpOperationResponse] request and response
  # @return [DeserializationError] a new instance of DeserializationError
  #
  # source://ms_rest//lib/ms_rest/deserialization_error.rb#27
  def initialize(msg, exception_message, exception_stacktrace, result); end

  # @return [String] the inner exception message.
  #
  # source://ms_rest//lib/ms_rest/deserialization_error.rb#13
  def exception_message; end

  # @return [String] the inner exception message.
  #
  # source://ms_rest//lib/ms_rest/deserialization_error.rb#13
  def exception_message=(_arg0); end

  # @return [String] the inner exception stacktrace.
  #
  # source://ms_rest//lib/ms_rest/deserialization_error.rb#16
  def exception_stacktrace; end

  # @return [String] the inner exception stacktrace.
  #
  # source://ms_rest//lib/ms_rest/deserialization_error.rb#16
  def exception_stacktrace=(_arg0); end

  # @return [MsRest::HttpOperationResponse] server response which client was unable to parse.
  #
  # source://ms_rest//lib/ms_rest/deserialization_error.rb#19
  def result; end

  # @return [MsRest::HttpOperationResponse] server response which client was unable to parse.
  #
  # source://ms_rest//lib/ms_rest/deserialization_error.rb#19
  def result=(_arg0); end

  # source://ms_rest//lib/ms_rest/deserialization_error.rb#34
  def to_json(*a); end

  # source://ms_rest//lib/ms_rest/deserialization_error.rb#38
  def to_s; end
end

# Class which represents an error meaning that either HTTP request or HTTP response was invalid.
#
# source://ms_rest//lib/ms_rest/http_operation_error.rb#10
class MsRest::HttpOperationError < ::MsRest::RestError
  # Creates and initialize new instance of the HttpOperationException class.
  #
  # @param the [Hash] HTTP request data (uri, body, headers).
  # @param the [Faraday::Response] HTTP response object.
  # @param body [String] the HTTP response body.
  # @param error [String] message.
  # @return [HttpOperationError] a new instance of HttpOperationError
  #
  # source://ms_rest//lib/ms_rest/http_operation_error.rb#28
  def initialize(*args); end

  # @return [String] the HTTP response body.
  #
  # source://ms_rest//lib/ms_rest/http_operation_error.rb#19
  def body; end

  # @return [String] the HTTP response body.
  #
  # source://ms_rest//lib/ms_rest/http_operation_error.rb#19
  def body=(_arg0); end

  # @return [Hash] the HTTP request data (uri, body, headers).
  #
  # source://ms_rest//lib/ms_rest/http_operation_error.rb#13
  def request; end

  # @return [Hash] the HTTP request data (uri, body, headers).
  #
  # source://ms_rest//lib/ms_rest/http_operation_error.rb#13
  def request=(_arg0); end

  # @return [Faraday::Response] the HTTP response object.
  #
  # source://ms_rest//lib/ms_rest/http_operation_error.rb#16
  def response; end

  # @return [Faraday::Response] the HTTP response object.
  #
  # source://ms_rest//lib/ms_rest/http_operation_error.rb#16
  def response=(_arg0); end

  # source://ms_rest//lib/ms_rest/http_operation_error.rb#58
  def to_json(*a); end

  # source://ms_rest//lib/ms_rest/http_operation_error.rb#63
  def to_s; end
end

# Class which represents the data received and deserialized from server.
#
# source://ms_rest//lib/ms_rest/http_operation_request.rb#9
class MsRest::HttpOperationRequest
  # Creates and initialize new instance of the HttpOperationResponse class.
  #
  # @param base [String|URI] uri for requests
  # @param path [String] template /{replace}/{url_param}
  # @param http [String] method for the request
  # @param body [Hash] the HTTP response body.
  # @return [HttpOperationRequest] a new instance of HttpOperationRequest
  #
  # source://ms_rest//lib/ms_rest/http_operation_request.rb#52
  def initialize(base_uri, path_template, method, options = T.unsafe(nil)); end

  # @return [String] base uri of the request
  #
  # source://ms_rest//lib/ms_rest/http_operation_request.rb#24
  def base_uri; end

  # @return [String] base uri of the request
  #
  # source://ms_rest//lib/ms_rest/http_operation_request.rb#24
  def base_uri=(_arg0); end

  # @return [String] the HTTP response body.
  #
  # source://ms_rest//lib/ms_rest/http_operation_request.rb#36
  def body; end

  # @return [String] the HTTP response body.
  #
  # source://ms_rest//lib/ms_rest/http_operation_request.rb#36
  def body=(_arg0); end

  # Creates a path from the path template and the path_params and skip_encoding_path_params
  #
  # @return [URI] body the HTTP response body.
  #
  # source://ms_rest//lib/ms_rest/http_operation_request.rb#98
  def build_path; end

  # source://ms_rest//lib/ms_rest/http_operation_request.rb#109
  def full_uri; end

  # @return [Hash] request headers
  #
  # source://ms_rest//lib/ms_rest/http_operation_request.rb#30
  def headers; end

  # @return [Hash] request headers
  #
  # source://ms_rest//lib/ms_rest/http_operation_request.rb#30
  def headers=(_arg0); end

  # @return [String] full - to log requests, responses and bodies, partial - just requests and responses without body
  #
  # source://ms_rest//lib/ms_rest/http_operation_request.rb#42
  def log; end

  # @return [String] full - to log requests, responses and bodies, partial - just requests and responses without body
  #
  # source://ms_rest//lib/ms_rest/http_operation_request.rb#42
  def log=(_arg0); end

  # @return [String] http request method
  #
  # source://ms_rest//lib/ms_rest/http_operation_request.rb#33
  def method; end

  # @return [String] http request method
  #
  # source://ms_rest//lib/ms_rest/http_operation_request.rb#33
  def method=(_arg0); end

  # @return [Array] the list of middlewares to apply to the Request
  #
  # source://ms_rest//lib/ms_rest/http_operation_request.rb#39
  def middlewares; end

  # @return [Array] the list of middlewares to apply to the Request
  #
  # source://ms_rest//lib/ms_rest/http_operation_request.rb#39
  def middlewares=(_arg0); end

  # @return [Hash] path parameters to be ERB::Util.url_encode encoded
  #
  # source://ms_rest//lib/ms_rest/http_operation_request.rb#12
  def path_params; end

  # @return [Hash] path parameters to be ERB::Util.url_encode encoded
  #
  # source://ms_rest//lib/ms_rest/http_operation_request.rb#12
  def path_params=(_arg0); end

  # @return [String] path template /{replace}/{url_param}
  #
  # source://ms_rest//lib/ms_rest/http_operation_request.rb#27
  def path_template; end

  # @return [String] path template /{replace}/{url_param}
  #
  # source://ms_rest//lib/ms_rest/http_operation_request.rb#27
  def path_template=(_arg0); end

  # @return [Hash] query parameters to be ERB::Util.url_encode encoded
  #
  # source://ms_rest//lib/ms_rest/http_operation_request.rb#18
  def query_params; end

  # @return [Hash] query parameters to be ERB::Util.url_encode encoded
  #
  # source://ms_rest//lib/ms_rest/http_operation_request.rb#18
  def query_params=(_arg0); end

  # Creates a promise which will execute the request. Block will yield the request for customization.
  #
  # @return [URI] body the HTTP response body.
  #
  # source://ms_rest//lib/ms_rest/http_operation_request.rb#69
  def run_promise(&block); end

  # @return [Hash] path parameters not to be ERB::Util.url_encode encoded
  #
  # source://ms_rest//lib/ms_rest/http_operation_request.rb#15
  def skip_encoding_path_params; end

  # @return [Hash] path parameters not to be ERB::Util.url_encode encoded
  #
  # source://ms_rest//lib/ms_rest/http_operation_request.rb#15
  def skip_encoding_path_params=(_arg0); end

  # @return [Hash] query parameters to be ERB::Util.url_encode encoded
  #
  # source://ms_rest//lib/ms_rest/http_operation_request.rb#21
  def skip_encoding_query_params; end

  # @return [Hash] query parameters to be ERB::Util.url_encode encoded
  #
  # source://ms_rest//lib/ms_rest/http_operation_request.rb#21
  def skip_encoding_query_params=(_arg0); end

  # source://ms_rest//lib/ms_rest/http_operation_request.rb#117
  def to_json(*a); end

  # source://ms_rest//lib/ms_rest/http_operation_request.rb#113
  def user_agent; end

  # @return [Array] strings to be appended to the user agent in the request
  #
  # source://ms_rest//lib/ms_rest/http_operation_request.rb#45
  def user_agent_extended; end

  # @return [Array] strings to be appended to the user agent in the request
  #
  # source://ms_rest//lib/ms_rest/http_operation_request.rb#45
  def user_agent_extended=(_arg0); end
end

# Class which represents the data received and deserialized from server.
#
# source://ms_rest//lib/ms_rest/http_operation_response.rb#9
class MsRest::HttpOperationResponse
  # Creates and initialize new instance of the HttpOperationResponse class.
  #
  # @param request [MsRest::HttpOperationRequest] the HTTP request object.
  # @param response [Faraday::Response] the HTTP response object.
  # @param body [String] the HTTP response body.
  # @return [HttpOperationResponse] a new instance of HttpOperationResponse
  #
  # source://ms_rest//lib/ms_rest/http_operation_response.rb#25
  def initialize(request, response, body = T.unsafe(nil)); end

  # @return [String] the HTTP response body.
  #
  # source://ms_rest//lib/ms_rest/http_operation_response.rb#18
  def body; end

  # @return [String] the HTTP response body.
  #
  # source://ms_rest//lib/ms_rest/http_operation_response.rb#18
  def body=(_arg0); end

  # @param the [MsRest::HttpOperationRequest] HTTP request data.
  #
  # source://ms_rest//lib/ms_rest/http_operation_response.rb#12
  def request; end

  # @param the [MsRest::HttpOperationRequest] HTTP request data.
  #
  # source://ms_rest//lib/ms_rest/http_operation_response.rb#12
  def request=(_arg0); end

  # @return [Faraday::Response] the HTTP response object.
  #
  # source://ms_rest//lib/ms_rest/http_operation_response.rb#15
  def response; end

  # @return [Faraday::Response] the HTTP response object.
  #
  # source://ms_rest//lib/ms_rest/http_operation_response.rb#15
  def response=(_arg0); end

  # source://ms_rest//lib/ms_rest/http_operation_response.rb#31
  def to_json(*a); end
end

# Mixin to provide simple serialization / deserialization in AutoRest generated model classes
#
# source://ms_rest//lib/ms_rest/jsonable.rb#7
module MsRest::JSONable
  include ::MsRest::Serialization

  # Deserialize the object from JSON
  #
  # @param json [String] JSON string representation of the object
  # @return [JSONable] object built from json input
  #
  # source://ms_rest//lib/ms_rest/jsonable.rb#26
  def from_json(json, mapper = T.unsafe(nil)); end

  # Serialize the object to JSON
  #
  # @param options [Hash] hash map contains options to convert to json.
  # @return [String] JSON serialized version of the object
  #
  # source://ms_rest//lib/ms_rest/jsonable.rb#15
  def to_json(options = T.unsafe(nil)); end

  # String representation of the object
  #
  # @return [String]
  #
  # source://ms_rest//lib/ms_rest/jsonable.rb#35
  def to_s; end
end

# Class which represents an general exception for REST client.
#
# source://ms_rest//lib/ms_rest/rest_error.rb#9
class MsRest::RestError < ::StandardError; end

# Class which handles retry policy.
#
# source://ms_rest//lib/ms_rest/retry_policy_middleware.rb#9
class MsRest::RetryPolicyMiddleware < ::Faraday::Response::Middleware
  # Initializes a new instance of the RetryPolicyMiddleware class.
  #
  # @return [RetryPolicyMiddleware] a new instance of RetryPolicyMiddleware
  #
  # source://ms_rest//lib/ms_rest/retry_policy_middleware.rb#13
  def initialize(app, options = T.unsafe(nil)); end

  # Performs request and response processing.
  #
  # source://ms_rest//lib/ms_rest/retry_policy_middleware.rb#23
  def call(request_env); end
end

# Base module for Ruby serialization and deserialization.
#
# Provides methods to serialize Ruby object into Ruby Hash and
# to deserialize Ruby Hash into Ruby object.
#
# source://ms_rest//lib/ms_rest/serialization.rb#10
module MsRest::Serialization
  # Deserialize the response from the server using the mapper.
  #
  # @param mapper [Hash] Ruby Hash object to represent expected structure of the response_body.
  # @param response_body [Hash] Ruby Hash object to deserialize.
  # @param object_name [String] Name of the deserialized object.
  #
  # source://ms_rest//lib/ms_rest/serialization.rb#18
  def deserialize(mapper, response_body); end

  # Serialize the Ruby object into Ruby Hash to send it to the server using the mapper.
  #
  # @param mapper [Hash] Ruby Hash object to represent expected structure of the object.
  # @param object [Object] Ruby object to serialize.
  # @param object_name [String] Name of the serialized object.
  #
  # source://ms_rest//lib/ms_rest/serialization.rb#29
  def serialize(mapper, object); end

  private

  # Builds serializer
  #
  # source://ms_rest//lib/ms_rest/serialization.rb#38
  def build_serializer; end
end

# Class to handle serialization & deserialization.
#
# source://ms_rest//lib/ms_rest/serialization.rb#45
class MsRest::Serialization::Serialization
  # @return [Serialization] a new instance of Serialization
  #
  # source://ms_rest//lib/ms_rest/serialization.rb#46
  def initialize(context); end

  # Deserialize the response from the server using the mapper.
  #
  # @param mapper [Hash] Ruby Hash object to represent expected structure of the response_body.
  # @param response_body [Hash] Ruby Hash object to deserialize.
  # @param object_name [String] Name of the deserialized object.
  #
  # source://ms_rest//lib/ms_rest/serialization.rb#57
  def deserialize(mapper, response_body); end

  # Deserialize the response of composite type from the server using the mapper.
  #
  # @param mapper [Hash] Ruby Hash object to represent expected structure of the response_body.
  # @param response_body [Hash] Ruby Hash object to deserialize.
  # @param object_name [String] Name of the deserialized object.
  #
  # source://ms_rest//lib/ms_rest/serialization.rb#146
  def deserialize_composite_type(mapper, response_body, object_name); end

  # Deserialize the response of dictionary type from the server using the mapper.
  #
  # @param mapper [Hash] Ruby Hash object to represent expected structure of the response_body.
  # @param response_body [Hash] Ruby Hash object to deserialize.
  # @param object_name [String] Name of the deserialized object.
  #
  # source://ms_rest//lib/ms_rest/serialization.rb#127
  def deserialize_dictionary_type(mapper, response_body, object_name); end

  # Deserialize the response of known primary type from the server using the mapper.
  #
  # @param mapper [Hash] Ruby Hash object to represent expected structure of the response_body.
  # @param response_body [Hash] Ruby Hash object to deserialize.
  #
  # source://ms_rest//lib/ms_rest/serialization.rb#86
  def deserialize_primary_type(mapper, response_body); end

  # Deserialize the response of sequence type from the server using the mapper.
  #
  # @param mapper [Hash] Ruby Hash object to represent expected structure of the response_body.
  # @param response_body [Hash] Ruby Hash object to deserialize.
  # @param object_name [String] Name of the deserialized object.
  #
  # source://ms_rest//lib/ms_rest/serialization.rb#193
  def deserialize_sequence_type(mapper, response_body, object_name); end

  # Checks whether given enum_value is valid for the mapper or not
  #
  # @param mapper [Hash] Ruby Hash object containing meta data
  # @param enum_value [String] Enum value to validate
  #
  # source://ms_rest//lib/ms_rest/serialization.rb#451
  def enum_is_valid(mapper, enum_value); end

  # Retrieves model of the model_name
  #
  # @param model_name [String] Name of the model to retrieve.
  #
  # source://ms_rest//lib/ms_rest/serialization.rb#428
  def get_model(model_name); end

  # Serialize the Ruby object into Ruby Hash to send it to the server using the mapper.
  #
  # @param mapper [Hash] Ruby Hash object to represent expected structure of the object.
  # @param object [Object] Ruby object to serialize.
  # @param object_name [String] Name of the serialized object.
  #
  # source://ms_rest//lib/ms_rest/serialization.rb#215
  def serialize(mapper, object); end

  # Serialize the Ruby object of composite type into Ruby Hash to send it to the server using the mapper.
  #
  # @param mapper [Hash] Ruby Hash object to represent expected structure of the object.
  # @param object [Object] Ruby object to serialize.
  # @param object_name [String] Name of the serialized object.
  #
  # source://ms_rest//lib/ms_rest/serialization.rb#347
  def serialize_composite_type(mapper, object, object_name); end

  # Serialize the Ruby object of dictionary type into Ruby Hash to send it to the server using the mapper.
  #
  # @param mapper [Hash] Ruby Hash object to represent expected structure of the object.
  # @param object [Object] Ruby object to serialize.
  # @param object_name [String] Name of the serialized object.
  #
  # source://ms_rest//lib/ms_rest/serialization.rb#320
  def serialize_dictionary_type(mapper, object, object_name); end

  # Serialize the Ruby object of known primary type into Ruby Hash to send it to the server using the mapper.
  #
  # @param mapper [Hash] Ruby Hash object to represent expected structure of the object.
  # @param object [Object] Ruby object to serialize.
  #
  # source://ms_rest//lib/ms_rest/serialization.rb#288
  def serialize_primary_type(mapper, object); end

  # Serialize the Ruby object of sequence type into Ruby Hash to send it to the server using the mapper.
  #
  # @param mapper [Hash] Ruby Hash object to represent expected structure of the object.
  # @param object [Object] Ruby object to serialize.
  # @param object_name [String] Name of the serialized object.
  #
  # source://ms_rest//lib/ms_rest/serialization.rb#404
  def serialize_sequence_type(mapper, object, object_name); end

  # Splits serialized_name with '.' to compute levels of object hierarchy
  #
  # @param serialized_name [String] Name to split
  #
  # source://ms_rest//lib/ms_rest/serialization.rb#464
  def split_serialized_name(serialized_name); end

  # source://ms_rest//lib/ms_rest/serialization.rb#244
  def validate_constraints(mapper, object, object_name); end
end

# Class which represents a point of access to the REST API.
#
# source://ms_rest//lib/ms_rest/service_client.rb#9
class MsRest::ServiceClient
  # Creates and initialize new instance of the ServiceClient class.
  #
  # HTTP requests made by the service client.
  #
  # @param credentials [MsRest::ServiceClientCredentials] credentials to authorize
  # @param options additional parameters for the HTTP request (not implemented yet).
  # @return [ServiceClient] a new instance of ServiceClient
  #
  # source://ms_rest//lib/ms_rest/service_client.rb#30
  def initialize(credentials = T.unsafe(nil), options = T.unsafe(nil)); end

  # Add additional information into User-Agent header.
  # Example:
  #  recommended format is Product/[version]
  #  please refer https://github.com/Azure/azure-sdk-for-ruby/issues/517 for more information.
  #
  #  add_user_agent_information('fog-azure-rm/0.2.0')
  #
  # @param additional_user_agent_information [String] additional product information for user agent string.
  #
  # source://ms_rest//lib/ms_rest/service_client.rb#71
  def add_user_agent_information(additional_user_agent_information); end

  # @return [MsRest::ServiceClientCredentials] the credentials object.
  #
  # source://ms_rest//lib/ms_rest/service_client.rb#12
  def credentials; end

  # @return [MsRest::ServiceClientCredentials] the credentials object.
  #
  # source://ms_rest//lib/ms_rest/service_client.rb#12
  def credentials=(_arg0); end

  # @param base_url [String] the base url for the request.
  # @param method [Symbol] with any of the following values :get, :put, :post, :patch, :delete.
  # @param path [String] the path, relative to {base_url}.
  # @param options [Hash{String=>String}] specifying any request options like :credentials, :body, etc.
  # @return [Concurrent::Promise] Promise object which holds the HTTP response.
  #
  # source://ms_rest//lib/ms_rest/service_client.rb#45
  def make_request_async(base_url, method, path, options = T.unsafe(nil)); end

  # @return [Hash{String=>String}] default middlewares configuration for requests.
  #
  # source://ms_rest//lib/ms_rest/service_client.rb#15
  def middlewares; end

  # @return [Hash{String=>String}] default middlewares configuration for requests.
  #
  # source://ms_rest//lib/ms_rest/service_client.rb#15
  def middlewares=(_arg0); end

  # @return [Hash{String=>String}] default request headers for requests.
  #
  # source://ms_rest//lib/ms_rest/service_client.rb#18
  def request_headers; end

  # @return [Hash{String=>String}] default request headers for requests.
  #
  # source://ms_rest//lib/ms_rest/service_client.rb#18
  def request_headers=(_arg0); end

  # @return [Array] strings to be appended to the user agent in the request
  #
  # source://ms_rest//lib/ms_rest/service_client.rb#21
  def user_agent_extended; end

  # @return [Array] strings to be appended to the user agent in the request
  #
  # source://ms_rest//lib/ms_rest/service_client.rb#21
  def user_agent_extended=(_arg0); end

  private

  # Retrieves a new instance of the HttpOperationResponse class.
  #
  # @param request [MsRest::HttpOperationRequest] the HTTP request object.
  # @param response [Faraday::Response] the HTTP response object.
  # @param body [String] the HTTP response body.
  # @return [MsRest::HttpOperationResponse] the operation response.
  #
  # source://ms_rest//lib/ms_rest/service_client.rb#83
  def create_response(request, http_response, body = T.unsafe(nil)); end
end

# Class that serves as a base for all authentications classes.
#
# source://ms_rest//lib/ms_rest/credentials/service_client_credentials.rb#9
class MsRest::ServiceClientCredentials
  # Base method for performing authentication of HTTP requests.
  #
  # @param request [Net::HTTPRequest] HTTP request to authenticate
  # @return [Net::HTTPRequest] authenticated HTTP request
  #
  # source://ms_rest//lib/ms_rest/credentials/service_client_credentials.rb#18
  def sign_request(request); end
end

# source://ms_rest//lib/ms_rest/credentials/service_client_credentials.rb#11
MsRest::ServiceClientCredentials::AUTHORIZATION = T.let(T.unsafe(nil), String)

# Class that provides access to authentication token.
#
# source://ms_rest//lib/ms_rest/credentials/string_token_provider.rb#9
class MsRest::StringTokenProvider < ::MsRest::TokenProvider
  # @param token [String] the access token.
  # @param token_type [String] the token type.
  # @return [StringTokenProvider] a new instance of StringTokenProvider
  #
  # source://ms_rest//lib/ms_rest/credentials/string_token_provider.rb#27
  def initialize(token, token_type = T.unsafe(nil)); end

  # Returns the string value which needs to be attached
  # to HTTP request header in order to be authorized.
  #
  # @return [String] authentication headers.
  #
  # source://ms_rest//lib/ms_rest/credentials/string_token_provider.rb#37
  def get_authentication_header; end

  private

  # @return [String] the access token.
  #
  # source://ms_rest//lib/ms_rest/credentials/string_token_provider.rb#14
  def token; end

  # @return [String] the access token.
  #
  # source://ms_rest//lib/ms_rest/credentials/string_token_provider.rb#14
  def token=(_arg0); end

  # @return [String] the token type.
  #
  # source://ms_rest//lib/ms_rest/credentials/string_token_provider.rb#17
  def token_type; end

  # @return [String] the token type.
  #
  # source://ms_rest//lib/ms_rest/credentials/string_token_provider.rb#17
  def token_type=(_arg0); end
end

# Class which keeps functionality and date for performing OAuth (token based) authentication.
#
# source://ms_rest//lib/ms_rest/credentials/token_credentials.rb#9
class MsRest::TokenCredentials < ::MsRest::ServiceClientCredentials
  # Creates and initialize new instance of the TokenCredentials class.
  #
  # @param token_provider [TokenProvider] the token provider.
  # @param token [String] the token.
  # @return [TokenCredentials] a new instance of TokenCredentials
  #
  # source://ms_rest//lib/ms_rest/credentials/token_credentials.rb#24
  def initialize(*args); end

  # Attaches OAuth authentication header to the given HTTP request.
  #
  # @param request [Net::HTTPRequest] the request authentication header needs to be attached to.
  # @return [Net::HTTPRequest] request with attached authentication header
  #
  # source://ms_rest//lib/ms_rest/credentials/token_credentials.rb#47
  def sign_request(request); end

  private

  # @return [String] the scheme for arranging token in the HTTP header.
  #
  # source://ms_rest//lib/ms_rest/credentials/token_credentials.rb#16
  def token_provider; end

  # @return [String] the scheme for arranging token in the HTTP header.
  #
  # source://ms_rest//lib/ms_rest/credentials/token_credentials.rb#16
  def token_provider=(_arg0); end
end

# source://ms_rest//lib/ms_rest/credentials/token_credentials.rb#13
MsRest::TokenCredentials::DEFAULT_SCHEME = T.let(T.unsafe(nil), String)

# Class that provides access to authentication token.
#
# source://ms_rest//lib/ms_rest/credentials/token_provider.rb#9
class MsRest::TokenProvider
  # Returns the string value which needs to be attached
  # to HTTP request header in order to be authorized.
  #
  # @return [String] authentication headers.
  #
  # source://ms_rest//lib/ms_rest/credentials/token_provider.rb#16
  def get_authentication_header; end
end

# source://ms_rest//lib/ms_rest/version.rb#6
MsRest::VERSION = T.let(T.unsafe(nil), String)

# Class which represents an error meaning that invalid Model object was created by user or provided from server.
#
# source://ms_rest//lib/ms_rest/validation_error.rb#9
class MsRest::ValidationError < ::MsRest::RestError; end
