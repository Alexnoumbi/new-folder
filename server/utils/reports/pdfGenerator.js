const PDFDocument = require('pdfkit');
const fs = require('fs');

async function generatePDF(report, filePath, includeCharts) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument();
            const stream = fs.createWriteStream(filePath);

            // Gérer les événements du stream
            stream.on('finish', resolve);
            stream.on('error', reject);

            // Pipe le document vers le stream
            doc.pipe(stream);

            // Ajouter le contenu au PDF
            doc.fontSize(25)
               .text('Rapport', { align: 'center' })
               .moveDown();

            // Informations de base
            doc.fontSize(14)
               .text(`Type: ${report.type}`)
               .text(`Date de création: ${new Date(report.createdAt).toLocaleDateString()}`)
               .text(`Période: ${new Date(report.startDate).toLocaleDateString()} - ${new Date(report.endDate).toLocaleDateString()}`)
               .moveDown();

            if (report.visit) {
                doc.fontSize(16).text('Informations de la visite', { underline: true }).moveDown(0.5);
                doc.fontSize(12)
                   .text(`Date prévue: ${new Date(report.visit.scheduledAt).toLocaleString()}`)
                   .text(`Statut: ${report.visit.status}`)
                   .text(`Type: ${report.visit.type}`)
                   .moveDown();

                const rep = report.visit.report || {};
                doc.fontSize(16).text('Rapport', { underline: true }).moveDown(0.5);
                doc.fontSize(12)
                   .text(`Conclusion: ${rep.outcome || ''}`)
                   .text(`Rapporteur: ${rep.reporterName || ''}`)
                   .moveDown(0.5)
                   .text('Contenu:')
                   .moveDown(0.25)
                   .fontSize(11)
                   .text(rep.content || '', { align: 'left' })
                   .moveDown();

                const ent = rep.enterpriseSnapshot || report.visit.enterpriseId || report.enterprise;
                if (ent) {
                    // Helpers
                    const h2 = (title) => doc.fontSize(16).text(title, { underline: true }).moveDown(0.5);
                    const kv = (label, value) => doc.fontSize(12).text(`${label}: ${value ?? ''}`);

                    // Identification
                    h2('Entreprise - Identification');
                    const idt = ent.identification || {};
                    kv('Nom', idt.nomEntreprise || ent.nom || ent.name || '');
                    kv('Raison sociale', idt.raisonSociale || '');
                    kv('Région', idt.region || ent.region || '');
                    kv('Ville', idt.ville || ent.ville || '');
                    kv('Date de création', idt.dateCreation ? new Date(idt.dateCreation).toLocaleDateString() : (ent.dateCreation ? new Date(ent.dateCreation).toLocaleDateString() : ''));
                    kv('Secteur d\'activité', idt.secteurActivite || ent.secteurActivite || '');
                    kv('Sous-secteur', idt.sousSecteur || '');
                    kv('Filière de production', idt.filiereProduction || '');
                    kv('Forme juridique', idt.formeJuridique || '');
                    kv('Numéro de contribuable', idt.numeroContribuable || '');
                    doc.moveDown();

                    // Performance économique
                    h2('Performance économique');
                    const pe = ent.performanceEconomique || {};
                    const ca = pe.chiffreAffaires || {};
                    kv('Chiffre d\'affaires (montant)', ca.montant ?? '');
                    kv('Chiffre d\'affaires (devise)', ca.devise ?? '');
                    kv('Chiffre d\'affaires (période)', ca.periode ?? '');
                    kv('Évolution CA', pe.evolutionCA ?? '');
                    const cp = pe.coutsProduction || {};
                    kv('Coûts de production (montant)', cp.montant ?? '');
                    kv('Coûts de production (devise)', cp.devise ?? '');
                    kv('Évolution des coûts', pe.evolutionCouts ?? '');
                    kv('Situation trésorerie', pe.situationTresorerie ?? '');
                    doc.moveDown();

                    // Investissement & Emploi
                    h2('Investissement & Emploi');
                    const ie = ent.investissementEmploi || {};
                    kv('Effectifs employés', ie.effectifsEmployes ?? '');
                    kv('Nouveaux emplois créés', ie.nouveauxEmploisCrees ?? '');
                    kv('Nouveaux investissements réalisés', ie.nouveauxInvestissementsRealises ? 'Oui' : 'Non');
                    const ti = ie.typesInvestissements || {};
                    kv('Investissements immobiliers', ti.immobiliers ? 'Oui' : 'Non');
                    kv('Investissements mobiliers', ti.mobiliers ? 'Oui' : 'Non');
                    kv('Investissements incorporels', ti.incorporels ? 'Oui' : 'Non');
                    kv('Investissements financiers', ti.financiers ? 'Oui' : 'Non');
                    doc.moveDown();

                    // Innovation & Digitalisation
                    h2('Innovation & Digitalisation');
                    const id = ent.innovationDigitalisation || {};
                    kv('Intégration innovation (1-3)', id.integrationInnovation ?? '');
                    kv('Économie numérique (1-3)', id.integrationEconomieNumerique ?? '');
                    kv('Utilisation IA (1-3)', id.utilisationIA ?? '');
                    doc.moveDown();

                    // Conventions
                    h2('Conventions');
                    const conv = ent.conventions || {};
                    const rr = conv.respectDelaisReporting || {};
                    kv('Respect des délais de reporting', rr.conforme ? 'Oui' : 'Non');
                    kv('Jours de retard', rr.joursRetard ?? '');
                    kv('Atteinte cibles investissement (%)', conv.atteinteCiblesInvestissement ?? '');
                    kv('Atteinte cibles emploi (%)', conv.atteinteCiblesEmploi ?? '');
                    const cns = conv.conformiteNormesSpecifiques || {};
                    kv('Conformité normes spécifiques', cns.conforme ? 'Oui' : 'Non');
                    kv('Niveau de conformité (1-5)', cns.niveauConformite ?? '');
                    doc.moveDown();

                    // Contact
                    h2('Contact');
                    const contact = ent.contact || {};
                    kv('Email', contact.email ?? '');
                    kv('Téléphone', contact.telephone ?? '');
                    const adr = contact.adresse || {};
                    kv('Adresse - Rue', adr.rue ?? '');
                    kv('Adresse - Ville', adr.ville ?? '');
                    kv('Adresse - Code postal', adr.codePostal ?? '');
                    kv('Adresse - Pays', adr.pays ?? '');
                    kv('Site Web', contact.siteWeb ?? '');
                    doc.moveDown();

                    // Statut & description
                    h2('Statut & description');
                    kv('Statut', ent.statut ?? '');
                    kv('Informations complètes', ent.informationsCompletes ? 'Oui' : 'Non');
                    doc.moveDown(0.25);
                    doc.fontSize(12).text('Description:').moveDown(0.25);
                    doc.fontSize(11).text(ent.description || '', { align: 'left' }).moveDown();
                }
            }

            // Si on inclut les graphiques
            if (includeCharts) {
                doc.fontSize(16)
                   .text('Graphiques', { underline: true })
                   .moveDown();
                // TODO: Ajouter la logique pour les graphiques
            }

            // Finaliser le document
            doc.end();

        } catch (error) {
            reject(error);
        }
    });
}

module.exports = {
    generatePDF
};
