// 1. MUST BE THE VERY FIRST LINE. This guarantees process.env is loaded before anything else!
import 'dotenv/config'; 

import app from './app.js';

// 2. Now it's safe to use process.env
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 API Server running smoothly on http://localhost:${PORT}`);
});