# typed: true
# frozen_string_literal: true

require "connection_info"

module Trilogy::QuerySubscriber
  class << self
    def call(name, start, finish, id, payload = {})
      return if payload[:cached]

      connection = payload.fetch(:connection)
      sql = payload.fetch(:sql)
      read_or_write = connection.write_query?(sql) ? :write : :read

      # If we are tracking replication state and this query was on the writing
      # role, observe the query. This may (if there was an update) record the
      # GTID and/or timestamp of the query.
      # See lib/database_selector.rb and lib/database_selector/* for details.
      replication_state = DatabaseSelector::ReplicationState.current
      connection_class = connection.connection_class
      connection_class = ApplicationRecord::Mysql1 if connection_class == ActiveRecord::Base

      replication_state.observe_query!(cluster: connection_class, type: read_or_write) if replication_state

      time_span = TimeSpan.new(start, finish)
      connection_info = ConnectionInfo.new(
        url: connection.connection_url,
        config_host: config_host(connection.connection_url),
        connection_class: connection_class,
        connection_role: connection_class.current_role
      )

      GitHub::MysqlInstrumenter.track_query(
        sql,
        read_or_write,
        connection_info,
        time_span: time_span,
        result_count: payload[:row_count],
        exception: payload[:exception_object],
        async: payload[:async],
        lock_wait: payload[:lock_wait]
      )

      SlowQueryReporter.
        new(sql, time_span.duration_seconds, connection_info).
        report
    end

    def subscribe
      ActiveSupport::Notifications.monotonic_subscribe(
        "sql.active_record",
        self,
      )
    end

    private

    def config_host(url)
      return nil unless url
      @config_host ||= {}
      @config_host[url] ||= begin
        Addressable::URI.parse("mysql://#{url}").host
      end
    end
  end
end

Trilogy::QuerySubscriber.subscribe
