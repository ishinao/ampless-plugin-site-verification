import {
    definePlugin,
    type AmplessPlugin,
    type PublicHeadDescriptor,
} from 'ampless'

export interface SiteVerificationOptions {
    instanceId?: string
}

interface VerificationEntry {
    /** Value of `<meta name="...">`. */
    metaName: string
    /** Storage key for the admin setting (PLUGIN_KEY_PATTERN compliant). */
    fieldKey: string
    /** Human-readable provider label. */
    label: string
}

// Common search-engine verification providers. Add or remove entries
// here to match the providers you need; the admin UI updates
// automatically from this list.
const ENTRIES: readonly VerificationEntry[] = [
    { metaName: 'google-site-verification', fieldKey: 'google', label: 'Google Search Console' },
    { metaName: 'msvalidate.01', fieldKey: 'bing', label: 'Bing Webmaster' },
    { metaName: 'p:domain_verify', fieldKey: 'pinterest', label: 'Pinterest' },
    { metaName: 'yandex-verification', fieldKey: 'yandex', label: 'Yandex Webmaster' },
    { metaName: 'baidu-site-verification', fieldKey: 'baidu', label: 'Baidu Webmaster' },
]

export default function siteVerificationPlugin(
    options: SiteVerificationOptions = {}
): AmplessPlugin {
    const instanceId = options.instanceId ?? 'site-verification'

    return definePlugin({
        name: 'site-verification',
        packageName: '@ishinao/ampless-plugin-site-verification',
        instanceId,
        apiVersion: 1,
        trust_level: 'untrusted',
        displayName: { en: 'Site verification', ja: 'サイト所有権確認' },
        capabilities: ['publicHead', 'adminSettings'],
        settings: {
            public: ENTRIES.map((e) => ({
                type: 'text' as const,
                key: e.fieldKey,
                label: { en: e.label, ja: e.label },
                description: {
                    en: `Content value for <meta name="${e.metaName}">. Leave empty to skip.`,
                    ja: `<meta name="${e.metaName}"> の content 値。空欄で省略。`,
                },
                default: '',
            })),
        },
        publicHead(ctx) {
            const out: PublicHeadDescriptor[] = []
            for (const e of ENTRIES) {
                const value = (ctx.setting<string>(e.fieldKey) ?? '').trim()
                if (!value) continue
                out.push({
                    type: 'meta',
                    name: e.metaName,
                    content: value,
                })
            }
            return out
        },
    })
}