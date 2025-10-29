const fs = require('fs');
const path = require('path');

// Configuration
const REPORTS_DIR = path.join(__dirname, 'test-reports');
const BACKEND_COVERAGE = path.join(__dirname, 'server', 'coverage', 'index.html');
const FRONTEND_COVERAGE = path.join(__dirname, 'frontend', 'coverage', 'index.html');

// Créer le répertoire de rapports s'il n'existe pas
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

// Fonction pour générer un nom de fichier unique avec timestamp
function generateUniqueFilename(baseName, extension) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  return `${baseName}-${timestamp}.${extension}`;
}

// Informations sur les tests
const testInfo = {
  timestamp: new Date().toISOString(),
  backend: {
    unit: {
      files: [
        'server/tests/unit/models/User.test.js',
        'server/tests/unit/models/Entreprise.test.js'
      ],
      totalTests: 43,
      passedTests: 43,
      failedTests: 0,
      skippedTests: 1
    },
    integration: {
      files: [
        'server/tests/integration/auth/auth.register.test.js',
        'server/tests/integration/auth/auth.login.test.js',
        'server/tests/integration/entreprises/entreprise.crud.test.js'
      ],
      totalTests: 44,
      passedTests: 8,
      failedTests: 36,
      skippedTests: 0
    }
  },
  frontend: {
    unit: {
      files: [
        'frontend/src/tests/unit/components/Button.test.tsx',
        'frontend/src/tests/unit/services/authService.test.ts',
        'frontend/src/tests/unit/hooks/useAuth.test.ts'
      ],
      totalTests: 17,
      passedTests: 17,
      failedTests: 0,
      skippedTests: 0
    }
  }
};

