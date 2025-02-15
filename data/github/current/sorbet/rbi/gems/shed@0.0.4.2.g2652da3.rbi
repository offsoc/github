# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for types exported from the `shed` gem.
# Please instead update this file by running `bin/tapioca gem shed`.

# `Shed` implements client and server middlewares enabling cross-service
# timeout propagation and load-shedding in order to improve the performance and
# reliability of your services by mitigating cascading failures in scenarios
# where a services experience increased latency.
#
# source://shed//lib/shed.rb#7
module Shed
  class << self
    # {clear_timeout} will clear any timeout set in the current context.
    #
    # @return [void]
    #
    # source://shed//lib/shed.rb#68
    def clear_timeout; end

    # {ensure_time_left!} raises {Timeout} if there is no {time_left?} based on
    # the configured timeout.
    #
    # Does not raise if no timeout has been configured.
    #
    # @raise [Timeout]
    #
    # source://shed//lib/shed.rb#95
    def ensure_time_left!; end

    # {register_faraday_middleware!} registers {Shed::FaradayMiddleware} on
    # `Faraday::Request`, allowing it to be used in faraday connections.
    #
    # source://shed//lib/shed.rb#34
    def register_faraday_middleware!; end

    # {time_left?} returns whether there is any time left in based on the
    # configured timeout.
    #
    # Always returns `true` when no timeout is set.
    #
    # @return [Boolean]
    #
    # source://shed//lib/shed.rb#105
    def time_left?; end

    # {time_left_ms} will return the duration left in the current timeout
    # period (in milliseconds).
    #
    # Returns `nil` if no timeout has been set.
    #
    # @return [Integer, nil]
    #
    # source://shed//lib/shed.rb#78
    def time_left_ms; end

    # {timeout_set?} returns whether there is a timeout set in the current
    # context.
    #
    # @return [Boolean]
    #
    # source://shed//lib/shed.rb#44
    def timeout_set?; end

    # {with_timeout} sets the timeout deadline for the current context.
    #
    # By default will only allow setting a new timeout with a deadline that is
    # _earlier_ than the currently configured deadline. This behaviour can be
    # overriden by setting `force: true` to extend the deadline.
    #
    # @param ms [Integer] the timeout in milliseconds.
    # @param force: [Boolean] whether to force the current timeout.
    # @return [void]
    #
    # source://shed//lib/shed.rb#57
    def with_timeout(ms, force: T.unsafe(nil)); end

    private

    # @return [Boolean]
    #
    # source://shed//lib/shed.rb#113
    def earlier?(deadline); end

    # source://shed//lib/shed.rb#123
    def now_ms; end

    # source://shed//lib/shed.rb#119
    def store; end
  end
end

# {ActiveRecord} defines modules for common
# `ActiveRecord::ConnectionAdapters` which can be prepended in order to
# respec timeouts/deadlines set by {Shed}.
#
# source://shed//lib/shed/active_record.rb#7
module Shed::ActiveRecord
  class << self
    # {setup!} prepends the appropriate {Shed::ActiveRecord} module to their
    # corresponding `ActiveRecord::ConnectionAdapters` class.
    #
    # source://shed//lib/shed/active_record.rb#10
    def setup!; end
  end
end

# {Adapter} implements support for {Shed} timeouts/deadlines checking for
# any `ActiveRecord::ConnectionAdapters`.
#
# It is intended to be prepended to the connection adapter in use by the
# application, it will check if the current deadline is exceeded via
# {Shed.ensure_time_left!} before calling the underlying querying function.
#
# This does not prevent a specific query from over-running the
# {Shed.time_left_ms} as it does _not_ set any specific timeout on the
# connection or for the query. The default timeout values are respected and
# should be set.
#
# source://shed//lib/shed/active_record.rb#36
module Shed::ActiveRecord::Adapter
  # source://shed//lib/shed/active_record.rb#55
  def exec_delete(sql, name = T.unsafe(nil), binds = T.unsafe(nil)); end

  # source://shed//lib/shed/active_record.rb#49
  def exec_insert(sql, name = T.unsafe(nil), binds = T.unsafe(nil), pk = T.unsafe(nil), sequence_name = T.unsafe(nil)); end

  # source://shed//lib/shed/active_record.rb#43
  def exec_query(sql, name = T.unsafe(nil), binds = T.unsafe(nil), prepare: T.unsafe(nil), async: T.unsafe(nil)); end

  # source://shed//lib/shed/active_record.rb#61
  def exec_update(sql, name = T.unsafe(nil), binds = T.unsafe(nil)); end

  # source://shed//lib/shed/active_record.rb#37
  def execute(sql, name = T.unsafe(nil)); end
