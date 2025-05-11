// start/hooks.ts
import app from '@adonisjs/core/services/app'
import db from '@adonisjs/lucid/services/db'

// start/hooks.ts
app.ready(async () => {
    try {
      await db.rawQuery("SET TIME ZONE 'Africa/Brazzaville'");
      console.log('✅ Fuseau horaire configuré sur UTC+1 (Brazzaville)');
    } catch (error) {
      console.error('❌ Erreur configuration fuseau:', error);
    }
  });