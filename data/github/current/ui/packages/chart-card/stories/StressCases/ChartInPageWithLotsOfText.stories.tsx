import type {Meta} from '@storybook/react'
import {ChartCard, type ChartCardProps} from '../../ChartCard'

const meta = {
  title: 'Recipes/ChartCard/Stress Cases',
  component: ChartCard,
  parameters: {
    controls: {expanded: true, sort: 'requiredFirst'},
  },
} satisfies Meta<React.ComponentProps<typeof ChartCard>>
export default meta

export const ChartInPageWithLotsOfText = {
  args: {
    size: 'medium',
    border: true,
    padding: 'normal',
    visibleControls: true,
  },
  render: (args: ChartCardProps) => (
    <div>
      <span>
        Lorem ipsuçm dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
        magna aliqua. Sed enim ut sem viverra aliquet eget sit amet tellus. Fermentum dui faucibus in ornare quam. Sed
        odio morbi quis commodo odio aenean sed adipiscing. Enim sed faucibus turpis in eu. Nisi scelerisque eu ultrices
        vitae auctor eu. Lacus viverra vitae congue eu consequat ac felis. Iaculis urna id volutpat lacus laoreet non
        curabitur gravida. Vel pretium lectus quam id leo in vitae turpis massa. Venenatis a condimentum vitae sapien.
        Pretium lectus quam id leo in vitae turpis massa sed. Eget magna fermentum iaculis eu non diam phasellus
        vestibulum lorem. Dictumst quisque sagittis purus sit amet volutpat. Urna cursus eget nunc scelerisque viverra
        mauris in aliquam sem. Odio eu feugiat pretium nibh ipsum consequat. Tellus molestie nunc non blandit massa.
        Tortor at risus viverra adipiscing at in tellus. Lorem sed risus ultricies tristique nulla aliquet enim tortor
        at. Augue neque gravida in fermentum et sollicitudin. Arcu cursus euismod quis viverra nibh cras. Nascetur
        ridiculus mus mauris vitae ultricies leo integer malesuada. Non nisi est sit amet. Nisl purus in mollis nunc sed
        id. Eget dolor morbi non arcu risus quis varius. Interdum varius sit amet mattis vulputate enim. Est placerat in
        egestas erat imperdiet. Suscipit adipiscing bibendum est ultricies integer. Nunc sed id semper risus in
        hendrerit gravida rutrum quisque. Duis at consectetur lorem donec massa sapien faucibus et. Senectus et netus et
        malesuada fames ac turpis. Leo urna molestie at elementum eu facilisis sed odio morbi. Orci a scelerisque purus
        semper. Vitae elementum curabitur vitae nunc sed velit dignissim sodales ut. Turpis massa tincidunt dui ut.
        Pulvinar proin gravida hendrerit lectus. Tincidunt vitae semper quis lectus nulla at volutpat diam. Erat
        pellentesque adipiscing commodo elit. Id interdum velit laoreet id donec ultrices tincidunt arcu non. Fusce ut
        placerat orci nulla. Habitasse platea dictumst quisque sagittis purus sit amet volutpat consequat. Etiam
        dignissim diam quis enim lobortis. Id porta nibh venenatis cras. Aliquam ut porttitor leo a diam sollicitudin
        tempor id. Urna molestie at elementum eu facilisis sed odio morbi quis. Nisl nunc mi ipsum faucibus. Purus sit
        amet luctus venenatis lectus magna fringilla urna porttitor. Vitae sapien pellentesque habitant morbi tristique
        senectus et netus et. At ultrices mi tempus imperdiet nulla malesuada pellentesque elit. Sagittis id consectetur
        purus ut faucibus pulvinar elementum integer enim. Feugiat scelerisque varius morbi enim nunc faucibus a. Ut
        venenatis tellus in metus. Mattis pellentesque id nibh tortor id. Aliquet nibh praesent tristique magna sit.
        Commodo odio aenean sed adipiscing diam donec. Facilisis mauris sit amet massa vitae. Hendrerit dolor magna eget
        est lorem ipsum dolor. Quis blandit turpis cursus in hac habitasse platea dictumst. Pretium vulputate sapien nec
        sagittis aliquam. Elementum eu facilisis sed odio morbi quis. Vel facilisis volutpat est velit egestas dui id
        ornare. Facilisis sed odio morbi quis commodo odio aenean sed. Convallis convallis tellus id interdum velit.
        Porta lorem mollis aliquam ut porttitor leo a. Fringilla urna porttitor rhoncus dolor purus. Eget nullam non
        nisi est sit amet. Egestas sed sed risus pretium. Eu scelerisque felis imperdiet proin fermentum. Id leo in
        vitae turpis massa sed elementum tempus. Ipsum dolor sit amet consectetur adipiscing elit duis. Tincidunt dui ut
        ornare lectus sit. Tortor id aliquet lectus proin nibh nisl. Quam lacus suspendisse faucibus interdum posuere
        lorem. Sit amet cursus sit amet dictum sit. Viverra nam libero justo laoreet sit amet cursus sit amet. Laoreet
        non curabitur gravida arcu ac. Vitae purus faucibus ornare suspendisse sed nisi lacus. Sit amet mauris commodo
        quis imperdiet massa tincidunt nunc pulvinar. Commodo odio aenean sed adipiscing diam.
      </span>
      <ChartCard {...args}>
        <ChartCard.Title>Accessible Chart</ChartCard.Title>
        <ChartCard.Description>
          Chart of issues over time. This is a long description that should wrap and not overlap the chart.
        </ChartCard.Description>
        <ChartCard.Chart
          series={[
            {
              name: 'Issues',
              data: [1, 2, 1, 4, 3, 6, 5, 3, 2, 12],
              type: 'line',
            },
            {
              name: 'Issues 2',
              data: [2, 3, 2, 5, 4, 7, 6, 4, 3, 13],
              type: 'line',
            },
          ]}
          xAxisTitle={'Time'}
          yAxisTitle={'Issues'}
          plotOptions={{
            series: {
              pointStart: 2012,
            },
          }}
          type={'line'}
        />
      </ChartCard>
    </div>
  ),
}
