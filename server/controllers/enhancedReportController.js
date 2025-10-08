const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const Portfolio = require('../models/Portfolio');
const ResultsFramework = require('../models/ResultsFramework');
const Entreprise = require('../models/Entreprise');
const Indicator = require('../models/Indicator');
const { FormBuilder, FormSubmission } = require('../models/FormBuilder');

// Générer un rapport de portfolio en PDF
exports.generatePortfolioPDFReport = async (req, res) => {
  try {
    const { portfolioId } = req.params;
    
    const portfolio = await Portfolio.findById(portfolioId)
      .populate('projects')
      .populate('team.user', 'nom prenom email')
      .populate('aggregatedIndicators.sourceIndicators');
    
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio non trouvé'
      });
    }
    
    // Créer le document PDF
    const doc = new PDFDocument({ margin: 50 });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=portfolio-${portfolio.code}-${Date.now()}.pdf`);
    
    doc.pipe(res);
    
    // En-tête du rapport
    doc.fontSize(24).text(portfolio.name, { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Code: ${portfolio.code}`, { align: 'center' });
    doc.text(`Type: ${portfolio.portfolioType}`, { align: 'center' });
    doc.text(`Date du rapport: ${new Date().toLocaleDateString('fr-FR')}`, { align: 'center' });
    doc.moveDown(2);
    
    // Résumé exécutif
    doc.fontSize(18).text('Résumé Exécutif', { underline: true });
    doc.moveDown();
    doc.fontSize(12).text(portfolio.description || 'Aucune description disponible');
    doc.moveDown();
    
    // Statistiques clés
    doc.fontSize(16).text('Statistiques Clés', { underline: true });
    doc.moveDown();
    doc.fontSize(12);
    doc.text(`Nombre de projets: ${portfolio.projects.length}`);
    doc.text(`Projets actifs: ${portfolio.projects.filter(p => p.statut === 'Actif').length}`);
    doc.text(`Budget total: ${portfolio.budget.totalBudget.amount?.toLocaleString()} ${portfolio.budget.totalBudget.currency}`);
    doc.text(`Budget dépensé: ${portfolio.budget.spent?.toLocaleString()} ${portfolio.budget.totalBudget.currency}`);
    doc.text(`Taux d'exécution: ${portfolio.budgetExecutionRate}%`);
    doc.moveDown(2);
    
    // Performance
    if (portfolio.performance && portfolio.performance.overallScore) {
      doc.fontSize(16).text('Performance', { underline: true });
      doc.moveDown();
      doc.fontSize(12).text(`Score global: ${portfolio.performance.overallScore}/100`);
      doc.moveDown();
      
      if (portfolio.performance.dimensions && portfolio.performance.dimensions.length > 0) {
        portfolio.performance.dimensions.forEach(dim => {
          doc.text(`${dim.name}: ${dim.score}/100`);
        });
      }
      doc.moveDown(2);
    }
    
    // Liste des projets
    doc.fontSize(16).text('Projets du Portfolio', { underline: true });
    doc.moveDown();
    
    portfolio.projects.forEach((project, index) => {
      doc.fontSize(12);
      doc.text(`${index + 1}. ${project.identification?.nomEntreprise || 'Sans nom'}`, { bold: true });
      doc.fontSize(10);
      doc.text(`   Statut: ${project.statut}`);
      doc.text(`   Région: ${project.identification?.region}`);
      doc.text(`   Secteur: ${project.identification?.secteurActivite}`);
      doc.moveDown(0.5);
    });
    
    // Finaliser le PDF
    doc.end();
  } catch (error) {
    console.error('Erreur génération PDF:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Générer un rapport de portfolio en Excel
exports.generatePortfolioExcelReport = async (req, res) => {
  try {
    const { portfolioId } = req.params;
    
    const portfolio = await Portfolio.findById(portfolioId)
      .populate('projects')
      .populate('aggregatedIndicators.sourceIndicators');
    
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio non trouvé'
      });
    }
    
    // Créer le workbook Excel
    const workbook = new ExcelJS.Workbook();
    
    // Feuille 1: Résumé
    const summarySheet = workbook.addWorksheet('Résumé');
    summarySheet.columns = [
      { header: 'Indicateur', key: 'indicator', width: 30 },
      { header: 'Valeur', key: 'value', width: 30 }
    ];
    
    summarySheet.addRows([
      { indicator: 'Nom du Portfolio', value: portfolio.name },
      { indicator: 'Code', value: portfolio.code },
      { indicator: 'Type', value: portfolio.portfolioType },
      { indicator: 'Nombre de projets', value: portfolio.projects.length },
      { indicator: 'Budget total', value: `${portfolio.budget.totalBudget.amount?.toLocaleString()} ${portfolio.budget.totalBudget.currency}` },
      { indicator: 'Budget dépensé', value: `${portfolio.budget.spent?.toLocaleString()} ${portfolio.budget.totalBudget.currency}` },
      { indicator: 'Taux d\'exécution', value: `${portfolio.budgetExecutionRate}%` },
      { indicator: 'Score de performance', value: portfolio.performance?.overallScore || 'N/A' }
    ]);
    
    // Style pour l'en-tête
    summarySheet.getRow(1).font = { bold: true };
    summarySheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF3B82F6' }
    };
    
    // Feuille 2: Liste des projets
    const projectsSheet = workbook.addWorksheet('Projets');
    projectsSheet.columns = [
      { header: 'Nom', key: 'name', width: 40 },
      { header: 'Statut', key: 'status', width: 15 },
      { header: 'Région', key: 'region', width: 20 },
      { header: 'Secteur', key: 'sector', width: 25 },
      { header: 'Sous-secteur', key: 'subsector', width: 25 },
      { header: 'Employés', key: 'employees', width: 15 },
      { header: 'CA', key: 'revenue', width: 20 }
    ];
    
    portfolio.projects.forEach(project => {
      projectsSheet.addRow({
        name: project.identification?.nomEntreprise || 'Sans nom',
        status: project.statut,
        region: project.identification?.region,
        sector: project.identification?.secteurActivite,
        subsector: project.identification?.sousSecteur,
        employees: project.investissementEmploi?.effectifsEmployes,
        revenue: project.performanceEconomique?.chiffreAffaires?.montant
      });
    });
    
    projectsSheet.getRow(1).font = { bold: true };
    projectsSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF3B82F6' }
    };
    
    // Feuille 3: Indicateurs agrégés
    if (portfolio.aggregatedIndicators && portfolio.aggregatedIndicators.length > 0) {
      const indicatorsSheet = workbook.addWorksheet('Indicateurs');
      indicatorsSheet.columns = [
        { header: 'Indicateur', key: 'name', width: 40 },
        { header: 'Type', key: 'type', width: 20 },
        { header: 'Valeur actuelle', key: 'current', width: 20 },
        { header: 'Valeur cible', key: 'target', width: 20 },
        { header: 'Taux d\'atteinte (%)', key: 'achievement', width: 20 }
      ];
      
      portfolio.aggregatedIndicators.forEach(indicator => {
        const achievement = indicator.targetValue > 0 
          ? Math.round((indicator.currentValue / indicator.targetValue) * 100)
          : 0;
          
        indicatorsSheet.addRow({
          name: indicator.name,
          type: indicator.type,
          current: indicator.currentValue,
          target: indicator.targetValue,
          achievement: achievement
        });
      });
      
      indicatorsSheet.getRow(1).font = { bold: true };
      indicatorsSheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF3B82F6' }
      };
    }
    
    // Feuille 4: Risques
    if (portfolio.risks && portfolio.risks.length > 0) {
      const risksSheet = workbook.addWorksheet('Risques');
      risksSheet.columns = [
        { header: 'Description', key: 'description', width: 50 },
        { header: 'Catégorie', key: 'category', width: 20 },
        { header: 'Probabilité', key: 'probability', width: 15 },
        { header: 'Impact', key: 'impact', width: 15 },
        { header: 'Statut', key: 'status', width: 20 }
      ];
      
      portfolio.risks.forEach(risk => {
        risksSheet.addRow({
          description: risk.description,
          category: risk.category,
          probability: risk.probability,
          impact: risk.impact,
          status: risk.status
        });
      });
      
      risksSheet.getRow(1).font = { bold: true };
      risksSheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF3B82F6' }
      };
    }
    
    // Générer et envoyer le fichier
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=portfolio-${portfolio.code}-${Date.now()}.xlsx`);
    
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Erreur génération Excel:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Générer un rapport de cadre de résultats en PDF
exports.generateFrameworkPDFReport = async (req, res) => {
  try {
    const { frameworkId } = req.params;
    
    const framework = await ResultsFramework.findById(frameworkId)
      .populate('project')
      .populate('impact.indicators outcomes.indicators outputs.indicators');
    
    if (!framework) {
      return res.status(404).json({
        success: false,
        message: 'Cadre de résultats non trouvé'
      });
    }
    
    const doc = new PDFDocument({ margin: 50 });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=framework-${frameworkId}-${Date.now()}.pdf`);
    
    doc.pipe(res);
    
    // Titre
    doc.fontSize(24).text('Cadre de Résultats', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(framework.name, { align: 'center' });
    doc.moveDown(2);
    
    // Impact
    if (framework.impact && framework.impact.description) {
      doc.fontSize(18).text('Impact', { underline: true });
      doc.moveDown();
      doc.fontSize(12).text(framework.impact.description);
      doc.moveDown(2);
    }
    
    // Outcomes
    if (framework.outcomes && framework.outcomes.length > 0) {
      doc.fontSize(18).text('Résultats (Outcomes)', { underline: true });
      doc.moveDown();
      framework.outcomes.forEach((outcome, index) => {
        doc.fontSize(12).text(`${index + 1}. ${outcome.description}`, { bold: true });
        doc.fontSize(10).text(`   Statut: ${outcome.status}`);
        doc.text(`   Responsable: ${outcome.responsibleParty || 'Non assigné'}`);
        doc.moveDown(0.5);
      });
      doc.moveDown();
    }
    
    // Outputs
    if (framework.outputs && framework.outputs.length > 0) {
      doc.fontSize(18).text('Produits (Outputs)', { underline: true });
      doc.moveDown();
      framework.outputs.forEach((output, index) => {
        doc.fontSize(12).text(`${index + 1}. ${output.description}`, { bold: true });
        doc.fontSize(10).text(`   Statut: ${output.status}`);
        doc.moveDown(0.5);
      });
      doc.moveDown();
    }
    
    // Progression globale
    doc.fontSize(18).text('Progression', { underline: true });
    doc.moveDown();
    doc.fontSize(12).text(`Progression globale: ${framework.overallProgress || 0}%`);
    
    doc.end();
  } catch (error) {
    console.error('Erreur génération PDF framework:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Générer un rapport de soumissions de formulaire en Excel
exports.generateFormSubmissionsExcelReport = async (req, res) => {
  try {
    const { formId } = req.params;
    
    const form = await FormBuilder.findById(formId);
    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Formulaire non trouvé'
      });
    }
    
    const submissions = await FormSubmission.find({ form: formId })
      .populate('submittedBy', 'nom prenom email')
      .sort({ submittedAt: -1 });
    
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Soumissions');
    
    // Extraire tous les champs du formulaire
    const allFields = [];
    form.sections.forEach(section => {
      section.fields.forEach(field => {
        allFields.push({
          fieldId: field.fieldId,
          label: field.label
        });
      });
    });
    
    // Définir les colonnes
    const columns = [
      { header: 'ID', key: 'id', width: 30 },
      { header: 'Date de soumission', key: 'date', width: 20 },
      { header: 'Soumis par', key: 'submitter', width: 30 },
      { header: 'Statut', key: 'status', width: 20 }
    ];
    
    // Ajouter une colonne pour chaque champ du formulaire
    allFields.forEach(field => {
      columns.push({
        header: field.label,
        key: field.fieldId,
        width: 25
      });
    });
    
    sheet.columns = columns;
    
    // Ajouter les données
    submissions.forEach(submission => {
      const row = {
        id: submission._id.toString(),
        date: submission.submittedAt.toLocaleDateString('fr-FR'),
        submitter: submission.submitterName || submission.submittedBy?.nom || 'Anonyme',
        status: submission.status
      };
      
      // Ajouter les valeurs des champs
      allFields.forEach(field => {
        row[field.fieldId] = submission.data[field.fieldId] || '';
      });
      
      sheet.addRow(row);
    });
    
    // Style de l'en-tête
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF3B82F6' }
    };
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=form-submissions-${formId}-${Date.now()}.xlsx`);
    
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Erreur génération Excel soumissions:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Générer un rapport consolidé multi-format
exports.generateConsolidatedReport = async (req, res) => {
  try {
    const { type, format, filters } = req.body;
    
    // Logique pour générer différents types de rapports
    switch (type) {
      case 'DASHBOARD_SUMMARY':
        return await generateDashboardSummary(req, res, format, filters);
      case 'INDICATORS_REPORT':
        return await generateIndicatorsReport(req, res, format, filters);
      case 'COMPLIANCE_REPORT':
        return await generateComplianceReport(req, res, format, filters);
      default:
        return res.status(400).json({
          success: false,
          message: 'Type de rapport non reconnu'
        });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Fonctions helpers pour les rapports spécifiques
async function generateDashboardSummary(req, res, format, filters) {
  // TODO: Implémenter la génération de rapport de synthèse dashboard
  res.json({
    success: true,
    message: 'Rapport dashboard à implémenter',
    format
  });
}

async function generateIndicatorsReport(req, res, format, filters) {
  // TODO: Implémenter la génération de rapport d'indicateurs
  res.json({
    success: true,
    message: 'Rapport indicateurs à implémenter',
    format
  });
}

async function generateComplianceReport(req, res, format, filters) {
  // TODO: Implémenter la génération de rapport de conformité
  res.json({
    success: true,
    message: 'Rapport conformité à implémenter',
    format
  });
}

