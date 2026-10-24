# Vendored libraries

Outside code the site needs is copied here at one exact version, so pages never
load scripts from another server. A compromised CDN or a bad package release
can't reach staff sessions this way.

## supabase-js-2.117.3.js

`@supabase/supabase-js` 2.117.3 (MIT), bundled into a single ES module that
exports `createClient`. Imported only by `shared/js/supabase.js`.

To upgrade, pick a release at least two weeks old, then in a scratch folder
outside the repo:

```
npm init -y
npm install --ignore-scripts @supabase/supabase-js@<version> esbuild@0.25.10
echo 'export { createClient } from "@supabase/supabase-js";' > entry.js
npx esbuild entry.js --bundle --format=esm --platform=browser --target=es2020 --minify --legal-comments=eof --outfile=out.js
```

Copy `out.js` here as `supabase-js-<version>.js` with the same three-line
header, update the import in `shared/js/supabase.js`, delete the old file, and
test sign-in on preview before shipping to live.
