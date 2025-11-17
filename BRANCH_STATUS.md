# Branch Status

## ✅ Active Branches

- **main** - Production-ready code with all fixes

## ⚠️ DO NOT MERGE - Deprecated Branches

These branches are kept for reference but should NOT be merged:

- **claude/production-deployment-0123m8QxR7cBKvo5Zq11D4H9** - Duplicate of fix-vercel-pipeline (same fixes, different history)
- **claude/review-court-case-01DyBG1NYsxVgtd6tWwrnjX3** - Old session, outdated
- **claude/court-case-packet-demo-01JyxvA6WyKdhbBSddQSZjB3** - Demo/analysis only, not deployment code
- **claude/modal-deployment-01JyxvA6WyKdhbBSddQSZjB3** - Old session, missing critical fixes
- **claude/deploy-court-case-packet-01AAYcNnkmyAeG7Yb2kSsL3Z** - Old session, outdated
- **claude/build-casepack-app-019jM835d2S1u4k2BZp9J13G** - Old session, outdated

## 📝 Merged Successfully

- **claude/fix-vercel-pipeline-0123m8QxR7cBKvo5Zq11D4H9** - Merged to main (PR #3)
  - Contains all deployment fixes:
    - Backend: asyncpg sslmode fix
    - Backend: SQLAlchemy Enum fix
    - Backend: Modal max_containers fix
    - Workflows: production-deployment.yml (no migrations)
    - Workflows: database-migration.yml (standalone)

## 🗑️ Recommended Action

**Delete deprecated branches** to keep repository clean:
```bash
git push origin --delete \
  claude/production-deployment-0123m8QxR7cBKvo5Zq11D4H9 \
  claude/review-court-case-01DyBG1NYsxVgtd6tWwrnjX3 \
  claude/court-case-packet-demo-01JyxvA6WyKdhbBSddQSZjB3 \
  claude/modal-deployment-01JyxvA6WyKdhbBSddQSZjB3 \
  claude/deploy-court-case-packet-01AAYcNnkmyAeG7Yb2kSsL3Z \
  claude/build-casepack-app-019jM835d2S1u4k2BZp9J13G
```

---

**Last Updated:** 2025-11-16
