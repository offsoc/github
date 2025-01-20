import {HeroStatElement, RegisterHeroStat} from '../src/hero-stat-element'

RegisterHeroStat()

describe('hero-stat', function () {
  it('renders the component', function () {
    const element = new HeroStatElement()
    const renderMethod = jest.spyOn(element, 'render')

    element.setAttribute('value', '12')
    element.setAttribute('label', 'number of items')

    const expectedResult = `<div class="col-md-2" role="button" tabindex="0"><div class="color-bg-subtle height-full color-shadow-small mb-2 mb-md-0"><div class="p-3"><label class="color-fg-muted text-normal">number of items</label><div class="color-fg-default f2">12</div></div></div></div>`

    expect(element.innerHTML.includes(expectedResult)).toBeTruthy()

    expect(renderMethod).toHaveBeenCalledTimes(2)
  })
})
