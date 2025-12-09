# German Drills 🇩🇪

A beautiful, mobile-optimized web app for learning German vocabulary with spaced repetition.

## Features

- **Noun drills**: Practice articles (der/die/das), singular forms, and plurals
- **Verb drills**: Practice infinitives and conjugations (du form, with full conjugation mode available)
- **Spaced repetition**: Smart algorithm prioritizes words you need to practice
- **Cross-device sync**: Sign in with Google to sync progress across devices
- **Audio pronunciation**: Built-in German text-to-speech
- **Beautiful UI**: Dark theme with color-coded gender indicators (blue/pink/green for der/die/das)
- **Mobile-first**: Optimized for both desktop and mobile use

## How It Works

### Nouns
1. See the word (e.g., "Haus")
2. Type the article → `das` (turns green for neuter, blue for masculine, pink for feminine)
3. Press Space → type the word → `Haus`
4. Comma appears → type the plural → `Häuser`
5. Result displays as: `das Haus, Häuser`
6. Translation and example sentences are revealed (press Tab)

### Verbs
1. See the verb (e.g., "hören")
2. Type the infinitive → `hören`
3. Comma and "du " appear → type only the conjugation → `hörst`
4. Result displays as: `hören, du hörst`
5. Translation and example sentences are revealed (press Tab)

### Keyboard Shortcuts
- **Tab**: Auto-complete current segment
- **Enter/Space**: Proceed to next word (when complete)
- **Backspace**: Fix errors (incorrect characters shown in red)

## Quick Start (Offline Mode)

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test
```

The app works offline without any configuration. Progress will be stored locally.

## Full Setup (with Cloud Sync)

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Note your **Project URL** and **anon public** key from Settings → API

### 2. Set Up the Database

Run this SQL in the Supabase SQL Editor:

```sql
-- Create allowed_users table for access control
CREATE TABLE allowed_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_progress table
CREATE TABLE user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word_id TEXT NOT NULL,
  correct_count INTEGER DEFAULT 0,
  incorrect_count INTEGER DEFAULT 0,
  last_reviewed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  next_review TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ease_factor REAL DEFAULT 2.5,
  interval INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, word_id)
);

-- Enable Row Level Security
ALTER TABLE allowed_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Policies for allowed_users (read-only for authenticated users)
CREATE POLICY "Users can check their own allowlist status" ON allowed_users
  FOR SELECT
  USING (LOWER(email) = LOWER(auth.jwt() ->> 'email'));

-- Policies for user_progress
CREATE POLICY "Users can view their own progress" ON user_progress
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress" ON user_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" ON user_progress
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_next_review ON user_progress(next_review);

-- Add your allowed users (replace with actual emails)
INSERT INTO allowed_users (email) VALUES ('your-email@example.com');
```

### 3. Enable Google Auth

1. In Supabase Dashboard → Authentication → Providers
2. Enable Google provider
3. Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com/apis/credentials):
   - Create a new OAuth 2.0 Client ID
   - Add authorized redirect URI: `https://YOUR-PROJECT-ID.supabase.co/auth/v1/callback`
4. Copy Client ID and Client Secret to Supabase

### 4. Configure Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. Add Allowed Users

To allow a new user to access the app, insert their email into the `allowed_users` table:

```sql
INSERT INTO allowed_users (email) VALUES ('new-user@example.com');
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import to [Vercel](https://vercel.com)
3. Add environment variables in Vercel project settings
4. Deploy!

### Other Platforms

The app uses `@sveltejs/adapter-auto` which automatically adapts to most platforms.

## Tech Stack

- **SvelteKit** - Full-stack framework
- **Svelte 5** - UI framework with runes
- **Supabase** - Auth & database
- **TypeScript** - Type safety
- **Web Speech API** - German pronunciation

## Vocabulary

The app includes 50 starter words:
- **30 nouns** with articles, plurals, and examples
- **20 verbs** with present/past/perfect conjugations and examples

Translations are available in English and Norwegian.

## Contributing

To add new vocabulary, edit `src/lib/data/vocabulary.ts`. Each word needs:

**Nouns:**
```typescript
{
  type: 'noun',
  german: 'Wort',
  gender: 'neuter', // 'masculine' | 'feminine' | 'neuter'
  plural: 'Wörter',
  translations: { en: 'word', no: 'ord' },
  examples: {
    german: 'Das Wort ist wichtig.',
    en: 'The word is important.',
    no: 'Ordet er viktig.'
  }
}
```

**Verbs:**
```typescript
{
  type: 'verb',
  infinitive: 'lernen',
  translations: { en: 'to learn', no: 'å lære' },
  conjugations: {
    präsens: { ich: 'lerne', du: 'lernst', 'er/sie/es': 'lernt', wir: 'lernen', ihr: 'lernt', sie: 'lernen' },
    präteritum: { ich: 'lernte', du: 'lerntest', 'er/sie/es': 'lernte', wir: 'lernten', ihr: 'lerntet', sie: 'lernten' },
    perfekt: { auxiliary: 'haben', partizip: 'gelernt' }
  },
  examples: {
    german: 'Ich lerne Deutsch.',
    en: 'I am learning German.',
    no: 'Jeg lærer tysk.'
  }
}
```

## License

MIT
