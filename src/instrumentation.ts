export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    if (!process.env.GROQ_API_KEY) {
      console.warn(
        '\x1b[33m%s\x1b[0m',
        '⚠️ [ShopCalci Startup Warning]: GROQ_API_KEY is not configured in server environment (.env.local). The Groq AI Product Assistant feature will be unavailable until a key from https://console.groq.com is set.'
      );
    } else {
      console.log(
        '\x1b[32m%s\x1b[0m',
        '✅ [ShopCalci Startup]: GROQ_API_KEY is configured and ready for Groq AI Product Assistant.'
      );
    }
  }
}
