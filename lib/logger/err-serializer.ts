import is from '@sindresorhus/is';
import { sanitize } from '../util/sanitize';
import prepareError from './utils';

Error.stackTraceLimit = 20;

export default function errSerializer(err: Error): any {
  const response: Record<string, unknown> = prepareError(err);

  // already done by `sanitizeValue` ?
  const redactedFields = ['message', 'stack', 'stdout', 'stderr'];
  for (const field of redactedFields) {
    const val = response[field];
    if (is.string(val)) {
      response[field] = sanitize(val);
    }
  }
  return response;
}
