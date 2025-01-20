import type Highcharts from 'highcharts'

// This is HTML that gets injected into the tooltip for each series.
// Highcharts expects this to be a string and parses out the vars.
const tooltipHeaderFormat =
  // eslint-disable-next-line github/unescaped-html-literal
  '<table style="min-width: 120px;"><tr><th colspan="3" style="color:var(--fgColor-muted, var(--color-fg-muted)); font-weight:var(--base-text-weight-semibold); padding-bottom:2px;">{point.key}</th></tr>'
const tooltipPointFormat =
  // eslint-disable-next-line github/unescaped-html-literal
  '<tr><td style="padding-top:var(--base-size-4)"><span style="color:{point.color}">●</span> {series.name}</td><td style="text-align: right; padding-top:var(--base-size-4);"><strong>{point.y}</strong></td></tr>'

const tooltipFooterFormat = '</table>'

export const yAxisConfig: Highcharts.YAxisOptions = {
  tickWidth: 0,
  lineWidth: 1,
  gridLineColor: 'var(--borderColor-muted)',
  gridLineDashStyle: 'Dash',
  lineColor: 'var(--borderColor-default)',
  labels: {
    style: {
      color: 'var(--fgColor-default)',
    },
  },
  title: {
    style: {
      color: 'var(--fgColor-default)',
    },
  },
}

const ChartTheme: Highcharts.Options = {
  accessibility: {
    keyboardNavigation: {
      order: ['legend', 'series'],
    },
  },
  colors: [
    'var(--data-blue-color-emphasis, var(--data-blue-color))',
    'var(--data-green-color-emphasis, var(--data-green-color))',
    'var(--data-orange-color-emphasis, var(--data-orange-color))',
    'var(--data-pink-color-emphasis, var(--data-pink-color))',
    'var(--data-yellow-color-emphasis, var(--data-yellow-color))',
    'var(--data-red-color-emphasis, var(--data-red-color))',
    'var(--data-purple-color-emphasis, var(--data-purple-color))',
    'var(--data-auburn-color-emphasis, var(--data-auburn-color))',
    'var(--data-teal-color-emphasis, var(--data-teal-color))',
    'var(--data-gray-color-emphasis, var(--data-gray-color))',
  ],
  caption: {
    align: 'left',
    style: {
      color: 'var(--fgColor-muted)',
    },
    verticalAlign: 'top',
  },
  title: {
    align: 'left',
    style: {
      color: 'var(--fgColor-default)',
    },
    text: undefined,
  },
  tooltip: {
    backgroundColor: 'var(--bgColor-default)',
    borderRadius: 6,
    borderColor: 'var(--borderColor-muted)',
    borderWidth: 1,
    shape: 'rect',
    padding: 10,
    shadow: {
      offsetX: 2,
      offsetY: 2,
      opacity: 0.02,
      width: 4,
      color: 'var(--shadowColor-default)',
    },
    style: {
      color: 'var(--fgColor-default)',
      fontFamily: 'var(--fontStack-sansSerif)',
      fontSize: 'var(--text-body-size-small)',
    },
    useHTML: true,
    headerFormat: tooltipHeaderFormat,
    pointFormat: tooltipPointFormat,
    footerFormat: tooltipFooterFormat,
  },
  credits: {
    enabled: false,
  },
  chart: {
    animation: false,
    spacing: [4, 0, 4, 0],
    backgroundColor: 'var(--bgColor-default, var(--color-canvas-default))',
    style: {
      fontFamily: 'var(--fontStack-sansSerif)',
      fontSize: '12px',
      color: 'var(--fgColor-default)',
    },
  },
  legend: {
    itemStyle: {
      fontSize: 'var(--base-size-12)',
      font: 'var(--fontStack-sansSerif)',
      color: 'var(--fgColor-default)',
    },
    align: 'left',
    verticalAlign: 'top',
    x: -8,
    y: -12,
    itemHoverStyle: {
      color: 'var(--fgColor-default)',
    },
    title: {
      style: {
        color: 'var(--fgColor-default)',
      },
    },
  },
  navigation: {
    buttonOptions: {
      enabled: false,
    },
  },
  exporting: {
    fallbackToExportServer: false,
  },
  plotOptions: {
    series: {
      animation: false,
    },
    spline: {
      animation: false,
      marker: {
        enabled: false,
      },
    },
    bar: {
      borderColor: 'var(--bgColor-default)',
    },
    column: {
      borderColor: 'var(--bgColor-default)',
    },
  },
  xAxis: {
    tickWidth: 0,
    lineWidth: 1,
    gridLineColor: 'var(--borderColor-muted)',
    gridLineDashStyle: 'Dash',
    lineColor: 'var(--borderColor-default)',
    labels: {
      style: {
        color: 'var(--fgColor-default)',
      },
    },
    title: {
      style: {
        color: 'var(--fgColor-default)',
      },
    },
  },
  yAxis: [yAxisConfig],
}

export default ChartTheme
