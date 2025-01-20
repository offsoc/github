# typed: true
# frozen_string_literal: true

class Trilogy::TransactionSubscriber
  thread_cattr_accessor :transaction_counts_by_cluster
  cattr_accessor :ignored_transaction_threshold, default: 0
  cattr_accessor :reporters, default: %w[MysqlTransactionReporter NestedTransactionReporter]

  def self.clusters_with_open_transactions
    self.transaction_counts_by_cluster ||= Hash.new(0)
    transaction_counts_by_cluster.select { |_, count| count > ignored_transaction_threshold }.keys
  end

  def start(_name, _id, payload)
    cluster_name = cluster_name_from_payload(payload)
    payload[:start] = Time.now
    increment_transaction_count_for(cluster_name)
  end

  def finish(_name, _id, payload)
    cluster_name = cluster_name_from_payload(payload)

    if is_real_transaction?(cluster_name)
      state = payload[:outcome]
      time = TimeSpan.new(payload[:start], Time.now)
      reporters.each do |reporter|
        reporter.constantize.new(state, time, self.class.clusters_with_open_transactions).call
      end
    end
  ensure
    decrement_transaction_count_for(cluster_name)
  end

  private

  def cluster_name_from_payload(payload)
    payload[:connection].connection_class.name.demodulize
  end

  def increment_transaction_count_for(cluster_name)
    self.transaction_counts_by_cluster ||= Hash.new(0)
    transaction_counts_by_cluster[cluster_name] += 1
  end

  def decrement_transaction_count_for(cluster_name)
    transaction_counts_by_cluster[cluster_name] -= 1
    if transaction_counts_by_cluster[cluster_name].negative?
      report_bad_statistics(cluster_name)
      transaction_counts_by_cluster[cluster_name] = 0
    end
  end

  def report_bad_statistics(cluster_name)
    error = TransactionTrackingCountError.new "Transaction count for cluster #{cluster_name} is negative"
    if GitHub::AppEnvironment.test?
      raise error
    else
      Failbot.report(error)
    end
  end

  class TransactionTrackingCountError < StandardError; end

  def is_real_transaction?(cluster_name)
    # Using the counts per cluster to ensure we ignore Savepoint transactions
    # We only care about the first transaction after the ignored threshold.
    # In some scenarios (i.e. transactional fixtures tests), we may bump up the `ignored_transaction_threshold` to 1 to
    # ignore the outermost real transaction and pretend that the first savepoint is the real transaction
    transaction_counts_by_cluster[cluster_name] == (ignored_transaction_threshold + 1)
  end
end

ActiveSupport::Notifications.subscribe("transaction.active_record", Trilogy::TransactionSubscriber.new)