end

# {MySQL2OptimizerHints} is intended to be prepended to
# `ActiveRecord::Relation`, it will cause all queries to have the
# `MAX_EXECUTION_TIME` optimizer hint added, propagating the current
# deadline (if set) to the database.
#
# @note MySQL only supports MAX_EXECUTION_TIME for SELECT queries, it will
#   silently ignore this timeout for other queries.
#
# source://shed//lib/shed/active_record.rb#75
module Shed::ActiveRecord::MySQL2OptimizerHints
  # source://shed//lib/shed/active_record.rb#76
  def optimizer_hints_values; end
end

# {FaradayMiddleware} implements a faraday middleware which propagates the
# timeout left the current request to the destination host via the
# `X-Client-Timeout-Ms` request header.
#
# source://shed//lib/shed/faraday_middleware.rb#9
class Shed::FaradayMiddleware < ::Faraday::Middleware
  # {call} sets the `X-Client-Timeout-Ms` to the lesser of the already
  # configured faraday timeout or the currently configured {Shed} timeout.
  #
  # @param env [Faraday::Env] the current request environment.
  # @return [Faraday::Response] The response to the request.
  #
  # source://shed//lib/shed/faraday_middleware.rb#15
  def call(env); end

  private

  # source://shed//lib/shed/faraday_middleware.rb#37
  def request_timeout_ms(env); end

  # source://shed//lib/shed/faraday_middleware.rb#44
  def shed_timeout_ms; end

  # source://shed//lib/shed/faraday_middleware.rb#30
  def timeout_ms(env); end
end

# {HTTP_HEADER} defines the canonical HTTP header used to propagate client
# timeouts across services.
#
# source://shed//lib/shed.rb#24
Shed::HTTP_HEADER = T.let(T.unsafe(nil), String)

# {HerokuDelta} implements a delta function for use in applications deployed
# to Heroku.
#
# Heroku sets the `X-Request-Start` header when ingesting request in its
# routing-layer. The value of this header is the UNIX timestamp (in
# milliseconds) at which the request is processed.
#
# In scenarios where the ruby webservers are under load requests will be
# queued. This delta calculator ensures that the queue time is taken into
# account when setting the timeout for the current timeout.
#
# source://shed//lib/shed/heroku_delta.rb#14
class Shed::HerokuDelta
  class << self
    # {call} returns the duration (in milliseconds) between the current time
    # and the time Heroku received this requested. Effectively measuring queue
    # time.
    #
    # Handles cases where the header is missing or clock-drift leads to the
    # header being in the future by returning 0.
    #
    # @param env [Hash] The rack request env hash.
    #
    # source://shed//lib/shed/heroku_delta.rb#27
    def call(env); end
  end
end

# {RACK_HTTP_START_HEADER} contains the rack definition of the
# `X-Request-Start` HTTP header set by Heroku when receiving a request.
#
# source://shed//lib/shed/heroku_delta.rb#17
Shed::HerokuDelta::RACK_HTTP_START_HEADER = T.let(T.unsafe(nil), String)

# {KEY} defines the key for the fiber-local variable containing the current
# deadline.
#
# source://shed//lib/shed.rb#28
Shed::KEY = T.let(T.unsafe(nil), String)

# source://shed//lib/shed/postgresql_connection.rb#4
module Shed::PostgreSQLConnection; end

# {WithDeadlinePropagation} adds support for deadline propagation to a
# `PG::Connection` by patching synchronous query methods to make use of
# `libpq`'s asynchronous non-blocking APIs to timeout and cancel any
# ongoing query after {Shed.time_left_ms} has been exceeded.
#
# Query methods canceled due to exceeding their deadline will wrap any
# `PG::QueryCanceled` as {Shed::Timeout}.
#
# source://shed//lib/shed/postgresql_connection.rb#12
module Shed::PostgreSQLConnection::WithDeadlinePropagation
  # source://shed//lib/shed/postgresql_connection.rb#13
  def async_exec(*args, &block); end

  # source://shed//lib/shed/postgresql_connection.rb#20
  def async_exec_params(*args, &block); end

  # source://shed//lib/shed/postgresql_connection.rb#27
  def async_exec_prepared(*args, &block); end

  # source://shed//lib/shed/postgresql_connection.rb#13
  def exec(*args, &block); end

  # source://shed//lib/shed/postgresql_connection.rb#20
  def exec_params(*args, &block); end

  # source://shed//lib/shed/postgresql_connection.rb#27
  def exec_prepared(*args, &block); end

  private

  # source://shed//lib/shed/postgresql_connection.rb#36
  def with_timeout(result_block, &query); end
