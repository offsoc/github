/**
 * This file automatically registers this package with webpack and creates a bundle named `enterprise-server-stats`
 * Any code written in enterprise-server-stats.ts will run when the bundle is loaded.
 */
import {RegisterLineChart} from '@github-ui/insights-charts'
import './enterprise-server-stats'
// This is only registered on the client side as it registers the `line-chart` web component.
RegisterLineChart()
