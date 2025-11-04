const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function deleteTestUsers() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Supprimer les utilisateurs de test (ent111@gmail.com à ent120@gmail.com)
    const emailsToDelete = [];
    for (let i = 111; i <= 120; i++) {
      emailsToDelete.push(`ent${i}@gmail.com`);
    }

    const result = await User.deleteMany({ 
      email: { $in: emailsToDelete }
    });

    console.log(`✅ ${result.deletedCount} utilisateur(s) supprimé(s)`);
    console.log('\n📋 Emails supprimés :');
    emailsToDelete.forEach(email => {
      console.log(`   - ${email}`);
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Connexion MongoDB fermée');
    process.exit(0);
  }
}

if (require.main === module) {
  deleteTestUsers();
}

module.exports = { deleteTestUsers };

