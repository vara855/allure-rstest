import type { AttachmentOptions } from 'allure-js-commons';
import type { RuntimeMessage } from 'allure-js-commons/sdk';
import { uint8ArrayToBase64 } from 'allure-js-commons/sdk';
import { MessageTestRuntime } from 'allure-js-commons/sdk/runtime';

const toBase64 = (content: Buffer | Uint8Array | string): string =>
  typeof content === 'string'
    ? uint8ArrayToBase64(new TextEncoder().encode(content))
    : uint8ArrayToBase64(content instanceof Uint8Array ? content : new Uint8Array(content));

/**
 * Browser runtime. Per-test metadata is a documented v1 limitation: the browser has no
 * AsyncLocalStorage, so `getCurrentTask()` cannot resolve the running test, and messages
 * are not routed into `task.meta`. The class keeps browser-safe attachment handling and
 * a no-op `sendMessage` so the Allure API is usable without throwing.
 */
export class RstestBrowserTestRuntime extends MessageTestRuntime {
  sendMessage(_message: RuntimeMessage): Promise<void> {
    return Promise.resolve();
  }

  async attachment(name: string, content: Buffer | Uint8Array | string, options: AttachmentOptions) {
    await this.sendMessage({
      type: 'attachment_content',
      data: {
        name,
        content: toBase64(content),
        encoding: 'base64',
        contentType: options.contentType,
        fileExtension: options.fileExtension,
        wrapInStep: true,
        timestamp: Date.now(),
      },
    });
  }

  async globalAttachment(
    name: string,
    content: Buffer | Uint8Array | string,
    options: AttachmentOptions,
  ) {
    await this.sendMessage({
      type: 'global_attachment_content',
      data: {
        name,
        content: toBase64(content),
        encoding: 'base64',
        contentType: options.contentType,
        fileExtension: options.fileExtension,
      },
    });
  }

  protected override syncAttachment(
    sendMessageSync: (message: RuntimeMessage) => void,
    name: string,
    content: Buffer | Uint8Array | string,
    options: AttachmentOptions,
  ) {
    sendMessageSync({
      type: 'attachment_content',
      data: {
        name,
        content: toBase64(content),
        encoding: 'base64',
        contentType: options.contentType,
        fileExtension: options.fileExtension,
        wrapInStep: true,
        timestamp: Date.now(),
      },
    });
  }

  protected override syncGlobalAttachment(
    sendMessageSync: (message: RuntimeMessage) => void,
    name: string,
    content: Buffer | Uint8Array | string,
    options: AttachmentOptions,
  ) {
    sendMessageSync({
      type: 'global_attachment_content',
      data: {
        name,
        content: toBase64(content),
        encoding: 'base64',
        contentType: options.contentType,
        fileExtension: options.fileExtension,
      },
    });
  }
}