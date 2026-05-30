import { describe, it, expect } from 'vitest'
import siteVerificationPlugin from './index.js'

describe('siteVerificationPlugin', () => {
    it('returns a plugin with publicHead + adminSettings capabilities', () => {
        const p = siteVerificationPlugin()
        expect(p.apiVersion).toBe(1)
        expect(p.name).toBe('site-verification')
        expect(p.trust_level).toBe('untrusted')
        expect(p.capabilities).toEqual(
            expect.arrayContaining(['publicHead', 'adminSettings'])
        )
    })

    it('exposes 5 settings.public fields', () => {
        const p = siteVerificationPlugin()
        const fields = p.settings?.public ?? []
        expect(fields.map((f) => f.key)).toEqual([
            'google',
            'bing',
            'pinterest',
            'yandex',
            'baidu',
        ])
    })

    it('publicHead returns no descriptors when all settings are empty', () => {
        const p = siteVerificationPlugin()
        const descriptors = p.publicHead?.({
            site: { name: 'Test', url: 'https://example.com' },
            setting: () => undefined,
        }) ?? []
        expect(descriptors).toHaveLength(0)
    })

    it('publicHead emits meta descriptor for set values', () => {
        const p = siteVerificationPlugin()
        const stored: Record<string, string> = { google: 'abc123' }
        const descriptors = p.publicHead?.({
            site: { name: 'Test', url: 'https://example.com' },
            setting: <T = unknown>(k: string) => stored[k] as T | undefined,
        }) ?? []
        expect(descriptors).toHaveLength(1)
        const d = descriptors[0]
        expect(d.type).toBe('meta')
        if (d.type === 'meta') {
            expect(d.name).toBe('google-site-verification')
            expect(d.content).toBe('abc123')
        }
    })
})