end

# {Wrapper} provides a `SimpleDelegator` for a `PG::Connection` which
# includes behaviour provided by {WithDeadlinePropagation}.
#
# source://shed//lib/shed/postgresql_connection.rb#62
class Shed::PostgreSQLConnection::Wrapper < ::SimpleDelegator
  include ::Shed::PostgreSQLConnection::WithDeadlinePropagation
end

# {RACK_HTTP_HEADER} defines the Rack representation of the
# `X-Client-Timeout-Ms` header used for timeout propagation.
#
# source://shed//lib/shed.rb#20
Shed::RACK_HTTP_HEADER = T.let(T.unsafe(nil), String)

# {RackMiddleware} implements a collection of rack middlewares which can be
# used to set and manage {Shed} timeouts and deadlines.
#
# source://shed//lib/shed/rack_middleware.rb#6
module Shed::RackMiddleware; end

# {DefaultTimeout} implements a rack middleware which sets a default
# timeout on all incoming requests. This sets an upper bound for the
# deadline of this request, which may be lowered by other middlewares.
#
# source://shed//lib/shed/rack_middleware.rb#10
class Shed::RackMiddleware::DefaultTimeout
  # @param app The next rack middleware/app in the chain.
  # @param max_timeout: A callable object which given the rack environment
  #   returns the max duration of this request in milliseconds
  # @return [DefaultTimeout] a new instance of DefaultTimeout
  #
  # source://shed//lib/shed/rack_middleware.rb#17
  def initialize(app, timeout_ms: T.unsafe(nil)); end

  # source://shed//lib/shed/rack_middleware.rb#22
  def call(env); end
end

# {NO_TIMEOUT} implements the null timeout calculator.
#
# source://shed//lib/shed/rack_middleware.rb#12
Shed::RackMiddleware::DefaultTimeout::NO_TIMEOUT = T.let(T.unsafe(nil), Proc)

# {Propagate} implements a rack middleware which uses
# {Shed.with_timeout} to propagate client timeouts advertised via
# {Shed::HTTP_HEADER} to the request context.
#
# source://shed//lib/shed/rack_middleware.rb#33
class Shed::RackMiddleware::Propagate
  # @param app The next rack middleware/app in the chain.
  # @param on_timeout: The rack application to call when a timeout occurs.
  # @param delta: A callable object which given the current rack environment
  #   returns a duration in milliseconds to adjust the current timeout by.
  # @return [Propagate] a new instance of Propagate
  #
  # source://shed//lib/shed/rack_middleware.rb#48
  def initialize(app, on_timeout: T.unsafe(nil), delta: T.unsafe(nil)); end

  # {call} processes the current rack request.
  #
  # If the current request has a propagated timeout it will be set via
  # {Shed.with_timeout}.
  #
  # If the timeout has already been exceeded (via an adjustment computed by
  # the `delta` function, the `on_timeout` app will be called immediately.
  #
  # Else, the middleware passes control onto the next middleware or application.
  #
  # If any downstread middleware or application raises {Shed::Timeout}, this
  # middleware will rescue this error and call the `on_timeout` app.
  #
  # source://shed//lib/shed/rack_middleware.rb#66
  def call(env); end

  private

  # source://shed//lib/shed/rack_middleware.rb#82
  def with_timeout(env); end
end

# {NO_DELTA} implements the default `delta` functions, which always returns
# 0, thus not adjusting the request timeout at all.
#
# @see HerokuDelta
#
# source://shed//lib/shed/rack_middleware.rb#42
Shed::RackMiddleware::Propagate::NO_DELTA = T.let(T.unsafe(nil), Proc)

# {TIMEOUT_APP} implements the default `on_timeout` application, returning
# and empty 503 response.
#
# source://shed//lib/shed/rack_middleware.rb#36
Shed::RackMiddleware::Propagate::TIMEOUT_APP = T.let(T.unsafe(nil), Proc)

# {Timeout} will be raised when calling {Shed.ensure_time_left!} with no time
# left in the current request.
#
# source://shed//lib/shed.rb#16
class Shed::Timeout < ::StandardError; end
