# 🤗 Hugging Face API Setup (Free Alternative)

## Why Hugging Face?
- ✅ **Completely FREE** for most models
- ✅ **No credit card required**
- ✅ **Open source models** (Llama, Mistral, etc.)
- ✅ **Good performance** for prompt enhancement
- ✅ **Easy setup**

## 📋 Setup Steps

### 1. Get Your Free API Key
1. Go to [Hugging Face](https://huggingface.co/)
2. Sign up for a free account
3. Go to [Settings → Access Tokens](https://huggingface.co/settings/tokens)
4. Click "New token" → Name it "JengaPrompts" → Create
5. Copy your token (starts with `hf_...`)

### 2. Add Environment Variables in Vercel
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add this new variable:
   ```
   HUGGINGFACE_API_KEY = hf_your_token_here
   ```
3. Apply to **Production**, **Preview**, and **Development**

### 3. Deploy Updated Code
1. Push your changes to GitHub
2. Vercel will auto-deploy
3. Or manually redeploy from Vercel dashboard

## 🧪 Test the API

Test your Hugging Face endpoint:
```powershell
Invoke-WebRequest -Uri "https://jenga-prompts-0-1.vercel.app/api/huggingface-stream" -Method Post -Headers @{"Content-Type"="application/json"} -Body '{"userPrompt":"Create a beautiful sunset image","mode":"Image","options":{"contentTone":"Peaceful"}}' -UseBasicParsing
```

## 🔄 Models Available (All Free)

### **Current Model: Mistral-7B-Instruct**
- Good for general text generation
- Fast and reliable
- Free unlimited usage

### **Alternative Models** (if you want to change):
- `microsoft/DialoGPT-large` - Conversational
- `google/flan-t5-large` - Instruction following
- `meta-llama/Llama-2-7b-chat-hf` - Chat optimized

To change models, edit the URL in `api/huggingface-stream.js`:
```javascript
'https://api-inference.huggingface.co/models/YOUR_PREFERRED_MODEL'
```

## 🚀 Benefits Over Gemini
- **No cost** - Completely free
- **No quotas** - Generous rate limits
- **Open source** - Transparent models
- **Privacy** - Your data stays with you
- **Reliability** - Multiple model options

## 🛠️ If You Get Model Loading Errors
Some models might be "loading" when first accessed. If you get a loading error:
1. Wait 30-60 seconds for the model to warm up
2. Or choose a different model from the list above
3. Popular models are usually always ready

## 📊 Performance Comparison
- **Gemini**: Better quality, costs money, requires API key management
- **Hugging Face**: Good quality, completely free, easy setup, open source

For prompt engineering tasks, Hugging Face models work great and you'll likely not notice a quality difference!

## 🔧 Troubleshooting

### Error: "Model is loading"
- Wait 30-60 seconds and try again
- Popular models load faster

### Error: "Invalid API token"
- Double-check your token starts with `hf_`
- Make sure it's added to Vercel environment variables
- Redeploy after adding the variable

### Error: "Rate limit exceeded"
- Free tier has generous limits
- If exceeded, wait a few minutes or upgrade to Pro (still very cheap)

## 🎯 Next Steps
1. Get your free Hugging Face API key
2. Add it to Vercel environment variables
3. Deploy and test
4. Enjoy free, unlimited prompt enhancement!
