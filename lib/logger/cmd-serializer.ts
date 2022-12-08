import { sanitize } from '../util/sanitize';

// istanbul ignore next
export default function cmdSerializer(
  cmd: string | string[]
): string | string[] {
  if (typeof cmd === 'string') {
    return sanitize(cmd);
  }
  return cmd;
}
