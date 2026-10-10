import { createHash } from 'node:crypto';
import { gzip } from 'node:zlib';
import { promisify } from 'node:util';

const compress = promisify(gzip);
function quality(header, encoding) {
  const values = new Map(String(header || '').split(',').map(part => {
    const [name, ...parameters] = part.trim().toLowerCase().split(';');
    const parameter = parameters.map(p => p.trim()).find(p => p.startsWith('q='));
    const value = parameter ? (/^q=(?:0(?:\.\d{0,3})?|1(?:\.0{0,3})?)$/.test(parameter) ? Number(parameter.slice(2)) : 0) : 1;
    return [name, value];
  }));
  return values.get(encoding) ?? (encoding === 'identity' ? (values.get('*') === 0 ? 0 : 1) : values.get('*') ?? 0);
}
export async function publicRepresentation(content, type, requestHeaders) {
  const gzipQuality = quality(requestHeaders['accept-encoding'], 'gzip');
  const identityQuality = quality(requestHeaders['accept-encoding'], 'identity');
  const headers = { 'Content-Type': `${type}; charset=utf-8`, 'Cache-Control': 'no-cache', Vary: 'Accept-Encoding' };
  if (!gzipQuality && !identityQuality) return { status: 406, headers, body: Buffer.alloc(0) };
  let body = content;
  if (gzipQuality && gzipQuality >= identityQuality && (content.length >= 1024 || !identityQuality) && /^(text\/|application\/xml|image\/svg\+xml)/.test(type)) {
    const compressed = await compress(content);
    if (compressed.length < content.length || !identityQuality) { body = compressed; headers['Content-Encoding'] = 'gzip'; }
  }
  if (!identityQuality && !headers['Content-Encoding']) return { status: 406, headers, body: Buffer.alloc(0) };
  headers.ETag = '"' + createHash('sha256').update(body).digest('hex') + '"';
  const validators = String(requestHeaders['if-none-match'] || '').split(',').map(value => value.trim().replace(/^W\//, ''));
  const status = validators.includes('*') || validators.includes(headers.ETag) ? 304 : 200;
  headers['Content-Length'] = String(body.length);
  return { status, headers, body };
}
