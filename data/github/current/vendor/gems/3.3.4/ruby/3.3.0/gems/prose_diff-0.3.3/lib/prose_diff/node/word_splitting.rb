# encoding: utf-8

module ProseDiff
  class Node
    module WordSplitting

      LEADING_OPTIONAL_NONWORD_CHARACTERS = /^[^'\p{word}]*/u
      LEADING_NONWORD_CHARACTERS = /^[^'\p{word}]+/u
      LEADING_OPTIONAL_WORD_CHARACTERS = /^['\p{word}]*/u
      LEADING_WORD_AND_FOLLOWING_NONWORD_CHARACTERS = /^['\p{word}]+[^'\p{word}]*/u
      LEADING_WORD_CHARACTERS = /^['\p{word}]+(?:(?:['._\-]\p{word})*['\p{word}]*)?/u
      WORD = /^['\p{word}]+(?:(?:['._\-]\p{word})*['\p{word}]*)?$/u

      # see http://stackoverflow.com/questions/7724135/ruby-string-split-on-more-than-one-character
      def split_by_word(full_text)

        split_words = []

        prefix = full_text[ProseDiff::Node::WordSplitting::LEADING_OPTIONAL_NONWORD_CHARACTERS]
        full_text = full_text[prefix.length..-1]

        split_words.push( prefix ) if prefix && prefix != ''

        while full_text != ''
          if word = full_text[ProseDiff::Node::WordSplitting::LEADING_WORD_CHARACTERS]
            full_text = full_text[word.length..-1]
            split_words.push( word ) if word != ''
          end

          if space = full_text[ProseDiff::Node::WordSplitting::LEADING_OPTIONAL_NONWORD_CHARACTERS]
            full_text = full_text[space.length..-1]
            split_words.push( space ) if space != ''
          end
        end

        split_words

      end

      def word?(fragment)
        WORD =~ fragment
      end

      module_function :split_by_word, :word?

    end
  end
end