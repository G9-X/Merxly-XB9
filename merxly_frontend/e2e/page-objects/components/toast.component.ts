import { type Page, type Locator } from '@playwright/test';

export class ToastComponent {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get successToast(): Locator {
    return this.page.locator('.Toastify__toast--success, [data-sonner-toast][data-type="success"]');
  }

  get errorToast(): Locator {
    return this.page.locator('.Toastify__toast--error, [data-sonner-toast][data-type="error"]');
  }

  async waitForSuccess(timeout = 5000): Promise<void> {
    await this.successToast.first().waitFor({ state: 'visible', timeout });
  }

  async waitForError(timeout = 5000): Promise<void> {
    await this.errorToast.first().waitFor({ state: 'visible', timeout });
  }

  async getToastMessage(): Promise<string> {
    const toast = this.page.locator('.Toastify__toast-body, [data-sonner-toast]').first();
    await toast.waitFor({ state: 'visible', timeout: 5000 });
    return toast.innerText();
  }
}
