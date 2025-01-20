require "digest/sha2"

module BT
  module_function

  @measure_start = Time.now
  @measure_depth = 0
  @measure_map = {}
  @measure_list = []

  if ENV.key?("BT_INIT")
    def start(name)
      return if ENV.key?("BT_DISABLED") and ENV["BT_DISABLED"] != "0"
      caller, desc_checksum, timestamp = _metadata(name)

      file = "/tmp/bt.#{desc_checksum}.#{timestamp}"
      file_alias = "/tmp/bt.#{desc_checksum}"

      File.write(file, "#{caller} #{name}\n")
      # Skip creating symlink if it already exists
      File.symlink(file, file_alias) unless File.symlink?(file_alias)
    end

    def end(name)
      return if ENV.key?("BT_DISABLED") and ENV["BT_DISABLED"] != "0"
      caller, desc_checksum, timestamp = _metadata(name)

      File.open("/tmp/bt.#{desc_checksum}", 'a') do |f|
        f.puts("#{timestamp} #{caller} #{name}")
      end
    end

    def _metadata(name)
      caller = /([[:alnum:]\.\/\-]+\:[[:digit:]]+)/.match(caller_locations(1, 1)[0].to_s)[0]
      desc_checksum = Digest::SHA256.hexdigest(name)
      time = Time.now
      timestamp = "#{time.to_i}#{time.nsec}".ljust(19, '0')

      [caller, desc_checksum, timestamp]
    end
  elsif ENV.key?("BT_MEASURE")
    def start(name)
      @measure_depth += 1
      if @measure_depth == 1
        @measure_map[name] = Time.now
      end
    end

    def end(name)
      if @measure_depth == 1
        time_spent = Time.now - @measure_map.fetch(name)
        @measure_map.delete(name)
        @measure_list << [time_spent, name]
      end
      @measure_depth -= 1
    end
  else
    def start(name)
    end

    def end(name)
    end
  end

  def time(name)
    self.start(name)
    yield
  ensure
    self.end(name)
  end

  def measure_report
    puts
    @measure_list.each do |time_spent, cmd|
      puts "%8.2f ms | %s" % [time_spent * 1000, cmd]
    end
    puts
    puts "%.2f s total (%.2f s in sub-tasks)" % [
      Time.now - @measure_start,
      @measure_list.inject(0) { |sum, (time_spent, _)| sum + time_spent }
    ]
  end
end

if ENV.key?("BT_MEASURE")
  at_exit do
    BT.measure_report
  end

  # automatically time sub-processes
  def system(*args)
    name = args.select { |a| a.is_a?(String) }.join(" ")
    BT.time(name) { super }
  end

  def spawn(*args)
    name = args.select { |a| a.is_a?(String) }.join(" ")
    BT.time(name) { super }
  end

  def `(name)
    BT.time(name) { super }
  end
end
