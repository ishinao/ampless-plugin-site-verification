# @ishinao/ampless-plugin-site-verification

> [Pre-release / beta] Search engine site verification meta tags for [ampless](https://github.com/heavymoons/ampless).

## What it does

Adds search-engine ownership-verification `<meta>` tags to your site's `<head>`, configurable from `/admin/plugins`. Supports Google Search Console, Bing Webmaster, Pinterest, Yandex Webmaster, and Baidu Webmaster.

## Install

```bash
npm install @ishinao/ampless-plugin-site-verification
```

## Configure

```typescript
// cms.config.ts
import { defineConfig } from 'ampless'
import siteVerificationPlugin from '@ishinao/ampless-plugin-site-verification'

export default defineConfig({
  // ...
  plugins: [
    siteVerificationPlugin(),
  ],
})