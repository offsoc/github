module Failbot
  # Public: A simplified implementation of [`::Concurrent::ThreadLocalVar`](https://github.com/ruby-concurrency/concurrent-ruby/blob/7dc6eb04142f008ffa79a59c125669c6fcbb85a8/lib/concurrent-ruby/concurrent/atomic/thread_local_var.rb)
  #
  # Why not just use `concurrent-ruby`? We wanted to minimize external dependencies to avoid conflicts with gems already installed with `github/github`.
  #
  class ThreadLocalVariable
    def initialize(&block)
      @default_block = block || proc {}
      @key = "_thread_local_variable_#{object_id}".to_sym
    end

    def value
      value_from_thread(Thread.current)
    end

    def value=(val)
      Thread.current.thread_variable_set(@key, val)
    end

    def value_from_thread(thread)
      if !thread.thread_variable?(@key)
        thread.thread_variable_set(@key, @default_block.call)
      end
      thread.thread_variable_get(@key)
    end
  end
end
