### INP

This is a custom implementation based on [web-vitals'](https://github.com/GoogleChrome/web-vitals) `onINP` method. The library implementation struggles with our soft navigations and is likely to report INP at the wrong time, affecting page's scores in the Web Performance Scorecard.

Since we have a decent framework to track soft navigations built in dotcom, we can use it to manually reset INP and ensure that it reports on the correct page.
