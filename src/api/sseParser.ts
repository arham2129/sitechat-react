export interface SseMessage {
  event: string;
  data: string;
}

// Implements the subset of the WHATWG event-stream format the chat endpoint uses.
// Hand-written because EventSource cannot send a POST body.
export function createSseParser(onMessage: (message: SseMessage) => void) {
  let buffer = '';
  let eventName = '';
  let dataLines: string[] = [];

  const dispatch = () => {
    // Per spec, a blank line with no data lines is not an event.
    if (dataLines.length > 0) {
      onMessage({ event: eventName || 'message', data: dataLines.join('\n') });
    }
    eventName = '';
    dataLines = [];
  };

  const processLine = (line: string) => {
    if (line === '') {
      dispatch();
      return;
    }
    if (line.startsWith(':')) return;
    const colon = line.indexOf(':');
    const field = colon === -1 ? line : line.slice(0, colon);
    let value = colon === -1 ? '' : line.slice(colon + 1);
    if (value.startsWith(' ')) value = value.slice(1);
    if (field === 'event') eventName = value;
    else if (field === 'data') dataLines.push(value);
    // Unknown fields (id, retry, or garbage) are ignored rather than aborting the stream.
  };

  // True when the previous chunk ended in "\r", which may be the first half of "\r\n".
  let pendingCR = false;

  return {
    push(chunk: string) {
      const text = pendingCR && chunk.startsWith('\n') ? chunk.slice(1) : chunk;
      pendingCR = chunk.endsWith('\r');
      buffer += text;
      const lines = buffer.split(/\r\n|\r|\n/);
      buffer = lines.pop() ?? '';
      for (const line of lines) processLine(line);
    },
    end() {
      if (buffer !== '') processLine(buffer);
      buffer = '';
      dispatch();
    },
  };
}

export async function* readSse(stream: ReadableStream<Uint8Array>): AsyncGenerator<SseMessage> {
  const reader = stream.getReader();
  // stream: true keeps a multi-byte UTF-8 character that is split across chunks intact.
  const decoder = new TextDecoder();
  const queue: SseMessage[] = [];
  const parser = createSseParser((message) => queue.push(message));
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      parser.push(decoder.decode(value, { stream: true }));
      yield* queue.splice(0);
    }
    parser.push(decoder.decode());
    parser.end();
    yield* queue.splice(0);
  } finally {
    reader.releaseLock();
  }
}
