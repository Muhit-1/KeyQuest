import { createClient } from '@supabase/supabase-js'
import { validatePlayerName, checkRateLimit, sanitizeText } from './security'

// Environment variables with validation
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

// Validate environment configuration
const hasSupabaseCredentials = supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'YOUR_SUPABASE_URL' && 
  supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY' &&
  supabaseUrl !== 'https://your-project-id.supabase.co' &&
  supabaseAnonKey !== 'your_supabase_anon_key_here'

// Supabase client configuration with security options
const supabaseOptions = {
  auth: {
    persistSession: false, // Don't persist sessions for this game
    autoRefreshToken: false,
    detectSessionInUrl: false
  },
  global: {
    headers: {
      'X-Client-Info': 'keyquest-game'
    }
  }
}

// Create Supabase client only if credentials are available
export const supabase = hasSupabaseCredentials 
  ? createClient(supabaseUrl, supabaseAnonKey, supabaseOptions)
  : null

// Secure logging (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log('Supabase configuration:');
  console.log('URL configured:', !!supabaseUrl);
  console.log('Key configured:', !!supabaseAnonKey);
  console.log('Client created:', !!supabase);
}

// Leaderboard functions with security validation
export const saveScore = async (name, score) => {
  // Rate limiting check
  if (!checkRateLimit('save_score', 5, 60000)) { // 5 requests per minute
    return { success: false, error: 'Too many requests. Please wait before submitting again.' }
  }

  // Input validation
  const nameValidation = validatePlayerName(name)
  if (!nameValidation.isValid) {
    return { success: false, error: nameValidation.error }
  }

  // Score validation
  if (typeof score !== 'number' || score < 0 || score > 10000 || !Number.isInteger(score)) {
    return { success: false, error: 'Invalid score value' }
  }

  if (!supabase) {
    console.warn('Supabase not configured - score not saved')
    return { success: false, error: 'Leaderboard service unavailable. Please try again later.' }
  }

  try {
    const sanitizedName = nameValidation.sanitized
    const timestamp = new Date().toISOString()
    
    const { data, error } = await supabase
      .from('leaderboard')
      .insert([
        { 
          name: sanitizedName, 
          score: score,
          time: timestamp
        }
      ])
      .select()

    if (error) {
      console.error('Database error:', error.message)
      return { success: false, error: 'Failed to save score. Please try again.' }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Network error:', error.message)
    return { success: false, error: 'Network error. Please check your connection and try again.' }
  }
}

export const getTopScores = async (limit = 10) => {
  if (!supabase) {
    console.warn('Supabase not configured - returning mock data')
    // Return mock data for development
    return { 
      success: true, 
      data: [
        { id: 1, name: 'Demo Player', score: 50, time: new Date().toISOString() },
        { id: 2, name: 'Test User', score: 40, time: new Date().toISOString() },
        { id: 3, name: 'Sample Player', score: 30, time: new Date().toISOString() }
      ]
    }
  }

  try {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .order('score', { ascending: false })
      .order('time', { ascending: true })
      .limit(limit)

    if (error) {
      console.error('Error fetching scores:', error)
      return { success: false, error: error.message, data: [] }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Error fetching scores:', error)
    return { success: false, error: error.message, data: [] }
  }
}

export const getPlayerHighScore = async (playerName) => {
  // Input validation
  const nameValidation = validatePlayerName(playerName)
  if (!nameValidation.isValid) {
    console.warn('Invalid player name for high score lookup')
    return 0
  }

  if (!supabase) {
    console.warn('Supabase not configured - returning 0 for high score')
    return 0
  }

  try {
    const sanitizedName = nameValidation.sanitized
    
    const { data, error } = await supabase
      .from('leaderboard')
      .select('score')
      .eq('name', sanitizedName)
      .order('score', { ascending: false })
      .limit(1)

    if (error) {
      console.error('Database error fetching high score:', error.message)
      return 0
    }

    return data && data.length > 0 ? data[0].score : 0
  } catch (error) {
    console.error('Network error fetching high score:', error.message)
    return 0
  }
}
