import {getAnalyticsEvent, toSnakeCase, trimValue} from '../../../lib/utils/analytics'

describe('toSnakeCase', () => {
  it('converts a string with spaces to snake_case', () => {
    expect(toSnakeCase('Convert This String')).toBe('convert_this_string')
  })

  it('handles strings with multiple spaces', () => {
    expect(toSnakeCase('Convert   This  String')).toBe('convert_this_string')
  })

  it('handles strings with no spaces', () => {
    expect(toSnakeCase('nospace')).toBe('nospace')
  })

  it('removes special characters and retains only letters and numbers', () => {
    expect(toSnakeCase('Remove! Special@Characters#?')).toBe('remove_specialcharacters')
  })

  it('handles already snake cased strings', () => {
    expect(toSnakeCase('already_snaked')).toBe('already_snaked')
  })
})

describe('trimValue', () => {
  it('trims a value to the max length', () => {
    const longStringWithSpaces =
      'Compare GitHub with other platforms and see why we are the best. It is the ultimate platform for developers and teams!'
    expect(trimValue(longStringWithSpaces)).toBe(
      'Compare GitHub with other platforms and see why we are the best. It is the ultimate platform for dev',
    )
  })

  it('trims a value to the max length and removes trailing spaces', () => {
    const longString = `${'a'.repeat(105)} `
    expect(trimValue(longString)).toBe('a'.repeat(100))
  })

  it('does not trim a value shorter than the max length', () => {
    const shortString = 'short'
    expect(trimValue(shortString)).toBe('short')
  })

  it('returns undefined for undefined input', () => {
    expect(trimValue(undefined)).toBeUndefined()
  })
})

describe('marketing analytics', () => {
  it('returns analytics event data with snake_case and trimmed fields', () => {
    const event = {
      action:
        'Compare GitHub with other platforms and see why we are the best. It is the ultimate platform for developers and teams!',
      tag: 'link',
      context: 'Start your journey!',
      location:
        'footer location that is way too long and should also be trimmed to ensure correct format and lengthiness',
    }
    const result = getAnalyticsEvent(event)

    expect(result).toEqual({
      'data-analytics-event': JSON.stringify({
        action: 'compare_github_with_other_platforms_and_see_why_we_are_the_best_it_is_the_ultimate_platform_for_dev',
        tag: 'link',
        context: 'start_your_journey',
        location:
          'footer_location_that_is_way_too_long_and_should_also_be_trimmed_to_ensure_correct_format_and_lengthi',
        label:
          'compare_github_with_other_platforms_and_see_why_we_are_the_best_it_is_the_ultimate_platform_for_dev_link_start_your_journey_footer_location_that_is_way_too_long_and_should_also_be_trimmed_to_ensure_correct_format_and_lengthi',
      }),
    })
  })

  it('handles event data with missing context and location values', () => {
    const event = {
      action: 'Compare GitHub',
      tag: 'link',
    }
    const result = getAnalyticsEvent(event)

    expect(result).toEqual({
      'data-analytics-event': JSON.stringify({
        action: 'compare_github',
        tag: 'link',
        label: 'compare_github_link_null_null',
      }),
    })
  })

  it('respects snakeCaseOptions to omit snake_case for specific fields', () => {
    const event = {
      action: 'Click Here',
      tag: 'button',
      context: 'CTAs',
      location: 'hero',
    }
    const snakeCaseOptions = {context: false}
    const result = getAnalyticsEvent(event, snakeCaseOptions)

    expect(result).toEqual({
      'data-analytics-event': JSON.stringify({
        action: 'click_here',
        tag: 'button',
        context: 'CTAs',
        location: 'hero',
        label: 'click_here_button_CTAs_hero',
      }),
    })
  })
})
