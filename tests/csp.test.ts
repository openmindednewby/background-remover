import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { cspFromNginx } from '../scripts/csp';

const directives = (csp: string): Map<string, string[]> =>
  new Map(csp.split(';').map((d) => d.trim().split(/\s+/)).filter((d) => d[0] !== '').map(([name, ...values]): [string, string[]] => [name, values]));

describe('cspFromNginx', () => {
  it('with a set $csp line, returns the policy text', () => {
    const conf = 'server {\n    set $csp "default-src \'self\'; connect-src \'self\'";\n}';

    const csp = cspFromNginx(conf);

    expect(csp).toBe("default-src 'self'; connect-src 'self'");
  });

  it('with no set $csp line, throws', () => {
    const conf = 'server { listen 80; }';

    const read = (): string => cspFromNginx(conf);

    expect(read).toThrow('no `set $csp');
  });

  it('with the shipped nginx.conf, lets the page connect only to its own origin and Umami', () => {
    const conf = readFileSync(new URL('../nginx.conf', import.meta.url), 'utf8');

    const policy = directives(cspFromNginx(conf));

    expect(policy.get('connect-src')).toEqual(["'self'", 'https://analytics.dloizides.com']);
  });

  it('with the shipped nginx.conf, sends the policy from every location', () => {
    const conf = readFileSync(new URL('../nginx.conf', import.meta.url), 'utf8');

    const locations = conf.split(/\n\s*location /).slice(1);

    expect(locations.filter((l) => !l.includes('add_header Content-Security-Policy $csp always;'))).toEqual([]);
  });
});
