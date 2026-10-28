const en = {
  'drop.text': 'Drop a photo here',
  'drop.label': 'Drop a photo here or choose one',
  'compare': 'Compare original and cut-out',
  'status.cutting': 'Removing background…',
  'status.done': 'Background removed in {{p1}} s',
  'status.failed': 'Could not remove the background: {{p1}}',
  'status.unsupported': 'That file is not a JPG, PNG or WebP photo.',
} as const;

export type MessageKey = keyof typeof en;

/** Formats a message, replacing {{p1}}, {{p2}} with the given values. */
export function FM(key: MessageKey, ...params: string[]): string {
  return params.reduce<string>((text, value, i) => text.replace(`{{p${i + 1}}}`, value), en[key]);
}
