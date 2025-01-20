import {BLOCKS} from '@contentful/rich-text-types'

export const FaqGroupPayload = {
  sys: {
    contentType: {
      sys: {
        id: 'primerComponentFaqGroup',
      },
    },
    id: 'primer-component-faq-group',
  },
  fields: {
    heading: 'Frequently Asked Questions',
    faqs: [
      {
        sys: {
          contentType: {
            sys: {
              id: 'primerComponentFaq',
            },
          },
          id: 'primer-component-faq-1',
        },
        fields: {
          heading: 'General Questions',
          blocks: [
            {
              sys: {
                contentType: {
                  sys: {
                    id: 'primerComponentFaqBlock',
                  },
                },
                id: 'faq-block-1',
              },
              fields: {
                questions: [
                  {
                    sys: {
                      contentType: {
                        sys: {
                          id: 'primerComponentFaqQuestion',
                        },
                      },
                      id: 'faq-question-1',
                    },
                    fields: {
                      question: 'What is the meaning of life?',
                      answer: {
                        data: {},
                        content: [
                          {
                            data: {},
                            content: [
                              {
                                data: {},
                                marks: [],
                                value: '42',
                                nodeType: 'text',
                              },
                            ],
                            nodeType: BLOCKS.PARAGRAPH,
                          },
                        ],
                        nodeType: BLOCKS.DOCUMENT,
                      },
                    },
                  },
                  {
                    sys: {
                      contentType: {
                        sys: {
                          id: 'primerComponentFaqQuestion',
                        },
                      },
                      id: 'faq-question-2',
                    },
                    fields: {
                      question: 'What is the purpose of life?',
                      answer: {
                        data: {},
                        content: [
                          {
                            data: {},
                            content: [
                              {
                                data: {},
                                marks: [],
                                value: 'To be happy.',
                                nodeType: 'text',
                              },
                            ],
                            nodeType: BLOCKS.PARAGRAPH,
                          },
                        ],
                        nodeType: BLOCKS.DOCUMENT,
                      },
                    },
                  },
                ],
              },
            },
          ],
        },
      },
      {
        sys: {
          contentType: {
            sys: {
              id: 'primerComponentFaq',
            },
          },
          id: 'primer-component-faq-2',
        },
        fields: {
          heading: 'More General Questions',
          blocks: [
            {
              sys: {
                contentType: {
                  sys: {
                    id: 'primerComponentFaqBlock',
                  },
                },
                id: 'faq-block-1',
              },
              fields: {
                questions: [
                  {
                    sys: {
                      contentType: {
                        sys: {
                          id: 'primerComponentFaqQuestion',
                        },
                      },
                      id: 'faq-question-1',
                    },
                    fields: {
                      question: 'What is GitHub?',
                      answer: {
                        data: {},
                        content: [
                          {
                            data: {},
                            content: [
                              {
                                data: {},
                                marks: [],
                                value: 'A platform for developers.',
                                nodeType: 'text',
                              },
                            ],
                            nodeType: BLOCKS.PARAGRAPH,
                          },
                        ],
                        nodeType: BLOCKS.DOCUMENT,
                      },
                    },
                  },
                  {
                    sys: {
                      contentType: {
                        sys: {
                          id: 'primerComponentFaqQuestion',
                        },
                      },
                      id: 'faq-question-2',
                    },
                    fields: {
                      question: 'What is the difference between Git and GitHub?',
                      answer: {
                        data: {},
                        content: [
                          {
                            data: {},
                            content: [
                              {
                                data: {},
                                marks: [],
                                value: 'Git is a version control system. GitHub is a platform for developers.',
                                nodeType: 'text',
                              },
                            ],
                            nodeType: BLOCKS.PARAGRAPH,
                          },
                        ],
                        nodeType: BLOCKS.DOCUMENT,
                      },
                    },
                  },
                ],
              },
            },
          ],
        },
      },
    ],
  },
}
