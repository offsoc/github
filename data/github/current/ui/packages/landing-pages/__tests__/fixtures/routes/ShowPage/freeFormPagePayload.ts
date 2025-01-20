/* eslint eslint-comments/no-use: off, filenames/match-regex: off */

export default {
  contentfulRawJsonResponse: {
    sys: {
      type: 'Array',
    },
    total: 1,
    skip: 0,
    limit: 100,
    items: [
      {
        metadata: {
          tags: [],
        },
        sys: {
          space: {
            sys: {
              type: 'Link',
              linkType: 'Space',
              id: '8aevphvgewt8',
            },
          },
          id: '4HZ7Vyt2YTl7prLE8kKpOM',
          type: 'Entry',
          createdAt: '2023-08-10T06:38:49.040Z',
          updatedAt: '2023-10-02T11:25:38.392Z',
          environment: {
            sys: {
              id: 'rfearing-pillar-component',
              type: 'Link',
              linkType: 'Environment',
            },
          },
          revision: 6,
          contentType: {
            sys: {
              type: 'Link',
              linkType: 'ContentType',
              id: 'containerPage',
            },
          },
          locale: 'en-US',
        },
        fields: {
          title: 'Contentful E2E test: Do not remove',
          path: '/contentful-e2e-test-do-not-remove',
          content: {
            sys: {
              type: 'Link',
              linkType: 'Entry',
              id: '4UnzpBVR4Aa3UWhJ9tndqV',
            },
          },
          template: {
            sys: {
              type: 'Link',
              linkType: 'Entry',
              id: '6VcJToW7LIooBorvZuLF6d',
            },
          },
          settings: {
            sys: {
              type: 'Link',
              linkType: 'Entry',
              id: '1ZqorlUhaNhxZOcnjv6dgK',
            },
          },
        },
      },
    ],
    includes: {
      Entry: [
        {
          metadata: {
            tags: [],
          },
          sys: {
            space: {
              sys: {
                type: 'Link',
                linkType: 'Space',
                id: '8aevphvgewt8',
              },
            },
            id: '104yAsitns0fH86EfPqiNx',
            type: 'Entry',
            createdAt: '2023-08-21T12:06:18.424Z',
            updatedAt: '2023-09-01T08:15:55.800Z',
            environment: {
              sys: {
                id: 'rfearing-pillar-component',
                type: 'Link',
                linkType: 'Environment',
              },
            },
            revision: 3,
            contentType: {
              sys: {
                type: 'Link',
                linkType: 'ContentType',
                id: 'landingPageSection',
              },
            },
            locale: 'en-US',
          },
          fields: {
            title: '/contentful-e2e-test-do-not-remove: Top Section',
            components: [
              {
                sys: {
                  type: 'Link',
                  linkType: 'Entry',
                  id: '7lqRhExVy8OYg0HjD3rveL',
                },
              },
            ],
            colorMode: 'inherit',
          },
        },
        {
          metadata: {
            tags: [],
          },
          sys: {
            space: {
              sys: {
                type: 'Link',
                linkType: 'Space',
                id: '8aevphvgewt8',
              },
            },
            id: '12Y51B0IVCj1b7fmsglXvn',
            type: 'Entry',
            createdAt: '2023-09-25T16:07:35.200Z',
            updatedAt: '2023-10-02T19:37:59.159Z',
            environment: {
              sys: {
                id: 'rfearing-pillar-component',
                type: 'Link',
                linkType: 'Environment',
              },
            },
            revision: 8,
            contentType: {
              sys: {
                type: 'Link',
                linkType: 'ContentType',
                id: 'primerComponentRiver',
              },
            },
            locale: 'en-US',
          },
          fields: {
            title: '/contentful-e2e-test-do-not-remove: River 2',
            align: 'end',
            imageTextRatio: '50:50',
            heading: 'River Heading 2',
            text: {
              data: {},
              content: [
                {
                  data: {},
                  content: [
                    {
                      data: {},
                      marks: [],
                      value:
                        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Arcu dui vivamus arcu felis bibendum ut tristique et.',
                      nodeType: 'text',
                    },
                  ],
                  nodeType: 'paragraph',
                },
              ],
              nodeType: 'document',
            },
            image: {
              sys: {
                type: 'Link',
                linkType: 'Asset',
                id: 'iTGCMoFVibxjxZiUaqvew',
              },
            },
            imageAlt: 'This is a placeholder image; it does not offer any meaningful information.',
            hasShadow: false,
          },
        },
        {
          metadata: {
            tags: [],
          },
          sys: {
            space: {
              sys: {
                type: 'Link',
                linkType: 'Space',
                id: '8aevphvgewt8',
              },
            },
            id: '1ZqorlUhaNhxZOcnjv6dgK',
            type: 'Entry',
            createdAt: '2023-08-25T15:25:02.662Z',
            updatedAt: '2023-09-01T08:15:24.382Z',
            environment: {
              sys: {
                id: 'rfearing-pillar-component',
                type: 'Link',
                linkType: 'Environment',
              },
            },
            revision: 5,
            contentType: {
              sys: {
                type: 'Link',
                linkType: 'ContentType',
                id: 'pageSettings',
              },
            },
            locale: 'en-US',
          },
          fields: {
            title: '/contentful-e2e-test-do-not-remove: Page Settings',
            featureFlag: 'contentful_lp_e2e_test',
            colorMode: 'dark',
          },
        },
        {
          metadata: {
            tags: [],
          },
          sys: {
            space: {
              sys: {
                type: 'Link',
                linkType: 'Space',
                id: '8aevphvgewt8',
              },
            },
            id: '1wdyvBXo0NAPFrFtOFi6tm',
            type: 'Entry',
            createdAt: '2023-09-28T09:40:17.734Z',
            updatedAt: '2023-09-28T09:40:17.734Z',
            environment: {
              sys: {
                id: 'rfearing-pillar-component',
                type: 'Link',
                linkType: 'Environment',
              },
            },
            revision: 1,
            contentType: {
              sys: {
                type: 'Link',
                linkType: 'ContentType',
                id: 'primerComponentFaqQuestion',
              },
            },
            locale: 'en-US',
          },
          fields: {
            title: '/contentful-e2e-test-do-not-remove: FAQ Question 1',
            question: 'What is GitHub?',
            answer: {
              nodeType: 'document',
              data: {},
              content: [
                {
                  nodeType: 'paragraph',
                  data: {},
                  content: [
                    {
                      nodeType: 'text',
                      value:
                        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ',
                      marks: [],
                      data: {},
                    },
                    {
                      nodeType: 'hyperlink',
                      data: {
                        uri: 'https://github.com',
                      },
                      content: [
                        {
                          nodeType: 'text',
                          value: 'Lobortis mattis',
                          marks: [],
                          data: {},
                        },
                      ],
                    },
                    {
                      nodeType: 'text',
                      value:
                        ' aliquam faucibus purus in massa tempor nec. Sed ullamcorper morbi tincidunt ornare massa eget. Nec feugiat in fermentum posuere urna nec tincidunt. ',
                      marks: [],
                      data: {},
                    },
                  ],
                },
                {
                  nodeType: 'unordered-list',
                  data: {},
                  content: [
                    {
                      nodeType: 'list-item',
                      data: {},
                      content: [
                        {
                          nodeType: 'paragraph',
                          data: {},
                          content: [
                            {
                              nodeType: 'text',
                              value:
                                'Eleifend quam adipiscing vitae proin sagittis nisl rhoncus mattis rhoncus. Et odio pellentesque diam volutpat commodo sed egestas egestas.',
                              marks: [],
                              data: {},
                            },
                          ],
                        },
                      ],
                    },
                    {
                      nodeType: 'list-item',
                      data: {},
                      content: [
                        {
                          nodeType: 'paragraph',
                          data: {},
                          content: [
                            {
                              nodeType: 'text',
                              value:
                                'Suspendisse ultrices gravida dictum fusce ut placerat orci. Consectetur adipiscing elit pellentesque habitant morbi tristique senectus et netus.',
                              marks: [],
                              data: {},
                            },
                          ],
                        },
                      ],
                    },
                    {
                      nodeType: 'list-item',
                      data: {},
                      content: [
                        {
                          nodeType: 'paragraph',
                          data: {},
                          content: [
                            {
                              nodeType: 'text',
                              value:
                                'Eget nulla facilisi etiam dignissim. Diam phasellus vestibulum lorem sed risus ultricies tristique nulla aliquet. Morbi tempus iaculis urna id volutpat lacus laoreet.',
                              marks: [],
                              data: {},
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  nodeType: 'paragraph',
                  data: {},
                  content: [
                    {
                      nodeType: 'text',
                      value: '',
                      marks: [],
                      data: {},
                    },
                  ],
                },
              ],
            },
          },
        },
        {
          metadata: {
            tags: [],
          },
          sys: {
            space: {
              sys: {
                type: 'Link',
                linkType: 'Space',
                id: '8aevphvgewt8',
              },
            },
            id: '1yFKD7gjkCZcN82qlHnvP9',
            type: 'Entry',
            createdAt: '2023-10-02T17:49:20.796Z',
            updatedAt: '2023-10-02T19:59:08.590Z',
            environment: {
              sys: {
                id: 'rfearing-pillar-component',
                type: 'Link',
                linkType: 'Environment',
              },
            },
            revision: 3,
            contentType: {
              sys: {
                type: 'Link',
                linkType: 'ContentType',
                id: 'primerComponentPillar',
              },
            },
            locale: 'en-US',
          },
          fields: {
            title: '/contentful-e2e-test-do-not-remove: Pillar One',
            align: 'start',
            icon: 'accessibility-inset',
            heading: 'Example Pillar Heading',
            description: {
              data: {},
              content: [
                {
                  data: {},
                  content: [
                    {
                      data: {},
                      marks: [],
                      value:
                        'Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Maecenas faucibus mollis interdum.',
                      nodeType: 'text',
                    },
                  ],
                  nodeType: 'paragraph',
                },
              ],
              nodeType: 'document',
            },
            link: {
              sys: {
                type: 'Link',
                linkType: 'Entry',
                id: '7KLkF00KF8AA5Lci1rxfzN',
              },
            },
          },
        },
        {
          metadata: {
            tags: [],
          },
          sys: {
            space: {
              sys: {
                type: 'Link',
                linkType: 'Space',
                id: '8aevphvgewt8',
              },
            },
            id: '2AVvpK2M1KKAjuJwnaaOlc',
            type: 'Entry',
            createdAt: '2023-08-21T12:06:06.759Z',
            updatedAt: '2023-08-21T12:06:06.759Z',
            environment: {
              sys: {
                id: 'rfearing-pillar-component',
                type: 'Link',
                linkType: 'Environment',
              },
            },
            revision: 1,
            contentType: {
              sys: {
                type: 'Link',
                linkType: 'ContentType',
                id: 'link',
              },
            },
            locale: 'en-US',
          },
          fields: {
            text: 'Example of secondary action',
            href: 'https://github.com',
            openInNewTab: false,
          },
        },
        {
          metadata: {
            tags: [],
          },
          sys: {
            space: {
              sys: {
                type: 'Link',
                linkType: 'Space',
                id: '8aevphvgewt8',
              },
            },
            id: '3Edg1S5MRRs1ZBHYp0ruBu',
            type: 'Entry',
            createdAt: '2023-08-28T11:31:22.605Z',
            updatedAt: '2023-09-25T16:08:17.324Z',
            environment: {
              sys: {
                id: 'rfearing-pillar-component',
                type: 'Link',
                linkType: 'Environment',
              },
            },
            revision: 6,
            contentType: {
              sys: {
                type: 'Link',
                linkType: 'ContentType',
                id: 'landingPageSection',
              },
            },
            locale: 'en-US',
          },
          fields: {
            title: '/contentful-e2e-test-do-not-remove: Middle Section',
            components: [
              {
                sys: {
                  type: 'Link',
                  linkType: 'Entry',
                  id: '5qXhYZZNpNgANkmUEMp82b',
                },
              },
              {
                sys: {
                  type: 'Link',
                  linkType: 'Entry',
                  id: '43An3fz5bhQ5tw5ud7oPsH',
                },
              },
              {
                sys: {
                  type: 'Link',
                  linkType: 'Entry',
                  id: '12Y51B0IVCj1b7fmsglXvn',
                },
              },
            ],
            colorMode: 'light',
          },
        },
        {
          metadata: {
            tags: [],
          },
          sys: {
            space: {
              sys: {
                type: 'Link',
                linkType: 'Space',
                id: '8aevphvgewt8',
              },
            },
            id: '3LPtMdBwq6XlbCkuh7lqyY',
            type: 'Entry',
            createdAt: '2023-10-02T11:25:12.092Z',
            updatedAt: '2023-10-02T11:25:12.092Z',
            environment: {
              sys: {
                id: 'rfearing-pillar-component',
                type: 'Link',
                linkType: 'Environment',
              },
            },
            revision: 1,
            contentType: {
              sys: {
                type: 'Link',
                linkType: 'ContentType',
                id: 'templateFreeFormSection',
              },
            },
            locale: 'en-US',
          },
          fields: {
            title: '/contentful-e2e-test-do-not-remove: Bottom Section',
            components: [
              {
                sys: {
                  type: 'Link',
                  linkType: 'Entry',
                  id: '3nQy6j5Jf53VhD0Fiwz9Qf',
                },
              },
            ],
            colorMode: 'inherit',
          },
        },
        {
          metadata: {
            tags: [],
          },
          sys: {
            space: {
              sys: {
                type: 'Link',
                linkType: 'Space',
                id: '8aevphvgewt8',
              },
            },
            id: '3eYFYVeGYom6EBnVEoNYV2',
            type: 'Entry',
            createdAt: '2023-10-02T17:50:18.339Z',
            updatedAt: '2023-10-02T19:59:01.806Z',
            environment: {
              sys: {
                id: 'rfearing-pillar-component',
                type: 'Link',
                linkType: 'Environment',
              },
            },
            revision: 3,
            contentType: {
              sys: {
                type: 'Link',
                linkType: 'ContentType',
                id: 'primerComponentPillar',
              },
            },
            locale: 'en-US',
          },
          fields: {
            title: '/contentful-e2e-test-do-not-remove: Pillar Two',
            align: 'start',
            icon: 'copilot-warning',
            heading: 'Example heading number two',
            description: {
              data: {},
              content: [
                {
                  data: {},
                  content: [
                    {
                      data: {},
                      marks: [],
                      value:
                        'Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Maecenas faucibus mollis interdum.',
                      nodeType: 'text',
                    },
                  ],
                  nodeType: 'paragraph',
                },
              ],
              nodeType: 'document',
            },
            link: {
              sys: {
                type: 'Link',
                linkType: 'Entry',
                id: '4DI3PJg7exWWt60O7FiTqi',
              },
            },
          },
        },
        {
          metadata: {
            tags: [],
          },
          sys: {
            space: {
              sys: {
                type: 'Link',
                linkType: 'Space',
                id: '8aevphvgewt8',
              },
            },
            id: '3nQy6j5Jf53VhD0Fiwz9Qf',
            type: 'Entry',
            createdAt: '2023-09-28T09:40:25.043Z',
            updatedAt: '2023-09-28T09:40:25.043Z',
            environment: {
              sys: {
                id: 'rfearing-pillar-component',
                type: 'Link',
                linkType: 'Environment',
              },
            },
            revision: 1,
            contentType: {
              sys: {
                type: 'Link',
                linkType: 'ContentType',
                id: 'primerComponentFaq',
              },
            },
            locale: 'en-US',
          },
          fields: {
            title: '/contentful-e2e-test-do-not-remove: FAQ',
            heading: 'Frequently Asked Questions',
            blocks: [
              {
                sys: {
                  type: 'Link',
                  linkType: 'Entry',
                  id: '3x1LED4QpVey5O0TTsJEu6',
                },
              },
            ],
          },
        },
        {
          metadata: {
            tags: [],
          },
          sys: {
            space: {
              sys: {
                type: 'Link',
                linkType: 'Space',
                id: '8aevphvgewt8',
              },
            },
            id: '3x1LED4QpVey5O0TTsJEu6',
            type: 'Entry',
            createdAt: '2023-09-28T09:40:21.611Z',
            updatedAt: '2023-09-28T09:43:41.289Z',
            environment: {
              sys: {
                id: 'rfearing-pillar-component',
                type: 'Link',
                linkType: 'Environment',
              },
            },
            revision: 3,
            contentType: {
              sys: {
                type: 'Link',
                linkType: 'ContentType',
                id: 'primerComponentFaqBlock',
              },
            },
            locale: 'en-US',
          },
          fields: {
            title: '/contentful-e2e-test-do-not-remove: FAQ Block',
            heading: 'About GitHub',
            questions: [
              {
                sys: {
                  type: 'Link',
                  linkType: 'Entry',
                  id: '1wdyvBXo0NAPFrFtOFi6tm',
                },
              },
              {
                sys: {
                  type: 'Link',
                  linkType: 'Entry',
                  id: '5gq7zelhe7p3RfG1ikIzsg',
                },
              },
              {
                sys: {
                  type: 'Link',
                  linkType: 'Entry',
                  id: 'vvo3LQsbIfaMsbnJutSjQ',
                },
              },
            ],
          },
        },
        {
          metadata: {
            tags: [],
          },
          sys: {
            space: {
              sys: {
                type: 'Link',
                linkType: 'Space',
                id: '8aevphvgewt8',
              },
            },
            id: '43An3fz5bhQ5tw5ud7oPsH',
            type: 'Entry',
            createdAt: '2023-09-25T16:03:40.182Z',
            updatedAt: '2023-09-26T07:13:26.422Z',
            environment: {
              sys: {
                id: 'rfearing-pillar-component',
                type: 'Link',
                linkType: 'Environment',
              },
            },
            revision: 5,
            contentType: {
              sys: {
                type: 'Link',
                linkType: 'ContentType',
                id: 'primerComponentRiver',
              },
            },
            locale: 'en-US',
          },
          fields: {
            title: '/contentful-e2e-test-do-not-remove: River 1',
            align: 'start',
            imageTextRatio: '50:50',
            heading: 'River Heading',
            text: {
              data: {},
              content: [
                {
                  data: {},
                  content: [
                    {
                      data: {},
                      marks: [],
                      value:
                        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ',
                      nodeType: 'text',
                    },
                    {
                      data: {
                        uri: 'https://github.com',
                      },
                      content: [
                        {
                          data: {},
                          marks: [],
                          value: 'Arcu dui vivamus arcu felis bibendum',
                          nodeType: 'text',
                        },
                      ],
                      nodeType: 'hyperlink',
                    },
                    {
                      data: {},
                      marks: [],
                      value:
                        ' ut tristique et. Gravida arcu ac tortor dignissim convallis aenean et tortor. Condimentum lacinia quis vel eros donec ac odio.',
                      nodeType: 'text',
                    },
                  ],
                  nodeType: 'paragraph',
                },
              ],
              nodeType: 'document',
            },
            callToAction: {
              sys: {
                type: 'Link',
                linkType: 'Entry',
                id: '49gKeEzkIoFFO1RSkVSZo9',
              },
            },
            image: {
              sys: {
                type: 'Link',
                linkType: 'Asset',
                id: 'iTGCMoFVibxjxZiUaqvew',
              },
            },
            hasShadow: false,
          },
        },
        {
          metadata: {
            tags: [],
          },
          sys: {
            space: {
              sys: {
                type: 'Link',
                linkType: 'Space',
                id: '8aevphvgewt8',
              },
            },
            id: '49gKeEzkIoFFO1RSkVSZo9',
            type: 'Entry',
            createdAt: '2023-08-28T11:31:12.630Z',
            updatedAt: '2023-09-25T16:05:59.794Z',
            environment: {
              sys: {
                id: 'rfearing-pillar-component',
                type: 'Link',
                linkType: 'Environment',
              },
            },
            revision: 2,
            contentType: {
              sys: {
                type: 'Link',
                linkType: 'ContentType',
                id: 'link',
              },
            },
            locale: 'en-US',
          },
          fields: {
            text: 'Check out GitHub',
            href: 'https://www.github.com',
            openInNewTab: true,
          },
        },
        {
          metadata: {
            tags: [],
          },
          sys: {
            space: {
              sys: {
                type: 'Link',
                linkType: 'Space',
                id: '8aevphvgewt8',
              },
            },
            id: '4DI3PJg7exWWt60O7FiTqi',
            type: 'Entry',
            createdAt: '2023-10-02T17:50:00.951Z',
            updatedAt: '2023-10-02T17:50:00.951Z',
            environment: {
              sys: {
                id: 'rfearing-pillar-component',
                type: 'Link',
                linkType: 'Environment',
              },
            },
            revision: 1,
            contentType: {
              sys: {
                type: 'Link',
                linkType: 'ContentType',
                id: 'link',
              },
            },
            locale: 'en-US',
          },
          fields: {
            text: 'Testing link',
            href: '#',
            openInNewTab: false,
          },
        },
        {
          metadata: {
            tags: [],
          },
          sys: {
            space: {
              sys: {
                type: 'Link',
                linkType: 'Space',
                id: '8aevphvgewt8',
              },
            },
            id: '4KtnNjlE9MsKoN3rOZ2SFs',
            type: 'Entry',
            createdAt: '2023-08-21T12:05:06.881Z',
            updatedAt: '2023-08-21T12:05:46.352Z',
            environment: {
              sys: {
                id: 'rfearing-pillar-component',
                type: 'Link',
                linkType: 'Environment',
              },
            },
            revision: 2,
            contentType: {
              sys: {
                type: 'Link',
                linkType: 'ContentType',
                id: 'link',
              },
            },
            locale: 'en-US',
          },
          fields: {
            text: 'Example of primary action',
            href: 'https://github.com',
            openInNewTab: false,
          },
        },
        {
          metadata: {
            tags: [],
          },
          sys: {
            space: {
              sys: {
                type: 'Link',
                linkType: 'Space',
                id: '8aevphvgewt8',
              },
            },
            id: '4UnzpBVR4Aa3UWhJ9tndqV',
            type: 'Entry',
            createdAt: '2023-08-21T12:06:24.181Z',
            updatedAt: '2023-09-28T09:40:32.537Z',
            environment: {
              sys: {
                id: 'rfearing-pillar-component',
                type: 'Link',
                linkType: 'Environment',
              },
            },
            revision: 3,
            contentType: {
              sys: {
                type: 'Link',
                linkType: 'ContentType',
                id: 'landingPage',
              },
            },
            locale: 'en-US',
          },
          fields: {
            title: '/contentful-e2e-test-do-not-remove: Landing Page',
            sections: [
              {
                sys: {
                  type: 'Link',
                  linkType: 'Entry',
                  id: '104yAsitns0fH86EfPqiNx',
                },
              },
              {
                sys: {
                  type: 'Link',
                  linkType: 'Entry',
                  id: '3Edg1S5MRRs1ZBHYp0ruBu',
                },
              },
              {
                sys: {
                  type: 'Link',
                  linkType: 'Entry',
                  id: '6SM1eY2mFVPfRX6EVsS4QL',
                },
              },
            ],
          },
        },
        {
          metadata: {
            tags: [],
          },
          sys: {
            space: {
              sys: {
                type: 'Link',
                linkType: 'Space',
                id: '8aevphvgewt8',
              },
            },
            id: '5gq7zelhe7p3RfG1ikIzsg',
            type: 'Entry',
            createdAt: '2023-09-28T09:41:50.727Z',
            updatedAt: '2023-09-28T09:41:50.727Z',
            environment: {
              sys: {
                id: 'rfearing-pillar-component',
                type: 'Link',
                linkType: 'Environment',
              },
            },
            revision: 1,
            contentType: {
              sys: {
                type: 'Link',
                linkType: 'ContentType',
                id: 'primerComponentFaqQuestion',
              },
            },
            locale: 'en-US',
          },
          fields: {
            title: '/contentful-e2e-test-do-not-remove: FAQ Question 2',
            question: 'What is GitHub Enterprise?',
            answer: {
              nodeType: 'document',
              data: {},
              content: [
                {
                  nodeType: 'paragraph',
                  data: {},
                  content: [
                    {
                      nodeType: 'text',
                      value:
                        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. In eu mi bibendum neque. Vestibulum sed arcu non odio euismod lacinia at quis risus. Vitae congue mauris rhoncus aenean vel. Tellus cras adipiscing enim eu turpis egestas. Risus in hendrerit gravida rutrum quisque. Dolor sit amet consectetur adipiscing elit pellentesque habitant morbi tristique. Risus in hendrerit gravida rutrum quisque non tellus orci ac. Sit amet facilisis magna etiam tempor orci eu lobortis elementum. Enim ut tellus elementum sagittis. Pretium fusce id velit ut tortor pretium viverra. Congue mauris rhoncus aenean vel elit scelerisque mauris.',
                      marks: [],
                      data: {},
                    },
                  ],
                },
              ],
            },
          },
        },
        {
          metadata: {
            tags: [],
          },
          sys: {
            space: {
              sys: {
                type: 'Link',
                linkType: 'Space',
                id: '8aevphvgewt8',
              },
            },
            id: '5qXhYZZNpNgANkmUEMp82b',
            type: 'Entry',
            createdAt: '2023-08-28T11:31:18.015Z',
            updatedAt: '2023-09-25T16:08:55.510Z',
            environment: {
              sys: {
                id: 'rfearing-pillar-component',
                type: 'Link',
                linkType: 'Environment',
              },
            },
            revision: 2,
            contentType: {
              sys: {
                type: 'Link',
                linkType: 'ContentType',
                id: 'primerComponentSectionIntro',
              },
            },
            locale: 'en-US',
          },
          fields: {
            title: '/contentful-e2e-test-do-not-remove: SectionIntro',
            align: 'center',
            heading: {
              data: {},
              content: [
                {
                  data: {},
                  content: [
                    {
                      data: {},
                      marks: [],
                      value: 'GitHub Section Intro',
                      nodeType: 'text',
                    },
                  ],
                  nodeType: 'paragraph',
                },
              ],
              nodeType: 'document',
            },
            description: {
              data: {},
              content: [
                {
                  data: {},
                  content: [
                    {
                      data: {},
                      marks: [],
                      value: 'This is where the description for the Section Intro goes. ',
                      nodeType: 'text',
                    },
                  ],
                  nodeType: 'paragraph',
                },
              ],
              nodeType: 'document',
            },
          },
        },
        {
          metadata: {
            tags: [],
          },
          sys: {
            space: {
              sys: {
                type: 'Link',
                linkType: 'Space',
                id: '8aevphvgewt8',
              },
            },
            id: '6SM1eY2mFVPfRX6EVsS4QL',
            type: 'Entry',
            createdAt: '2023-09-28T09:40:28.042Z',
            updatedAt: '2023-09-28T09:40:28.042Z',
            environment: {
              sys: {
                id: 'rfearing-pillar-component',
                type: 'Link',
                linkType: 'Environment',
              },
            },
            revision: 1,
            contentType: {
              sys: {
                type: 'Link',
                linkType: 'ContentType',
                id: 'landingPageSection',
              },
            },
            locale: 'en-US',
          },
          fields: {
            title: '/contentful-e2e-test-do-not-remove: Bottom Section',
            components: [
              {
                sys: {
                  type: 'Link',
                  linkType: 'Entry',
                  id: '3nQy6j5Jf53VhD0Fiwz9Qf',
                },
              },
            ],
            colorMode: 'inherit',
          },
        },
        {
          metadata: {
            tags: [],
          },
          sys: {
            space: {
              sys: {
                type: 'Link',
                linkType: 'Space',
                id: '8aevphvgewt8',
              },
            },
            id: '6VcJToW7LIooBorvZuLF6d',
            type: 'Entry',
            createdAt: '2023-10-02T11:25:17.895Z',
            updatedAt: '2023-10-02T18:33:52.969Z',
            environment: {
              sys: {
                id: 'rfearing-pillar-component',
                type: 'Link',
                linkType: 'Environment',
              },
            },
            revision: 3,
            contentType: {
              sys: {
                type: 'Link',
                linkType: 'ContentType',
                id: 'templateFreeForm',
              },
            },
            locale: 'en-US',
          },
          fields: {
            title: '/contentful-e2e-test-do-not-remove: Template',
            sections: [
              {
                sys: {
                  type: 'Link',
                  linkType: 'Entry',
                  id: '6e9PKTZu5kbpRCSHaSILpk',
                },
              },
              {
                sys: {
                  type: 'Link',
                  linkType: 'Entry',
                  id: '7v9vsoAcKPVFto45Y4kHeN',
                },
              },
              {
                sys: {
                  type: 'Link',
                  linkType: 'Entry',
                  id: '3LPtMdBwq6XlbCkuh7lqyY',
                },
              },
            ],
          },
        },
        {
          metadata: {
            tags: [],
          },
          sys: {
            space: {
              sys: {
                type: 'Link',
                linkType: 'Space',
                id: '8aevphvgewt8',
              },
            },
            id: '6e9PKTZu5kbpRCSHaSILpk',
            type: 'Entry',
            createdAt: '2023-10-02T11:24:28.854Z',
            updatedAt: '2023-10-02T11:24:28.854Z',
            environment: {
              sys: {
                id: 'rfearing-pillar-component',
                type: 'Link',
                linkType: 'Environment',
              },
            },
            revision: 1,
            contentType: {
              sys: {
                type: 'Link',
                linkType: 'ContentType',
                id: 'templateFreeFormSection',
              },
            },
            locale: 'en-US',
          },
          fields: {
            title: '/contentful-e2e-test-do-not-remove: Top Section',
            components: [
              {
                sys: {
                  type: 'Link',
                  linkType: 'Entry',
                  id: '7lqRhExVy8OYg0HjD3rveL',
                },
              },
            ],
            colorMode: 'inherit',
          },
        },
        {
          metadata: {
            tags: [],
          },
          sys: {
            space: {
              sys: {
                type: 'Link',
                linkType: 'Space',
                id: '8aevphvgewt8',
              },
            },
            id: '7KLkF00KF8AA5Lci1rxfzN',
            type: 'Entry',
            createdAt: '2023-10-02T17:49:15.624Z',
            updatedAt: '2023-10-02T17:49:15.624Z',
            environment: {
              sys: {
                id: 'rfearing-pillar-component',
                type: 'Link',
                linkType: 'Environment',
              },
            },
            revision: 1,
            contentType: {
              sys: {
                type: 'Link',
                linkType: 'ContentType',
                id: 'link',
              },
            },
            locale: 'en-US',
          },
          fields: {
            text: 'Example',
            href: 'Link',
            openInNewTab: false,
          },
        },
        {
          metadata: {
            tags: [],
          },
          sys: {
            space: {
              sys: {
                type: 'Link',
                linkType: 'Space',
                id: '8aevphvgewt8',
              },
            },
            id: '7lqRhExVy8OYg0HjD3rveL',
            type: 'Entry',
            createdAt: '2023-08-21T12:06:11.398Z',
            updatedAt: '2023-08-21T12:26:53.134Z',
            environment: {
              sys: {
                id: 'rfearing-pillar-component',
                type: 'Link',
                linkType: 'Environment',
              },
            },
            revision: 3,
            contentType: {
              sys: {
                type: 'Link',
                linkType: 'ContentType',
                id: 'primerComponentHero',
              },
            },
            locale: 'en-US',
          },
          fields: {
            title: '/contentful-e2e-test-do-not-remove: Hero',
            align: 'start',
            heading: 'This is my super sweet hero heading',
            description:
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit. In sapien sit ullamcorper id. Aliquam luctus sed turpis felis nam pulvinar risus elementum.',
            callToActionPrimary: {
              sys: {
                type: 'Link',
                linkType: 'Entry',
                id: '4KtnNjlE9MsKoN3rOZ2SFs',
              },
            },
            callToActionSecondary: {
              sys: {
                type: 'Link',
                linkType: 'Entry',
                id: '2AVvpK2M1KKAjuJwnaaOlc',
              },
            },
          },
        },
        {
          metadata: {
            tags: [],
          },
          sys: {
            space: {
              sys: {
                type: 'Link',
                linkType: 'Space',
                id: '8aevphvgewt8',
              },
            },
            id: '7v9vsoAcKPVFto45Y4kHeN',
            type: 'Entry',
            createdAt: '2023-10-02T11:24:54.384Z',
            updatedAt: '2023-10-02T19:54:49.082Z',
            environment: {
              sys: {
                id: 'rfearing-pillar-component',
                type: 'Link',
                linkType: 'Environment',
              },
            },
            revision: 7,
            contentType: {
              sys: {
                type: 'Link',
                linkType: 'ContentType',
                id: 'templateFreeFormSection',
              },
            },
            locale: 'en-US',
          },
          fields: {
            title: '/contentful-e2e-test-do-not-remove: Middle Section',
            components: [
              {
                sys: {
                  type: 'Link',
                  linkType: 'Entry',
                  id: '5qXhYZZNpNgANkmUEMp82b',
                },
              },
              {
                sys: {
                  type: 'Link',
                  linkType: 'Entry',
                  id: '43An3fz5bhQ5tw5ud7oPsH',
                },
              },
              {
                sys: {
                  type: 'Link',
                  linkType: 'Entry',
                  id: '12Y51B0IVCj1b7fmsglXvn',
                },
              },
              {
                sys: {
                  type: 'Link',
                  linkType: 'Entry',
                  id: 'XxbAFduSswW3RqqU3C5k4',
                },
              },
            ],
            colorMode: 'light',
          },
        },
        {
          metadata: {
            tags: [],
          },
          sys: {
            space: {
              sys: {
                type: 'Link',
                linkType: 'Space',
                id: '8aevphvgewt8',
              },
            },
            id: 'XxbAFduSswW3RqqU3C5k4',
            type: 'Entry',
            createdAt: '2023-10-02T17:50:25.328Z',
            updatedAt: '2023-10-02T20:17:12.457Z',
            environment: {
              sys: {
                id: 'rfearing-pillar-component',
                type: 'Link',
                linkType: 'Environment',
              },
            },
            revision: 4,
            contentType: {
              sys: {
                type: 'Link',
                linkType: 'ContentType',
                id: 'primerPillars',
              },
            },
            locale: 'en-US',
          },
          fields: {
            title: '/contentful-e2e-test-do-not-remove: Pillars Section',
            pillars: [
              {
                sys: {
                  type: 'Link',
                  linkType: 'Entry',
                  id: '1yFKD7gjkCZcN82qlHnvP9',
                },
              },
              {
                sys: {
                  type: 'Link',
                  linkType: 'Entry',
                  id: '3eYFYVeGYom6EBnVEoNYV2',
                },
              },
              {
                sys: {
                  type: 'Link',
                  linkType: 'Entry',
                  id: '1yFKD7gjkCZcN82qlHnvP9',
                },
              },
            ],
          },
        },
        {
          metadata: {
            tags: [],
          },
          sys: {
            space: {
              sys: {
                type: 'Link',
                linkType: 'Space',
                id: '8aevphvgewt8',
              },
            },
            id: 'vvo3LQsbIfaMsbnJutSjQ',
            type: 'Entry',
            createdAt: '2023-09-28T09:43:38.974Z',
            updatedAt: '2023-09-28T09:43:38.974Z',
            environment: {
              sys: {
                id: 'rfearing-pillar-component',
                type: 'Link',
                linkType: 'Environment',
              },
            },
            revision: 1,
            contentType: {
              sys: {
                type: 'Link',
                linkType: 'ContentType',
                id: 'primerComponentFaqQuestion',
              },
            },
            locale: 'en-US',
          },
          fields: {
            title: '/contentful-e2e-test-do-not-remove: FAQ Question 3',
            question: 'What is GitHub Enterprise Cloud?',
            answer: {
              nodeType: 'document',
              data: {},
              content: [
                {
                  nodeType: 'paragraph',
                  data: {},
                  content: [
                    {
                      nodeType: 'text',
                      value:
                        'Sagittis aliquam malesuada bibendum arcu vitae elementum. Turpis egestas integer eget aliquet nibh praesent. Donec ultrices tincidunt arcu non. Donec adipiscing tristique risus nec feugiat. Pretium lectus quam id leo in vitae turpis massa sed.',
                      marks: [],
                      data: {},
                    },
                  ],
                },
              ],
            },
          },
        },
      ],
      Asset: [
        {
          metadata: {
            tags: [],
          },
          sys: {
            space: {
              sys: {
                type: 'Link',
                linkType: 'Space',
                id: '8aevphvgewt8',
              },
            },
            id: 'iTGCMoFVibxjxZiUaqvew',
            type: 'Asset',
            createdAt: '2023-09-25T16:05:12.083Z',
            updatedAt: '2023-09-25T16:05:12.083Z',
            environment: {
              sys: {
                id: 'rfearing-pillar-component',
                type: 'Link',
                linkType: 'Environment',
              },
            },
            revision: 1,
            locale: 'en-US',
          },
          fields: {
            title: 'River Placeholder',
            description: '',
            file: {
              url: '//images.ctfassets.net/8aevphvgewt8/iTGCMoFVibxjxZiUaqvew/f51e737f4bc6fd98851bf40c89f410a5/Image.png',
              details: {
                size: 2578,
                image: {
                  width: 600,
                  height: 480,
                },
              },
              fileName: 'Image.png',
              contentType: 'image/png',
            },
          },
        },
      ],
    },
  },
}