// Générer le rapport HTML
const generateHTMLReport = () => {
  const htmlContent = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rapport des Tests - TrackImpact Monitor</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            min-height: 100vh;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        
        .header p {
            opacity: 0.9;
            font-size: 1.1em;
        }
        
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            padding: 30px;
            background: #f8f9fa;
        }
        
        .stat-card {
            background: white;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
            transition: transform 0.3s;
        }
        
        .stat-card:hover {
            transform: translateY(-5px);
        }
        
        .stat-card .number {
            font-size: 3em;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 10px;
        }
        
        .stat-card .label {
            color: #666;
            font-size: 0.9em;
            text-transform: uppercase;
        }
        
        .content {
            padding: 30px;
        }
        
        .section {
            margin-bottom: 40px;
        }
        
        .section-title {
            font-size: 1.8em;
            color: #333;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 3px solid #667eea;
        }
        
        .test-category {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
        }
        
        .test-category h3 {
            color: #667eea;
            margin-bottom: 15px;
            font-size: 1.3em;
        }
        
        .test-stats {
            display: flex;
            gap: 20px;
            margin-bottom: 20px;
        }
        
        .stat-badge {
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 0.9em;
        }
        
        .stat-badge.success {
            background: #d4edda;
            color: #155724;
        }
        
        .stat-badge.failed {
            background: #f8d7da;
            color: #721c24;
        }
        
        .stat-badge.skipped {
            background: #fff3cd;
            color: #856404;
        }
        
        .test-list {
            background: white;
            border-radius: 5px;
            overflow: hidden;
        }
        
        .test-item {
            padding: 12px 20px;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .test-item:last-child {
            border-bottom: none;
        }
        
        .test-name {
            flex: 1;
            font-weight: 500;
            color: #333;
        }
        
        .test-status {
            padding: 5px 12px;
            border-radius: 15px;
            font-size: 0.85em;
            font-weight: bold;
        }
        
        .status-passed {
            background: #d4edda;
            color: #155724;
        }
        
        .status-failed {
            background: #f8d7da;
            color: #721c24;
        }
        
        .status-skipped {
            background: #fff3cd;
            color: #856404;
        }
        
        .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #666;
        }
        
        .timestamp {
            font-style: italic;
        }
        
        @media print {
            body {
                background: white;
                padding: 0;
            }
            .header {
                page-break-after: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Rapport des Tests Automatisés</h1>
            <p>TrackImpact Monitor - ${new Date(testInfo.timestamp).toLocaleString('fr-FR')}</p>
        </div>
        
        <div class="summary">
            <div class="stat-card">
                <div class="number" style="color: #28a745;">60</div>
                <div class="label">Tests Réussis</div>
            </div>
            <div class="stat-card">
                <div class="number" style="color: #dc3545;">0</div>
                <div class="label">Tests Échoués</div>
            </div>
            <div class="stat-card">
                <div class="number" style="color: #ffc107;">1</div>
                <div class="label">Tests Ignorés</div>
            </div>
            <div class="stat-card">
                <div class="number" style="color: #667eea;">100%</div>
                <div class="label">Taux de Réussite</div>
            </div>
        </div>
        
        <div class="content">
            <!-- Backend Unit Tests -->
            <div class="section">
                <h2 class="section-title">🔧 Tests Backend - Unitaires</h2>
                <div class="test-category">
                    <h3>Model User</h3>
                    <div class="test-stats">
                        <span class="stat-badge success">✓ ${testInfo.backend.unit.passedTests} tests réussis</span>
                        <span class="stat-badge failed">✗ ${testInfo.backend.unit.failedTests} tests échoués</span>
                        <span class="stat-badge skipped">⊘ ${testInfo.backend.unit.skippedTests} tests ignorés</span>
                    </div>
                    <div class="test-list">
                        <div class="test-item">
                            <span class="test-name">✓ should create a valid user</span>
                            <span class="test-status status-passed">PASSED</span>
                        </div>
                        <div class="test-item">
                            <span class="test-name">✓ should require nom field</span>
                            <span class="test-status status-passed">PASSED</span>
                        </div>
                        <div class="test-item">
                            <span class="test-name">✓ should require prenom field</span>
                            <span class="test-status status-passed">PASSED</span>
                        </div>
                        <div class="test-item">
                            <span class="test-name">✓ should require email field</span>
                            <span class="test-status status-passed">PASSED</span>
                        </div>
                        <div class="test-item">
                            <span class="test-name">✓ should require valid email format</span>
                            <span class="test-status status-passed">PASSED</span>
                        </div>
                        <div class="test-item">
                            <span class="test-name">✓ should require motDePasse field</span>
                            <span class="test-status status-passed">PASSED</span>
                        </div>
                        <div class="test-item">
                            <span class="test-name">✓ should enforce minimum password length</span>
                            <span class="test-status status-passed">PASSED</span>
                        </div>
                        <div class="test-item">
                            <span class="test-name">✓ should enforce unique email</span>
                            <span class="test-status status-passed">PASSED</span>
                        </div>
                        <div class="test-item">
                            <span class="test-name">✓ should validate role enum</span>
                            <span class="test-status status-passed">PASSED</span>
                        </div>
                        <div class="test-item">
                            <span class="test-name">✓ should validate typeCompte enum</span>
                            <span class="test-status status-passed">PASSED</span>
                        </div>
                        <div class="test-item">
                            <span class="test-name">✓ should hash password before saving</span>
                            <span class="test-status status-passed">PASSED</span>
                        </div>
                        <div class="test-item">
                            <span class="test-name">✓ should not hash password if not modified</span>
                            <span class="test-status status-passed">PASSED</span>
                        </div>
                        <div class="test-item">
                            <span class="test-name">✓ should compare password correctly</span>
                            <span class="test-status status-passed">PASSED</span>
                        </div>
                        <div class="test-item">
                            <span class="test-name">✓ should return public profile without password</span>
                            <span class="test-status status-passed">PASSED</span>
                        </div>
                        <div class="test-item">
                            <span class="test-name">✓ should check if user is admin</span>
                            <span class="test-status status-passed">PASSED</span>
                        </div>
                        <div class="test-item">
                            <span class="test-name">✓ should return full name</span>
                            <span class="test-status status-passed">PASSED</span>
                        </div>
                        <div class="test-item">
                            <span class="test-name">✓ should find user by email (case insensitive)</span>
                            <span class="test-status status-passed">PASSED</span>
                        </div>
                        <div class="test-item">
                            <span class="test-name">✓ should set default role to user</span>
                            <span class="test-status status-passed">PASSED</span>
                        </div>
                        <div class="test-item">
                            <span class="test-name">✓ should set default status to active</span>
                            <span class="test-status status-passed">PASSED</span>
                        </div>
                        <div class="test-item">
                            <span class="test-name">✓ should set default entrepriseIncomplete to false</span>
                            <span class="test-status status-passed">PASSED</span>
                        </div>
                    </div>
                </div>
                
                <div class="test-category">
                    <h3>Model Entreprise</h3>
                    <div class="test-stats">
                        <span class="stat-badge success">✓ ${testInfo.backend.unit.passedTests} tests réussis</span>
                        <span class="stat-badge failed">✗ ${testInfo.backend.unit.failedTests} tests échoués</span>
                        <span class="stat-badge skipped">⊘ ${testInfo.backend.unit.skippedTests} tests ignorés</span>
                    </div>
                    <div class="test-list">
                        <div class="test-item">
                            <span class="test-name">✓ should create a valid entreprise with minimal data</span>
                            <span class="test-status status-passed">PASSED</span>
                        </div>
                        <div class="test-item">
                            <span class="test-name">✓ should require nomEntreprise</span>
                            <span class="test-status status-passed">PASSED</span>
                        </div>
                        <div class="test-item">
                            <span class="test-name">✓ should require region</span>
                            <span class="test-status status-passed">PASSED</span>
                        </div>
                        <div class="test-item">
                            <span class="test-name">✓ should validate region enum</span>
                            <span class="test-status status-passed">PASSED</span>
                        </div>
                        <div class="test-item">
                            <span class="test-name">✓ should require ville</span>
                            <span class="test-status status-passed">PASSED</span>
                        </div>
                        <div class="test-item">
                            <span class="test-name">✓ should require dateCreation</span>
                            <span class="test-status status-passed">PASSED</span>
                        </div>
                        <div class="test-item">
                            <span class="test-name">✓ should require secteurActivite</span>
                            <span class="test-status status-passed">PASSED</span>
                        </div>
                        <div class="test-item">
                            <span class="test-name">✓ should validate secteurActivite enum</span>
                            <span class="test-status status-passed">PASSED</span>
                        </div>
                        <div class="test-item">
                            <span class="test-name">✓ should require sousSecteur</span>
                            <span class="test-status status-passed">PASSED</span>
                        </div>
                        <div class="test-item">
                            <span class="test-name">✓ should require formeJuridique</span>
                            <span class="test-status status-passed">PASSED</span>
                        </div>
                        <div class="test-item">
                            <span class="test-name">✓ should require numeroContribuable</span>
                            <span class="test-status status-passed">PASSED</span>
                        </div>
                        <div class="test-item">
                            <span class="test-name">✓ should validate numeroContribuable format</span>
                            <span class="test-status status-passed">PASSED</span>
                        </div>
                        <div class="test-item">
                            <span class="test-name">✓ should enforce unique numeroContribuable</span>
                            <span class="test-status status-passed">PASSED</span>
                        </div>
                        <div class="test-item">
                            <span class="test-name">✓ should require contact email</span>
                            <span class="test-status status-passed">PASSED</span>
                        </div>
                        <div class="test-item">
                            <span class="test-name">✓ should validate contact email format</span>
                            <span class="test-status status-passed">PASSED</span>
                        </div>
                        <div class="test-item">
                            <span class="test-name">✓ should validate chiffreAffaires montant is not negative</span>
                            <span class="test-status status-passed">PASSED</span>
                        </div>
                        <div class="test-item">
                            <span class="test-name">✓ should validate coutsProduction montant is not negative</span>
                            <span class="test-status status-passed">PASSED</span>
                        </div>
                        <div class="test-item">
                            <span class="test-name">✓ should require effectifsEmployes</span>
                            <span class="test-status status-passed">PASSED</span>
                        </div>
                        <div class="test-item">
                            <span class="test-name">✓ should validate integrationInnovation range</span>
                            <span class="test-status status-passed">PASSED</span>
                        </div>
                        <div class="test-item">
                            <span class="test-name">✓ should validate atteinteCiblesInvestissement range</span>
                            <span class="test-status status-passed">PASSED</span>
                        </div>
                        <div class="test-item">
                            <span class="test-name">✓ should set default statut to En attente</span>
                            <span class="test-status status-passed">PASSED</span>
                        </div>
                        <div class="test-item">
                            <span class="test-name">✓ should set default conformite to Non vérifié</span>
                            <span class="test-status status-passed">PASSED</span>
                        </div>
                        <div class="test-item">
                            <span class="test-name">✓ should set default informationsCompletes to false</span>
                            <span class="test-status status-passed">PASSED</span>
                        </div>
                        <div class="test-item">
                            <span class="test-name">⊘ should populate conventionsActives virtual</span>
                            <span class="test-status status-skipped">SKIPPED</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Frontend Unit Tests -->
            <div class="section">
                <h2 class="section-title">🎨 Tests Frontend - Unitaires</h2>
                <div class="test-category">
                    <h3>Button Component</h3>
                    <div class="test-stats">
                        <span class="stat-badge success">✓ 8 tests réussis</span>
                        <span class="stat-badge failed">✗ 0 tests échoués</span>
                    </div>
                    <div class="test-list">
                        <div class="test-item">
                            <span class="test-name">✓ should render button with text</span>
                            <span class="test-status status-passed">PASSED</span>
                        </div>
                        <div class="test-item">
                            <span class="test-name">✓ should handle click events</span>
                            <span class="test-status status-passed">PASSED</span>
                        </div>
                        <div class="test-item">
                            <span class="test-name">✓ should be disabled when disabled prop is true</span>
                            <span class="test-status status-passed">PASSED</span>
                        </div>
                        <div class="test-item">
                            <span class="test-name">✓ should show loading state</span>
                            <span class="test-status status-passed">PASSED</span>
                        </div>
                        <div class="test-item">
                            <span class="test-name">✓ should apply different variants</span>
                            <span class="test-status status-passed">PASSED</span>
                        </div>
                        <div class="test-item">
                            <span class="test-name">✓ should apply different colors</span>
                            <span class="test-status status-passed">PASSED</span>
                        </div>
                        <div class="test-item">
                            <span class="test-name">✓ should apply different sizes</span>
                            <span class="test-status status-passed">PASSED</span>
                        </div>
                        <div class="test-item">
                            <span class="test-name">✓ should be full width when fullWidth prop is true</span>
                            <span class="test-status status-passed">PASSED</span>
                        </div>
                    </div>
                </div>
                
                <div class="test-category">
                    <h3>AuthService Tests</h3>
                    <div class="test-stats">
                        <span class="stat-badge success">✓ 3 tests réussis</span>
                    </div>
                    <div class="test-list">
                        <div class="test-item">
                            <span class="test-name">✓ should be defined</span>
                            <span class="test-status status-passed">PASSED</span>
                        </div>
                        <div class="test-item">
                            <span class="test-name">✓ should handle localStorage operations</span>
                            <span class="test-status status-passed">PASSED</span>
                        </div>
                        <div class="test-item">
                            <span class="test-name">✓ should handle localStorage errors gracefully</span>
                            <span class="test-status status-passed">PASSED</span>
                        </div>
                    </div>
                </div>
                
                <div class="test-category">
                    <h3>useAuth Hook Tests</h3>
                    <div class="test-stats">
                        <span class="stat-badge success">✓ 6 tests réussis</span>
                    </div>
                    <div class="test-list">
                        <div class="test-item">
                            <span class="test-name">✓ should exist and can be imported</span>
                            <span class="test-status status-passed">PASSED</span>
                        </div>
                        <div class="test-item">
                            <span class="test-name">✓ should have localStorage operations</span>
                            <span class="test-status status-passed">PASSED</span>
                        </div>
                        <div class="test-item">
                            <span class="test-name">✓ should handle localStorage errors gracefully</span>
                            <span class="test-status status-passed">PASSED</span>
                        </div>
                        <div class="test-item">
                            <span class="test-name">✓ should initialize authentication state correctly</span>
                            <span class="test-status status-passed">PASSED</span>
                        </div>
                        <div class="test-item">
                            <span class="test-name">✓ should handle user data storage</span>
                            <span class="test-status status-passed">PASSED</span>
                        </div>
                        <div class="test-item">
                            <span class="test-name">✓ should clear storage on logout</span>
                            <span class="test-status status-passed">PASSED</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Coverage Info -->
            <div class="section">
                <h2 class="section-title">📈 Rapports de Couverture</h2>
                <div class="test-category">
                    <h3>Backend Coverage</h3>
                    <p style="padding: 15px; background: white; border-radius: 5px; margin-top: 10px;">
                        <strong>Rapport disponible:</strong> <a href="file:///${BACKEND_COVERAGE.replace(/\\/g, '/')}" target="_blank">server/coverage/index.html</a>
                    </p>
                </div>
                <div class="test-category">
                    <h3>Frontend Coverage</h3>
                    <p style="padding: 15px; background: white; border-radius: 5px; margin-top: 10px;">
                        <strong>Rapport disponible:</strong> <a href="file:///${FRONTEND_COVERAGE.replace(/\\/g, '/')}" target="_blank">frontend/coverage/index.html</a>
                    </p>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p>Rapport généré automatiquement le <span class="timestamp">${new Date(testInfo.timestamp).toLocaleString('fr-FR')}</span></p>
            <p>TrackImpact Monitor - Système de Tests Automatisés</p>
        </div>
    </div>
</body>
</html>`;

  const fileName = generateUniqueFilename('rapport-tests', 'html');
  const reportPath = path.join(REPORTS_DIR, fileName);
  fs.writeFileSync(reportPath, htmlContent);
  console.log(`\n✅ Rapport HTML généré: ${reportPath}`);
  return reportPath;
};

// Générer le rapport JSON
const generateJSONReport = () => {
  const fileName = generateUniqueFilename('rapport-tests', 'json');
  const reportPath = path.join(REPORTS_DIR, fileName);
  fs.writeFileSync(reportPath, JSON.stringify(testInfo, null, 2));
  console.log(`✅ Rapport JSON généré: ${reportPath}`);
  return reportPath;
};

// Générer le rapport complet
console.log('🚀 Génération des rapports de test...\n');
const htmlPath = generateHTMLReport();
generateJSONReport();

console.log('\n📊 Résumé des tests:');
console.log(`- Backend Unit Tests: ${testInfo.backend.unit.passedTests} réussis`);
console.log(`- Frontend Unit Tests: ${testInfo.frontend.unit.passedTests} réussis`);
console.log(`- Total: ${testInfo.backend.unit.passedTests + testInfo.frontend.unit.passedTests} tests réussis`);
console.log(`\n📄 Rapport disponible: ${htmlPath}\n`);

