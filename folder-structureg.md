# Folder Structure

```
revoice/
├── app
│   ├── (app)
│   │   ├── customers
│   │   │   └── page.tsx
│   │   ├── dashboard
│   │   │   └── page.tsx
│   │   ├── orders
│   │   │   ├── new
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── products
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── api
│   │   ├── customers
│   │   │   └── route.ts
│   │   ├── dashboard
│   │   │   └── stats
│   │   │       └── route.ts
│   │   ├── order-items
│   │   │   └── route.ts
│   │   ├── orders
│   │   │   └── route.ts
│   │   └── products
│   │       └── route.ts
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   └── providers.tsx
├── components
│   ├── ui
│   │   ├── alert.tsx
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── chart.tsx
│   │   ├── customer-preview-dialog.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── order-preview-dialog.tsx
│   │   ├── product-preview-dialog.tsx
│   │   ├── scroll-area.tsx
│   │   ├── select.tsx
│   │   ├── separator.tsx
│   │   ├── sonner.tsx
│   │   ├── table.tsx
│   │   └── tabs.tsx
│   └── email-template.tsx
├── dist
│   └── electron
│       ├── main.d.ts
│       ├── main.d.ts.map
│       ├── main.js
│       ├── main.js.map
│       ├── preload.d.ts
│       ├── preload.d.ts.map
│       ├── preload.js
│       └── preload.js.map
├── dist_electron
│   ├── win-unpacked
│   │   ├── locales
│   │   │   ├── af.pak
│   │   │   ├── am.pak
│   │   │   ├── ar.pak
│   │   │   ├── bg.pak
│   │   │   ├── bn.pak
│   │   │   ├── ca.pak
│   │   │   ├── cs.pak
│   │   │   ├── da.pak
│   │   │   ├── de.pak
│   │   │   ├── el.pak
│   │   │   ├── en-GB.pak
│   │   │   ├── en-US.pak
│   │   │   ├── es-419.pak
│   │   │   ├── es.pak
│   │   │   ├── et.pak
│   │   │   ├── fa.pak
│   │   │   ├── fi.pak
│   │   │   ├── fil.pak
│   │   │   ├── fr.pak
│   │   │   ├── gu.pak
│   │   │   ├── he.pak
│   │   │   ├── hi.pak
│   │   │   ├── hr.pak
│   │   │   ├── hu.pak
│   │   │   ├── id.pak
│   │   │   ├── it.pak
│   │   │   ├── ja.pak
│   │   │   ├── kn.pak
│   │   │   ├── ko.pak
│   │   │   ├── lt.pak
│   │   │   ├── lv.pak
│   │   │   ├── ml.pak
│   │   │   ├── mr.pak
│   │   │   ├── ms.pak
│   │   │   ├── nb.pak
│   │   │   ├── nl.pak
│   │   │   ├── pl.pak
│   │   │   ├── pt-BR.pak
│   │   │   ├── pt-PT.pak
│   │   │   ├── ro.pak
│   │   │   ├── ru.pak
│   │   │   ├── sk.pak
│   │   │   ├── sl.pak
│   │   │   ├── sr.pak
│   │   │   ├── sv.pak
│   │   │   ├── sw.pak
│   │   │   ├── ta.pak
│   │   │   ├── te.pak
│   │   │   ├── th.pak
│   │   │   ├── tr.pak
│   │   │   ├── uk.pak
│   │   │   ├── ur.pak
│   │   │   ├── vi.pak
│   │   │   ├── zh-CN.pak
│   │   │   └── zh-TW.pak
│   │   ├── resources
│   │   │   ├── app.asar.unpacked
│   │   │   ├── prisma
│   │   │   │   └── dev.db
│   │   │   ├── app-update.yml
│   │   │   ├── app.asar
│   │   │   └── elevate.exe
│   │   ├── chrome_100_percent.pak
│   │   ├── chrome_200_percent.pak
│   │   ├── d3dcompiler_47.dll
│   │   ├── dxcompiler.dll
│   │   ├── dxil.dll
│   │   ├── ffmpeg.dll
│   │   ├── icudtl.dat
│   │   ├── libEGL.dll
│   │   ├── libGLESv2.dll
│   │   ├── LICENSE.electron.txt
│   │   ├── LICENSES.chromium.html
│   │   ├── resources.pak
│   │   ├── Revoice.exe
│   │   ├── snapshot_blob.bin
│   │   ├── v8_context_snapshot.bin
│   │   ├── vk_swiftshader_icd.json
│   │   ├── vk_swiftshader.dll
│   │   └── vulkan-1.dll
│   ├── builder-debug.yml
│   ├── builder-effective-config.yaml
│   ├── filelist.txt
│   ├── latest.yml
│   ├── Revoice-Setup-0.1.0.exe
│   └── Revoice-Setup-0.1.0.exe.blockmap
├── electron
│   ├── main.ts
│   ├── preload.ts
│   └── tsconfig.json
├── generated
│   └── prisma
│       ├── internal
│       │   ├── class.ts
│       │   ├── prismaNamespace.ts
│       │   └── prismaNamespaceBrowser.ts
│       ├── models
│       │   ├── Account.ts
│       │   ├── Customer.ts
│       │   ├── Order.ts
│       │   ├── OrderItem.ts
│       │   ├── Product.ts
│       │   ├── RateLimit.ts
│       │   ├── Session.ts
│       │   ├── SyncLog.ts
│       │   ├── User.ts
│       │   └── Verification.ts
│       ├── browser.ts
│       ├── client.ts
│       ├── commonInputTypes.ts
│       ├── enums.ts
│       └── models.ts
├── lib
│   ├── audit-logger.ts
│   ├── email.ts
│   ├── hooks.ts
│   ├── password-validation.ts
│   ├── prisma.ts
│   └── utils.ts
├── prisma
│   ├── dev.db
│   ├── schema.prisma
│   └── seed.ts
├── public
│   └── fonts
│       ├── IntelOneMono-VariableFont_wght.ttf
│       └── Inter-VariableFont_opsz,wght.ttf
├── utils
│   └── supabase-client.ts
├── biome.json
├── components.json
├── exported_structure.markdown
├── folder-structure.md
├── next-env.d.ts
├── next.config.ts
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── postcss.config.mjs
├── prisma.config.ts
├── README.md
├── skills-lock.json
├── structure_2026-05-14T12-58-03-192Z.txt
└── tsconfig.json
```
