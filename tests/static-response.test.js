import test from 'node:test';
import assert from 'node:assert/strict';
import { gunzipSync } from 'node:zlib';
import { publicRepresentation } from '../static-response.js';

test('public gzip is negotiated, byte-equivalent and independently revalidated', async () => {
  const content = Buffer.from('Conteúdo público fictício\n'.repeat(3000));
  const identity = await publicRepresentation(content, 'text/javascript', {});
  const gzip = await publicRepresentation(content, 'text/javascript', { 'accept-encoding': 'gzip' });
  assert.deepEqual(identity.body, content);
  assert.deepEqual(gunzipSync(gzip.body), content);
  assert.ok(gzip.body.length < content.length / 10);
  assert.equal(gzip.headers['Content-Encoding'], 'gzip');
  assert.notEqual(identity.headers.ETag, gzip.headers.ETag);
  assert.equal(gzip.headers.Vary, 'Accept-Encoding');
  assert.equal((await publicRepresentation(content, 'text/javascript', { 'accept-encoding': 'gzip;q=0, *;q=1' })).headers['Content-Encoding'], undefined);
  assert.equal((await publicRepresentation(content, 'text/javascript', { 'accept-encoding': 'gzip', 'if-none-match': 'W/' + gzip.headers.ETag })).status, 304);
  assert.equal((await publicRepresentation(Buffer.from('changed'), 'text/javascript', { 'if-none-match': identity.headers.ETag })).status, 200);
  assert.equal((await publicRepresentation(content, 'text/javascript', { 'accept-encoding': 'identity;q=0, gzip;q=0' })).status, 406);
  assert.equal((await publicRepresentation(Buffer.from('small'), 'text/css', { 'accept-encoding': 'gzip' })).headers['Content-Encoding'], undefined);
});
