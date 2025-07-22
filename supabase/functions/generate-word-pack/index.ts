import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { theme, difficulty = 'medium', count = 5 } = await req.json()
    
    if (!theme) {
      return new Response(
        JSON.stringify({ error: 'Theme is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Call Gemini API to generate word pairs
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({ error: 'Gemini API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const prompt = `Generate ${count} word pairs for a word deduction game with theme "${theme}" and difficulty "${difficulty}". 
    Each pair should have two related but distinct words where one is for civilians and one for undercover agents.
    The words should be similar enough that clues could apply to both, but different enough to create interesting gameplay.
    
    Return only a JSON object in this exact format:
    {
      "pairs": [
        {"civilian": "word1", "undercover": "word2"},
        {"civilian": "word3", "undercover": "word4"}
      ]
    }
    
    Make sure words are appropriate for all audiences and avoid offensive content.`

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      }
    )

    if (!geminiResponse.ok) {
      throw new Error('Failed to generate content from Gemini')
    }

    const geminiData = await geminiResponse.json()
    const generatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text

    if (!generatedText) {
      throw new Error('No content generated')
    }

    // Parse the JSON response from Gemini
    let wordPairs
    try {
      // Extract JSON from the response (Gemini might include extra text)
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        wordPairs = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No valid JSON found in response')
      }
    } catch (parseError) {
      throw new Error('Failed to parse generated content')
    }

    // Validate the structure
    if (!wordPairs.pairs || !Array.isArray(wordPairs.pairs)) {
      throw new Error('Invalid word pairs structure')
    }

    // Create the word pack object
    const wordPack = {
      title: `AI Generated: ${theme}`,
      description: `AI-generated word pack with ${theme} theme (${difficulty} difficulty)`,
      type: 'ai',
      content: wordPairs,
      language: 'en',
      difficulty: difficulty,
      is_public: false
    }

    return new Response(
      JSON.stringify({ wordPack }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error generating word pack:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to generate word pack' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})