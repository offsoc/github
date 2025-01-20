# frozen_string_literal: true
# Alphabetically last!
TestFeature = Struct.new(:name, :value, :message) do
  def lengths
    [name.length, value.length, message.length]
  end

  def each_text
    yield(name)
    yield(value)
    yield(message)
  end
end

FEATURES = [
  TestFeature.new("Test Feature", "Value", "Message"),
  TestFeature.new("Gemfile", ENV["BUNDLE_GEMFILE"], "ENV['BUNDLE_GEMFILE']"),
  TestFeature.new("Rails Version", defined?(Rails) ? Rails::VERSION::STRING : "--", "Set in gemfile"),
  TestFeature.new("GraphQL-Ruby", GraphQL::VERSION, "Gemfile"),
]

max_lengths = [0, 0, 0]
FEATURES.each do |f|
  lengths = f.lengths
  lengths.each_with_index do |l, idx|
    if l > max_lengths[idx]
      max_lengths[idx] = l
    end
  end
end

margin = " "
sep = " | "
hr_len = max_lengths.reduce(0, &:+) + margin.length + sep.length + sep.length

FEATURES.each_with_index do |f, f_idx|
  row = []
  t_idx = 0
  f.each_text do |t|
    row << t.ljust(max_lengths[t_idx])
    t_idx += 1
  end
  puts "#{margin}#{row.join(sep)}"
  if f_idx == 0
    puts "=" * hr_len
  end
end
puts "-" * hr_len
puts "$ BUNDLE_GEMFILE=#{ENV["BUNDLE_GEMFILE"]} #{ENV["POSTGRESQL"] ? "POSTGRESQL=1 " : (ENV["MYSQL"] ? "MYSQL=1 " : "")}bundle exec rake test"
