import { app } from './app.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`âœ¨ EventPilot Backend running on port ${PORT}`);
  console.log(`ðŸŒ API Base URL: http://localhost:${PORT}/api`);
  console.log(`ðŸ›¡ï¸  Security: Helmet Enabled | Rate Limiting Active | CORS Restricted | XSS Sanitization`);
  console.log(`âš¡ Efficiency: Gzip/Deflate Compression Active | In-Memory TTL Cache`);
  console.log(`ðŸ’¾ Database: ${process.env.DATABASE_URL ? 'PostgreSQL' : 'Persistent Storage (database.json)'}`);
  console.log(`ðŸ¤– AI Provider: ${process.env.GEMINI_API_KEY ? 'Gemini API' : (process.env.OPENAI_API_KEY ? 'OpenAI' : 'Intelligent Deterministic Engine (Demo Mode)')}`);
  console.log(`===============================================`);
});

export { app };
export default app;
