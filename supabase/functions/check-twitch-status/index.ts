import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TWITCH_CLIENT_ID = Deno.env.get('TWITCH_CLIENT_ID');
const TWITCH_CLIENT_SECRET = Deno.env.get('TWITCH_CLIENT_SECRET');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface TwitchTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface TwitchStreamData {
  id: string;
  user_id: string;
  user_login: string;
  user_name: string;
  game_id: string;
  game_name: string;
  type: string;
  title: string;
  viewer_count: number;
  started_at: string;
  language: string;
  thumbnail_url: string;
}

interface TwitchStreamsResponse {
  data: TwitchStreamData[];
}

async function getTwitchAccessToken(): Promise<string> {
  console.log('Getting Twitch access token...');
  
  const response = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: TWITCH_CLIENT_ID!,
      client_secret: TWITCH_CLIENT_SECRET!,
      grant_type: 'client_credentials',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Failed to get Twitch token:', error);
    throw new Error(`Failed to get Twitch access token: ${error}`);
  }

  const data: TwitchTokenResponse = await response.json();
  console.log('Successfully got Twitch access token');
  return data.access_token;
}

async function checkTwitchStream(username: string, accessToken: string): Promise<TwitchStreamData | null> {
  console.log(`Checking Twitch stream for: ${username}`);
  
  const response = await fetch(
    `https://api.twitch.tv/helix/streams?user_login=${username}`,
    {
      headers: {
        'Client-ID': TWITCH_CLIENT_ID!,
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error(`Failed to check stream for ${username}:`, error);
    throw new Error(`Failed to check Twitch stream: ${error}`);
  }

  const data: TwitchStreamsResponse = await response.json();
  console.log(`Stream data for ${username}:`, data);
  
  return data.data.length > 0 ? data.data[0] : null;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Check Twitch status function called');
    
    if (!TWITCH_CLIENT_ID || !TWITCH_CLIENT_SECRET) {
      throw new Error('Twitch credentials not configured');
    }

    const { streamUrl } = await req.json();
    console.log('Stream URL:', streamUrl);

    if (!streamUrl || !streamUrl.includes('twitch.tv')) {
      return new Response(
        JSON.stringify({ isLive: false, error: 'Invalid Twitch URL' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract username from URL
    const username = streamUrl.split('/').pop()?.toLowerCase() || '';
    console.log('Extracted username:', username);

    if (!username) {
      return new Response(
        JSON.stringify({ isLive: false, error: 'Could not extract username' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get Twitch access token
    const accessToken = await getTwitchAccessToken();

    // Check if stream is live
    const streamData = await checkTwitchStream(username, accessToken);

    const response = {
      isLive: streamData !== null,
      streamData: streamData ? {
        title: streamData.title,
        viewerCount: streamData.viewer_count,
        gameName: streamData.game_name,
        thumbnailUrl: streamData.thumbnail_url,
        startedAt: streamData.started_at,
      } : null,
    };

    console.log('Response:', response);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error in check-twitch-status:', error);
    return new Response(
      JSON.stringify({ isLive: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
