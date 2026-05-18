import { describe, it, expect, vi } from 'vitest';
import axios, { AxiosError } from 'axios';
import { extractApiError } from '../api';

function makeAxiosError(status: number, data?: unknown): AxiosError {
  const err = new AxiosError('Request failed', 'ERR_BAD_RESPONSE');
  (err as AxiosError).response = {
    status,
    statusText: String(status),
    headers: {},
    config: {} as AxiosError['config'],
    data,
  } as AxiosError['response'];
  return err;
}

describe('extractApiError', () => {
  it('extracts error from Axios response with data.error', () => {
    const err = makeAxiosError(400, { error: { code: 'VALIDATION_ERROR', message: 'Bad input', details: [{ field: 'email' }] } });
    const result = extractApiError(err);
    expect(result.message).toBe('Bad input');
    expect(result.code).toBe('VALIDATION_ERROR');
    expect(result.details).toEqual([{ field: 'email' }]);
  });

  it('returns message from AxiosError when no data.error', () => {
    const err = makeAxiosError(500);
    const result = extractApiError(err);
    expect(result.message).toBe('Request failed');
  });

  it('returns message from plain Error', () => {
    const result = extractApiError(new Error('Something went wrong'));
    expect(result.message).toBe('Something went wrong');
  });

  it('returns fallback for unknown error type', () => {
    const result = extractApiError('some string error');
    expect(result.message).toBe('An unexpected error occurred');
  });

  it('returns fallback for null', () => {
    const result = extractApiError(null);
    expect(result.message).toBe('An unexpected error occurred');
  });
});
