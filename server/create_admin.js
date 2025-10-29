const mongoose = require('mongoose');
require('dotenv').config();

async function createAdmin() {
    try {
        console.log('🔄 Création d\'un admin de test...');
        
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB connecté');
        
        const User = require('./models/User');
        
        // Vérifier si l'admin existe déjà
        const existingAdmin = await User.findOne({ email: 'admin@test.com' });
        
        if (existingAdmin) {
            console.log('👤 Admin existe déjà:', existingAdmin.email, '- Type:', existingAdmin.typeCompte);
            
            // Mettre à jour le type si nécessaire
            if (existingAdmin.typeCompte !== 'admin') {
                existingAdmin.typeCompte = 'admin';
                await existingAdmin.save();
                console.log('✅ Type mis à jour vers admin');
            }
        } else {
            // Créer un nouvel admin
            const admin = new User({
                email: 'admin@test.com',
                nom: 'Admin',
                prenom: 'Test',
                typeCompte: 'admin',
                motDePasse: 'hashedpassword123', // Mot de passe temporaire
                telephone: '0123456789'
            });
            
            await admin.save();
            console.log('✅ Admin créé:', admin.email);
        }
        
        // Lister tous les utilisateurs pour vérification
        const allUsers = await User.find({}, 'email typeCompte nom prenom');
        console.log('📋 Tous les utilisateurs:');
        allUsers.forEach(user => {
            console.log(`  - ${user.email} (${user.typeCompte}) - ${user.prenom} ${user.nom}`);
        });
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Erreur:', error.message);
        process.exit(1);
    }
}

createAdmin();
