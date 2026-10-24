# T-Level Chemistry lesson videos

Pilot topic: **A11.1 Principles of Collision Theory**.

```bash
PYTHONPATH=scripts python3 scripts/tlevel_chem/produce.py --slug a11-1-collision-theory
PYTHONPATH=scripts python3 scripts/tlevel_chem/worksheets.py
PYTHONPATH=scripts python3 scripts/tlevel_chem/covers.py
node scripts/publish-tlevel-a11-1.mjs
npm run seo:build
```

Teacher marking schemes stay in `content/tlevel-chemistry/private/` and are gitignored. Do not add them to the public catalog.
