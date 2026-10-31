import { logger } from './utils/logger.js';
﻿import { app } from './app.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`===============================================`);
  logger.info(`✨ EventPilot Backend running on port ${PORT}`);
  logger.info(`ðŸŒ API Base URL: http://localhost:${PORT}/api`);
  logger.info(`ðŸ›¡ï¸  Security: Helmet Enabled | Rate Limiting Active | CORS Restricted | XSS Sanitization`);
  logger.info(`⚡ Efficiency: Gzip/Deflate Compression Active | In-Memory TTL Cache`);
  logger.info(`💾 Database: ${process.env.DATABASE_URL ? 'PostgreSQL' : 'Persistent Storage (database.json)'}`);
  logger.info(`🤖 AI Provider: ${process.env.GEMINI_API_KEY ? 'Gemini API' : (process.env.OPENAI_API_KEY ? 'OpenAI' : 'Intelligent Deterministic Engine (Demo Mode)')}`);
  logger.info(`===============================================`);
});

export { app };
export default app;
