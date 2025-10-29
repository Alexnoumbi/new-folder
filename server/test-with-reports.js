const { exec } = require('child_process');
const path = require('path');

console.log('🧪 Démarrage des tests...\n');

// Exécuter Jest
const jestProcess = exec('jest', { cwd: __dirname }, (error, stdout, stderr) => {
  // Afficher la sortie de Jest
  if (stdout) console.log(stdout);
  if (stderr) console.error(stderr);
  
  console.log('\n📊 Génération des rapports...\n');
  
  // Toujours générer les rapports, même si les tests échouent
  const reportScript = path.join(__dirname, '..', 'generate-test-reports.js');
  const reportProcess = exec(`node "${reportScript}"`, (reportError) => {
    if (reportError) {
      console.error('❌ Erreur lors de la génération des rapports:', reportError.message);
      process.exit(1);
    } else {
      console.log('✅ Rapports générés avec succès!\n');
      
      // Sortir avec le code d'erreur de Jest pour indiquer si les tests ont échoué
      if (error && error.code) {
        process.exit(error.code);
      }
    }
  });
  
  reportProcess.stdout.pipe(process.stdout);
  reportProcess.stderr.pipe(process.stderr);
});

jestProcess.stdout.pipe(process.stdout);
jestProcess.stderr.pipe(process.stderr);
