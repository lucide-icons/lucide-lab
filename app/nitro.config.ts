//https://nitro.unjs.io/config
export default defineNitroConfig({
  preset: 'vercel_edge',
  srcDir: "src",
  routeRules: {
    '/api/**': { cors: false },
  },
  compatibilityDate: "2025-02-26",
});
