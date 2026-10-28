const CSP_LINE = /^\s*set \$csp "([^"]+)";/m;

/** Reads the Content-Security-Policy that nginx.conf sends, so the preview server sends the same one. */
export function cspFromNginx(conf: string): string {
  const match = CSP_LINE.exec(conf);
  if (match === null) throw new Error('nginx.conf has no `set $csp "...";` line');
  return match[1];
}
