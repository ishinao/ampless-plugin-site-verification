import { describe, it, expect } from 'vitest'
import type {
    PublicHeadDescriptor,
    PluginPublicRenderContext,
    AmplessPlugin,
} from 'ampless'
import { resolvePluginSettings } from 'ampless'
import siteVerificationPlugin from './index.js'

const site: PluginPublicRenderContext['site'] = {
    name: 'Test',
    url: 'https://example.com/',
    description: 'A test',
}

// Mirrors the canonical reference-plugin test harness (GA4 / Plausible):
// resolve the stored values through the real Phase 2 settings resolver so
// the test exercises manifest-default merging + validation, then build the
// public render context the same way the runtime does.
function callPublicHead(
    plugin: AmplessPlugin,
    stored: Record<string, unknown> = {}
): readonly PublicHeadDescriptor[] {
    const resolved = resolvePluginSettings(plugin.settings, stored)
    const ctx: PluginPublicRenderContext = {
        site,
        setting<T = unknown>(key: string): T | undefined {
            const v = resolved[key]
            return v === undefined ? undefined : (v as T)
        },
    }
    return plugin.publicHead?.(ctx) ?? []
}

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

    it('defaults instanceId to the plugin name and honours an override', () => {
        expect(siteVerificationPlugin().instanceId).toBe('site-verification')
        expect(
            siteVerificationPlugin({ instanceId: 'sv-2' }).instanceId
        ).toBe('sv-2')
    })

    it('exposes 5 settings.public text fields', () => {
        const p = siteVerificationPlugin()
        const fields = p.settings?.public ?? []
        expect(fields.map((f) => f.key)).toEqual([
            'google',
            'bing',
            'pinterest',
            'yandex',
            'baidu',
        ])
        expect(fields.every((f) => f.type === 'text')).toBe(true)
    })

    it('publicHead returns no descriptors when all settings are empty', () => {
        const p = siteVerificationPlugin()
        expect(callPublicHead(p)).toEqual([])
    })

    it('publicHead emits a meta descriptor for each set value', () => {
        const p = siteVerificationPlugin()
        const head = callPublicHead(p, { google: 'abc123', bing: 'xyz789' })
        expect(head).toHaveLength(2)
        const google = head.find(
            (d): d is Extract<PublicHeadDescriptor, { type: 'meta' }> =>
                d.type === 'meta' && d.name === 'google-site-verification'
        )
        expect(google?.content).toBe('abc123')
        const bing = head.find(
            (d): d is Extract<PublicHeadDescriptor, { type: 'meta' }> =>
                d.type === 'meta' && d.name === 'msvalidate.01'
        )
        expect(bing?.content).toBe('xyz789')
    })

    it('publicHead trims whitespace and skips blank values', () => {
        const p = siteVerificationPlugin()
        const head = callPublicHead(p, { google: '  abc123  ', yandex: '   ' })
        expect(head).toHaveLength(1)
        const [d] = head as [PublicHeadDescriptor]
        if (d.type === 'meta') {
            expect(d.name).toBe('google-site-verification')
            expect(d.content).toBe('abc123')
        }
    })
})
