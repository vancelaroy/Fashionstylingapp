import test from 'node:test';
import assert from 'node:assert/strict';
import { saveFeedback } from '../supabase/functions/server/feedback.ts';
const body = { submissionId: '12345678-1234-1234-1234-123456789abc', trying: 'Browse clothes', stuck: 'Could not reach last item' };
test('anonymous feedback cannot write', async () => {
  assert.equal((await saveFeedback(null, body, async () => assert.fail('must not write'))).status, 401);
});
test('account ownership comes from verified identity, and retries use same key', async () => {
  const writes = [];
  const write = async (key, value) => writes.push({key,value});
  await saveFeedback('account-a', {...body, userId:'account-b'}, write);
  await saveFeedback('account-a', body, write);
  await saveFeedback('account-b', body, write);
  assert.equal(writes[0].value.userId, 'account-a');
  assert.equal(writes[0].key, writes[1].key);
  assert.notEqual(writes[0].key, writes[2].key);
  assert.ok(writes[0].value.submittedAt);
});
test('required, malformed, and oversized fields cannot write', async () => {
  for (const input of [null, {...body, trying:' '}, {...body, stuck:42}, {...body, idea:'a'.repeat(4001)}]) {
    assert.equal((await saveFeedback('account-a', input, async () => assert.fail('must not write'))).status, 400);
  }
});
test('storage failures reject rather than report success', async () => {
  await assert.rejects(saveFeedback('account-a', body, async () => {throw new Error('offline');}));
});
