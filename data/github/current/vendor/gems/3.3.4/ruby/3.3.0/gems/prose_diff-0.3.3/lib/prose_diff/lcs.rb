# From: http://rosettacode.org/wiki/Longest_common_subsequence#Ruby
# guarded by lcs_spec.rb

module ProseDiff

  class LCS

    SELF, LEFT, UP, DIAG = [0,0], [0,-1], [-1,0], [-1,-1]

    def initialize(a, b, options = {}, &comparator)
      # FIXME: performance degredation likely if comparing a lot of elements
      @a, @b = a, b
      @i, @j = 0, 0
      @m = Array.new(a.length) { Array.new(b.length) }
      @comparator = comparator || lambda { |a, b| a == b }
      each_msg = options[:each] || :each
      # do it!
      a.send(each_msg).with_index do |x, i|
        b.send(each_msg).with_index do |y, j|
          self.pos(i, j)
          self.match(x, y)
        end
      end
    end

    def valid?(i=@i, j=@j); i >= 0 && j >= 0;                   end
    def match(c, d);        @m[@i][@j] = compute_entry(c, d);   end
    def pos(i, j);          @i, @j = i, j;                      end
    def lookup(x, y);       [@i+x, @j+y];                       end
    def pos_lower_right;    self.pos(@a.length-1, @b.length-1); end

    def peek(x, y)
      i, j = lookup(x, y)
      valid?(i, j) ? @m[i][j] : 0
    end

    def compute_entry(c, d)
      @comparator[c,d] ? peek(*DIAG) + 1 : [peek(*LEFT), peek(*UP)].max
    end

    def backtrack
      self.pos_lower_right
      Enumerator.new { |y| y << [@i+1, @j+1] if backstep while valid? }
    end

    def backstep
      backstep = compute_backstep
      @i, @j = lookup(*backstep)
      backstep == DIAG
    end

    def compute_backstep
      case peek(*SELF)
      when peek(*LEFT) then LEFT
      when peek(*UP)   then UP
      else                  DIAG
      end
    end

    def self.smallest_contiguous_change(a, b)
      shortest_length = [a.length, b.length].min
      i = 0
      i += 1 while a[i] == b[i] && i < shortest_length
      j = -1
      j -= 1 while a[j] == b[j] && j >= (-shortest_length) && (shortest_length + j) >= i

      prefix = if i > 0
                  a[0..(i-1)]
                else
                  ''
                end
      suffix = if j < -1
                 a[(j+1)..-1]
               else
                 ''
               end
      a, b = a[i..j], b[i..j]
      [prefix, a, b, suffix]
    end

    def self.length(a, b, options = {}, &comparator)
      walker = self.new(a.to_a, b.to_a, options, &comparator)
      walker.backtrack.inject(0) { |length, ij| length + 1 }
    end

    def self.fold_diff(comparator, a, b, acc) # &block
      if !comparator.respond_to?(:call) && comparator.respond_to?(:to_proc)
        comparator = comparator.to_proc
      end
      pairings = self.pair a, b, comparator
      a_i, b_i, p_i = 0, 0, 0
      a_l, b_l, p_l = a.length, b.length, pairings.length

      while a_i < a_l || b_i < b_l || p_i < p_l
        if a_i >= a_l
          if b_i >= b_l
            acc = yield acc, *pairings[p_i]
            p_i += 1
          else
            acc = yield acc, nil, b[b_i]
            b_i += 1
          end
        elsif b_i >= b_l
          acc = yield acc, a[a_i], nil
          a_i += 1
        elsif p_i >= p_l
          acc = yield acc, a[a_i], nil
          a_i += 1
        elsif a[a_i] != pairings[p_i][0]
          acc = yield acc, a[a_i], nil
          a_i += 1
        elsif b[b_i] != pairings[p_i][1]
          acc = yield acc, nil, b[b_i]
          b_i += 1
        else
          a_i += 1
          b_i += 1
          acc = yield acc, *pairings[p_i]
          p_i += 1
        end
      end

      acc

    end

    private

    def self.pair(a, b, comparator = lambda { |a, b| a == b })

      p_i = 0
      while a[p_i] && b[p_i] && comparator.call(a[p_i], b[p_i])
        p_i += 1
      end

      prefix = (0..(p_i - 1)).map { |i| [a[i], b[i]] }
      aa = a[p_i..-1]
      bb = b[p_i..-1]

      s_i, s_limit = -1, p_i - [a.length, b.length].min

      while s_i >= s_limit && a[s_i] && b[s_i] && comparator.call(a[s_i], b[s_i])
        s_i -= 1
      end

      suffix = ((s_i + 1)..-1).map { |i| [a[i], b[i]] }
      aa = a[p_i..s_i]
      bb = b[p_i..s_i]

      walker = self.new(aa, bb, &comparator)
      diffed_list = walker.backtrack.inject([]) { |list, ij| i, j = *ij; list.unshift( [aa[i], bb[j]] ) }
      prefix.concat(diffed_list).concat(suffix)
    end

  end

end
