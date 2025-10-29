const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Démarrage de la simulation complète des tests...\n');

// Configuration
const config = {
  backend: {
    port: 5000,
    dir: './server',
    testCommand: 'npm test'
  },
  frontend: {
    port: 3000,
    dir: './frontend',
    testCommand: 'npm test -- --coverage --watchAll=false'
  },
  e2e: {
    dir: './e2e',
    testCommand: 'npx playwright test'
  }
};

// Fonction pour exécuter une commande
function runCommand(command, cwd, name) {
  return new Promise((resolve, reject) => {
    console.log(`📦 Exécution des tests ${name}...`);
    const process = spawn(command, { shell: true, cwd });
    
    let output = '';
    let errorOutput = '';
    
    process.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      console.log(`[${name}] ${text}`);
    });
    
    process.stderr.on('data', (data) => {
      const text = data.toString();
      errorOutput += text;
      console.error(`[${name}] ${text}`);
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ Tests ${name} terminés avec succès\n`);
        resolve({ success: true, output, errorOutput });
      } else {
        console.log(`❌ Tests ${name} échoués (code: ${code})\n`);
        resolve({ success: false, output, errorOutput, code });
      }
    });
  });
}

// Fonction pour générer le rapport
function generateReport(results) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalTests: 0,
      passed: 0,
      failed: 0,
      coverage: {}
    },
    results: results,
    recommendations: []
  };

  // Calculer les statistiques
  results.forEach(result => {
    if (result.success) {
      report.summary.passed++;
    } else {
      report.summary.failed++;
    }
    report.summary.totalTests++;
  });

  // Générer les recommandations
  if (report.summary.failed > 0) {
    report.recommendations.push('Vérifiez les tests qui ont échoué et corrigez les erreurs');
  }
  
  if (report.summary.passed === report.summary.totalTests) {
    report.recommendations.push('Tous les tests sont passés ! L\'application est prête pour la production');
  }

  return report;
}

// Fonction principale
async function runAllTests() {
  const results = [];
  
  try {
    // Tests Backend
    console.log('🔧 Tests Backend...');
    const backendResult = await runCommand(
      config.backend.testCommand,
      config.backend.dir,
      'Backend'
    );
    results.push({ type: 'Backend', ...backendResult });

    // Tests Frontend
    console.log('🎨 Tests Frontend...');
    const frontendResult = await runCommand(
      config.frontend.testCommand,
      config.frontend.dir,
      'Frontend'
    );
    results.push({ type: 'Frontend', ...frontendResult });

    // Tests E2E
    console.log('🌐 Tests E2E...');
    const e2eResult = await runCommand(
      config.e2e.testCommand,
      config.e2e.dir,
      'E2E'
    );
    results.push({ type: 'E2E', ...e2eResult });

    // Générer le rapport
    const report = generateReport(results);
    
    // Sauvegarder le rapport
    const reportPath = './test-results.json';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Afficher le résumé
    console.log('\n📊 RÉSUMÉ DES TESTS');
    console.log('==================');
    console.log(`✅ Tests réussis: ${report.summary.passed}`);
    console.log(`❌ Tests échoués: ${report.summary.failed}`);
    console.log(`📈 Total: ${report.summary.totalTests}`);
    console.log(`📄 Rapport sauvegardé: ${reportPath}`);
    
    if (report.recommendations.length > 0) {
      console.log('\n💡 RECOMMANDATIONS');
      console.log('==================');
      report.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
      });
    }

    return report;
  } catch (error) {
    console.error('❌ Erreur lors de l\'exécution des tests:', error);
    throw error;
  }
}

// Exécuter les tests
runAllTests()
  .then(report => {
    console.log('\n🎉 Simulation terminée !');
    process.exit(report.summary.failed > 0 ? 1 : 0);
  })
  .catch(error => {
    console.error('💥 Erreur fatale:', error);
    process.exit(1);
  });
