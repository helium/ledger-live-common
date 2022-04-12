jest.setTimeout(1200000);

describe('Run simple bot', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should show bot finished', async () => {
    await expect(element(by.text('Bot finished'))).toBeVisible();
  });
});
