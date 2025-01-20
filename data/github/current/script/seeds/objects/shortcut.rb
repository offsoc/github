# frozen_string_literal: true

# Do not require anything here. If you need something else, require it in the method that needs it.
# This makes sure the boot time of our seeds stays low.

module Seeds
  module Objects
    class Shortcut
      def self.create(dashboard:, name:, query:, icon: nil, color: nil)
        icon = icon || ::SearchShortcut.icons.keys.sample
        color = color || ::SearchShortcut.colors.keys.sample

        shortcut = ::SearchShortcut.create(
          dashboard: dashboard,
          name: name,
          query: query,
          icon: icon,
          color: color
        )

        raise Objects::CreateFailed, shortcut.errors.full_messages.to_sentence unless shortcut.valid?
        shortcut
      end
    end
  end
end
