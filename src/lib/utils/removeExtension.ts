export function removeExtension(name: string) {
  return name.substring(0, name.lastIndexOf('.')) || name;
}
