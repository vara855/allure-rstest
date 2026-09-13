import type { AttachmentOptions } from 'allure-js-commons';
import type { RuntimeMessage } from 'allure-js-commons/sdk';

import { BaseRstestTestRuntime } from './runtime.js';

const toBuffer = (content: Buffer | Uint8Array | string, encoding?: BufferEncoding): Buffer =>
  typeof content === 'string' ? Buffer.from(content, encoding) : Buffer.from(content);

export class RstestTestRuntime extends BaseRstestTestRuntime {
  async attachment(name: string, content: Buffer | Uint8Array | string, options: AttachmentOptions) {
    await this.sendMessage({
      type: 'attachment_content',
      data: {
        name,
        content: toBuffer(content, options.encoding).toString('base64'),
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
        content: toBuffer(content, options.encoding).toString('base64'),
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
        content: toBuffer(content, options.encoding).toString('base64'),
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
        content: toBuffer(content, options.encoding).toString('base64'),
        encoding: 'base64',
        contentType: options.contentType,
        fileExtension: options.fileExtension,
      },
    });
  }
}
