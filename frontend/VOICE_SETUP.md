# Voice Setup Guide

Your app now supports high-quality AI voices! Here's how to set them up:

## 🎙️ Current Status
- ✅ **Browser Voice**: Working (current fallback)
- ⚪ **ElevenLabs**: Ready to configure (best quality)
- ⚪ **OpenAI TTS**: Ready to configure (good quality)

## 🔧 Setup Instructions

### Option 1: ElevenLabs (Recommended - Best Quality)

1. **Get an API key:**
   - Go to https://elevenlabs.io
   - Sign up for an account (free tier available)
   - Go to your profile and copy your API key

2. **Configure:**
   - Open `/frontend/config/voice.ts`
   - Replace `YOUR_ELEVENLABS_API_KEY` with your actual API key
   - Set `enabled: true` in the elevenlabs config

3. **Choose a voice:**
   - Default: `EXAVITQu4vr4xnSDxMaL` (Bella - friendly female)
   - Other options in the config file
   - Or browse voices on ElevenLabs website

### Option 2: OpenAI Text-to-Speech

1. **Get an API key:**
   - Go to https://platform.openai.com
   - Create an account and get an API key
   - Add billing information (pay-per-use)

2. **Configure:**
   - Open `/frontend/config/voice.ts`
   - Replace `YOUR_OPENAI_API_KEY` with your actual API key
   - Set `enabled: true` in the openai config

3. **Choose a voice:**
   - Options: `alloy`, `echo`, `fable`, `onyx`, `nova`, `shimmer`
   - Change the `voice` field in the config

## 💰 Pricing (Approximate)

- **ElevenLabs**: Free tier includes 10,000 characters/month, then ~$5/month
- **OpenAI TTS**: ~$15 per 1M characters (~$0.000015 per character)
- **Browser Voice**: Completely free (but lower quality)

## 🔒 Security Note

For production, use environment variables:
- `REACT_APP_ELEVENLABS_API_KEY`
- `REACT_APP_OPENAI_API_KEY`

Add these to your `.env` file (not committed to git).

## 🎯 How It Works

The app tries voices in this order:
1. ElevenLabs (if enabled)
2. OpenAI (if enabled)  
3. Browser voice (fallback)

This ensures the best possible voice while maintaining reliability!