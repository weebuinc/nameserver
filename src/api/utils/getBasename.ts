import { basename } from 'path';
import { removeExtension } from 'lib/utils';
export function getBasename(name: string) {
  return removeExtension(basename(name));
}
