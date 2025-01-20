require 'json'

module BadgeRuler
  WIDTHS_PATH = File.join(File.dirname(__FILE__), "widths.json")
  DATA = JSON.parse(File.read(WIDTHS_PATH))
  DEFAULT_CHARACTER_WIDTH = 106.99

  def self.width_of(text)
    text.chars.reduce(0.0) do |accum_width, char|
      # If we can't calculate the width, we make a guess and use the width of m
      char_width = width_of_char(char)

      if char_width.nil? || char_width <= 0
        char_width = DEFAULT_CHARACTER_WIDTH
      end

      accum_width + char_width
    end
  end

  def self.width_of_char(char)
    char_code = char.ord

    # Control characters
    return 0.0 if char_code <= 31 || char_code === 127

    index = DATA.bsearch_index do |char_point|
      lower = char_point.first
      lower >= char_code
    end

    # Character not found
    return nil unless index

    # The index matches the beginning of a range.
    # Which means we found the width, so return it.
    width = DATA[index].last
    
    # If width is 0 but not a control character,
    # we want to return nil so that we use the default width
    return nil if width <= 0

    width
  end
end
