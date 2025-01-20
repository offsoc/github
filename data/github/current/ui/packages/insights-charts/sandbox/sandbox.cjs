const express = require('express')
const path = require('path')

const app = express()
const port = 9091

const mockResponse = {
  version: '1.0',
  data: {
    columns: [
      {
        name: 'Date',
        dataType: 'datetimeoffset'
      },
      {
        name: 'Count',
        dataType: 'int'
      },
      {
        name: 'State',
        dataType: 'nvarchar'
      }
    ],
    rows: [
      ['2020-07-19T00:00:00', 32, 'Closed'],
      ['2020-07-19T00:00:00', 33, 'red'],
      ['2020-07-19T00:00:00', 34, 'green'],
      ['2020-07-19T00:00:00', 35, 'blue'],
      ['2020-07-19T00:00:00', 36, 'purple'],
      ['2020-07-19T00:00:00', 34, 'red2'],
      ['2020-07-19T00:00:00', 55, 'aa'],
      ['2020-07-20T00:00:00', 38, 'Closed'],
      ['2020-07-20T00:00:00', 15, 'Open'],
      ['2020-07-21T00:00:00', 40, 'Closed'],
      ['2020-07-21T00:00:00', 16, 'Open'],
      ['2020-07-22T00:00:00', 40, 'Closed'],
      ['2020-07-22T00:00:00', 18, 'Open'],
      ['2020-07-23T00:00:00', 42, 'Closed'],
      ['2020-07-23T00:00:00', 18, 'Open'],
      ['2020-07-24T00:00:00', 45, 'Closed'],
      ['2020-07-24T00:00:00', 33, 'red'],
      ['2020-07-24T00:00:00', 34, 'green'],
      ['2020-07-24T00:00:00', 35, 'blue'],
      ['2020-07-24T00:00:00', 36, 'purple'],
      ['2020-07-24T00:00:00', 34, 'red2'],
      ['2020-07-24T00:00:00', 19, 'Open'],
      ['2020-07-25T00:00:00', 46, 'Closed'],
      ['2020-07-25T00:00:00', 33, 'red'],
      ['2020-07-26T00:00:00', 48, 'Closed'],
      ['2020-07-26T00:00:00', 17, 'Open'],
      ['2020-07-27T00:00:00', 51, 'Closed'],
      ['2020-07-27T00:00:00', 16, 'Open'],
      ['2020-07-28T00:00:00', 51, 'Closed'],
      ['2020-07-28T00:00:00', 19, 'Open'],
      ['2020-07-29T00:00:00', 51, 'Closed'],
      ['2020-07-29T00:00:00', 18, 'Open'],
      ['2020-07-30T00:00:00', 55, 'Closed'],
      ['2020-07-30T00:00:00', 17, 'Open'],
      ['2020-07-31T00:00:00', 58, 'Closed'],
      ['2020-07-31T00:00:00', 18, 'Open']
    ]
  },
  errors: {
    hasErrors: false,
    errorMessage: ''
  }
}

const mockAuthResponse = {
  token: 'token123',
  authScope: 'scope123',
  organization: 'github'
}

app.use('/dist', express.static(path.join(__dirname, '../dist/index.js')))

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/index.html'))
})

app.get('/forecasting', (req, res) => {
  res.sendFile(path.join(__dirname, '/forecasting.html'))
})

app.get('/rolling-sum', (req, res) => {
  res.sendFile(path.join(__dirname, '/rolling-sum.html'))
})

app.get('/theme.js', (req, res) => {
  res.sendFile(path.join(__dirname, '/theme.js'))
})

app.post('/sql/api', (req, res) => {
  res.json(mockResponse)
})

app.post('/sql/api/xss', (req, res) => {
  const xssResponse = {
    version: '1.0',
    data: {
      columns: [
        {
          name: '<style>body {background-color: hotpink;}</style>',
          dataType: 'datetimeoffset'
        },
        {
          name: 'Count',
          dataType: 'int'
        },
        {
          name: 'State',
          dataType: 'nvarchar'
        }
      ],
      rows: [
        ['2020-07-19T00:00:00', 34, 'Closed'],
        ['2020-07-19T00:00:00', 16, 'Open'],
        ['2020-07-20T00:00:00', 38, 'Closed'],
        ['2020-07-20T00:00:00', 15, 'Open'],
        ['2020-07-21T00:00:00', 40, 'Closed']
      ]
    },
    errors: {
      hasErrors: false,
      errorMessage: ''
    }
  }

  res.json(xssResponse)
})

app.post('/sql/api/atag', (req, res) => {
  const xssResponse = {
    version: '1.0',
    data: {
      columns: [
        {
          name: 'Actor',
          dataType: 'nvarchar'
        },
        {
          name: 'Count',
          dataType: 'int'
        }
      ],
      rows: [
        ['Bob', 5],
        ['Doug', 12],
        ['<a href="https://github.com/insights-robot">insights-robot</a>', 10]
      ]
    },
    errors: {
      hasErrors: false,
      errorMessage: ''
    }
  }

  res.json(xssResponse)
})
app.get('/auth/api', (req, res) => {
  res.json(mockAuthResponse)
})

app.post('/sql/api/error', (req, res) => {
  const sqlErrRes = {
    version: '0.1',
    data: {
      columns: [],
      rows: [],
      isSensitive: false
    },
    errors: {
      hasErrors: true,
      errorCode: 0,
      errorMessage: req.query.message || 'Query SELECT TOP 1 * FROM Issuezcz\n has disallowed table name mentioned.'
    },
    org_state: 'ready',
    redacted: false
  }

  res.send(sqlErrRes)
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
