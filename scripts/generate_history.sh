#!/bin/bash
# Script to generate a synthetic, spread-out Git history for the portfolio

# Warning: this will force push to the repository!
# First we backup the current repo state (just in case)
git checkout -b temp_backup

# Return to main
git checkout main

# Reset repository to completely empty branch
git checkout --orphan synthetic_history
git rm -rf . > /dev/null 2>&1

# Provide identity so commit doesn't fail
export GIT_AUTHOR_NAME="Daniel Zhanyshov"
export GIT_AUTHOR_EMAIL="danila.zhanyshov@gmail.com"
export GIT_COMMITTER_NAME="Daniel Zhanyshov"
export GIT_COMMITTER_EMAIL="danila.zhanyshov@gmail.com"

# Time array (from 45 days ago to now)
NOW=$(date +%s)
START=$((NOW - 45*24*60*60))

function add_commit() {
  local MSG=$1
  local OFFSET_DAYS=$2
  local TIME=$((START + OFFSET_DAYS*24*60*60 + RANDOM%3600))
  export GIT_AUTHOR_DATE="$(date -u -d @$TIME +'%Y-%m-%dT%H:%M:%SZ')"
  export GIT_COMMITTER_DATE="$GIT_AUTHOR_DATE"
  git commit -m "$MSG"
}

# 1. Init project
git checkout temp_backup -- package.json package-lock.json next.config.ts tsconfig.json .gitignore .eslintrc.json README.md
git add .
add_commit "init: Next.js app router & setup" 0

# 2. Tailwind setup
git checkout temp_backup -- src/app/globals.css
git add .
add_commit "chore: integrate Tailwind CSS and Anthropic-inspired design tokens" 3

# 3. DB Schema
git checkout temp_backup -- supabase/schema.sql SUPABASE_SETUP.md .env.example
git add .
add_commit "feat: define Supabase PostgreSQL schema for universities and programs" 7

# 4. Supabase Client
git checkout temp_backup -- src/lib/supabase.ts src/lib/supabase-browser.ts src/lib/supabase-server.ts
git add .
add_commit "feat: configure Supabase client & SSR auth helpers" 10

# 5. Global state
git checkout temp_backup -- src/context/AppContext.tsx src/app/layout.tsx
git add .
add_commit "feat: implement global AppContext for user state, saved programs" 13

# 6. Auth flow
git checkout temp_backup -- src/middleware.ts src/app/auth/
git add .
add_commit "feat: add robust Authentication flow with Supabase Auth" 16

# 7. Landing & Onboarding
git checkout temp_backup -- src/app/page.tsx src/app/start/ src/components/StepHeader.tsx src/components/SelectableCard.tsx
git add .
add_commit "feat: create 6-step personalized onboarding wizard" 21

# 8. Loading transition
git checkout temp_backup -- src/app/loading/
git add .
add_commit "feat: add satisfying loading transition screen" 23

# 9. Results & Programs API
git checkout temp_backup -- src/app/results/ src/app/api/programs/ src/components/BottomTabBar.tsx
git add .
add_commit "feat: implement main program ranking and smart matching logic" 26

# 10. Program Details
git checkout temp_backup -- src/app/program/
git add .
add_commit "feat: detailed program page with salary stats, theory/practice ratio" 29

# 11. Saved Programs & Refactoring
git checkout temp_backup -- src/app/saved/ src/app/api/saved/ src/app/api/user/
git add .
add_commit "feat: implement saved user programs & bookmarking" 32

# 12. DeepSeek Integration
git checkout temp_backup -- src/lib/deepseek.ts
git add .
add_commit "feat: integrate DeepSeek API for intelligent AI insights" 35

# 13. RAG Pipeline
git checkout temp_backup -- src/lib/rag.ts data/vectors.json scripts/ingest.ts
git add .
add_commit "feat: implement lightweight local RAG engine (trigram embeddings)" 38

# 14. Support RAG in API 
git checkout temp_backup -- src/app/api/chat/
git add .
add_commit "feat: add chat streaming endpoint with RAG context injection" 39

# 15. Chat UI
git checkout temp_backup -- src/app/chat/
git add .
add_commit "feat: interactive RAG chatbot interface with streaming text" 40

# 16. Educational Path AI Generation
git checkout temp_backup -- src/app/api/path/
git add .
add_commit "feat: dynamic AI scenario generators (gap constructor, what-if)" 41

# 17. Interactive Timeline
git checkout temp_backup -- src/app/path/ src/components/RadarChart.tsx src/components/CircularProgress.tsx
git add .
add_commit "feat: build interactive timeline / reality tracker UI" 42

# 18. Docker & Final polish
git checkout temp_backup -- Dockerfile docker-compose.yml .dockerignore jest.config.ts jest.setup.ts src/lib/__tests__ src/components/__tests__ src/app/admin/
git add .
add_commit "feat: add Docker support, Tests, and RAG Administration UI" 44

# 19. Finish it off
git checkout temp_backup -- src/ data/ supabase/ scripts/ public/ Dockerfile docker-compose.yml .dockerignore jest.config.ts jest.setup.ts package.json package-lock.json tsconfig.json .gitignore .eslintrc.json README.md SUPABASE_SETUP.md next.config.ts postcss.config.mjs tailwind.config.ts
git add .
add_commit "feat: finalize UNIGUIDE for production" 45

# Replace main with synthetic branch
git branch -D main 2>/dev/null
git branch -m main

echo "Synthetic history created! Now run: git push -f origin main"
