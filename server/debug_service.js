const mongoose = require('mongoose');
require('dotenv').config();

async function debugService() {
    try {
        console.log('🔍 === DEBUG SERVICE HYBRIDE ===');
        
        // 1. Test connexion MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB connecté');
        
        // 2. Test modèles
        const User = require('./models/User');
        const Enterprise = require('./models/Entreprise');
        
        const user = await User.findOne({ email: 'alenoumbi@gmail.com' });
        console.log('👤 Utilisateur trouvé:', user ? { email: user.email, typeCompte: user.typeCompte } : 'AUCUN');
        
        const enterpriseCount = await Enterprise.countDocuments();
        console.log('🏢 Nombre d\'entreprises:', enterpriseCount);
        
        // 3. Test service hybride
        const HybridQAServiceFallback = require('./utils/hybridQAServiceFallback');
        const service = new HybridQAServiceFallback();
        console.log('🤖 Service créé');
        
        await service.initialize();
        console.log('✅ Service initialisé');
        
        // 4. Test question simple
        console.log('\n🧪 === TEST QUESTION ===');
        const question = "Combien d'entreprises sont enregistrées ?";
        const userRole = "admin";
        
        console.log('❓ Question:', question);
        console.log('👑 Rôle:', userRole);
        
        const result = await service.processQuestion(question, userRole, null);
        
        console.log('\n📊 === RÉSULTAT ===');
        console.log('Success:', result.success);
        console.log('Response:', result.response);
        console.log('Confidence:', result.confidence);
        console.log('Approach:', result.approach);
        
        if (!result.success) {
            console.log('❌ Erreur:', result.error);
        }
        
        // 5. Test handler direct
        console.log('\n🔧 === TEST HANDLER DIRECT ===');
        try {
            const directResult = await service.getEnterpriseCount(question, userRole, null);
            console.log('✅ Handler direct:', directResult);
        } catch (handlerError) {
            console.log('❌ Erreur handler:', handlerError.message);
        }
        
        process.exit(0);
        
    } catch (error) {
        console.error('\n❌ === ERREUR GÉNÉRALE ===');
        console.error('Message:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

debugService();
