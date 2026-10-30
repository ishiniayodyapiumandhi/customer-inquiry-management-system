import test from 'node:test';
import assert from 'node:assert/strict';
import { inquirySchema } from '../src/validation.js';

test('inquiry validation rejects missing and short customer data', () => {
  const result = inquirySchema.safeParse({ customerName: '', contact: 'x', subject: 'Hi', description: 'short' });
  assert.equal(result.success, false);
});

test('inquiry validation accepts a complete inquiry', () => {
  const result = inquirySchema.safeParse({ customerName: 'Ada Lovelace', contact: 'ada@example.com', subject: 'Booking question', description: 'I would like to know whether a weekend appointment is available.' });
  assert.equal(result.success, true);
});