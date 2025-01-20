export const MOCK_INVOICE = {
  customerId: '123',
  year: 2021,
  month: 1,
  usageTotal: {
    gross: 100,
    net: 100,
    discount: 0,
    quantity: 1,
  },
  ProductTotals: {
    actions: {
      product: 'actions',
      usageTotal: {gross: 1.84, discount: 1.1280000000000001, net: 0.712, quantity: 44.0},
      SkuTotals: {
        actions_windows: {
          sku: 'actions_windows',
          usageTotal: {gross: 0.096, discount: 0.0, net: 0.096, quantity: 6.0},
          billingItems: [
            {
              usageEntityId: '9370667',
              sku: 'actions_windows',
              product: 'actions',
              quantity: 6.0,
              billedAmount: 0.096,
              appliedCostPerQuantity: 0.016,
              usageAt: 1687794806193,
              selfReferene: {id: '9370667:actions_windows:2023:6:26', partitionKey: '9370667:2023:6'},
              friendlySkuName: '',
              repoId: 658833704,
              orgId: 137527783,
            },
          ],
        },
      },
    },
  },
}

export const mockAzureEmission = {
  id: '1',
  azurePartitionKey: '940d8147-9fab-428d-81c6-276dba19ca1b',
  sku: 'actions_linux',
  quantity: 100.23,
  emissionState: 'pending',
  emissionDate: '2023-03-22',
}
