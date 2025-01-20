require 'pathname'

class Pathname
  class << self
    def common_prefix(*paths)
      return if paths.empty?
      paths.flatten!
      Pathname(paths.pop).common_prefix(paths)
    end
  end

  def common_prefix(*others)
    others.flatten!
    others.map! {|path| Pathname path}
    enum_for(:ascend).find {|path|
      others.all?{|other|other.start_with?(path)}
    }
  end

  def start_with?(other)
    enum_for(:descend).include?(Pathname(other))
  end
end
