const Excel = require('exceljs');

async function generateExcel(report, filePath, includeCharts) {
    try {
        const workbook = new Excel.Workbook();
        const worksheet = workbook.addWorksheet('Rapport');

        // En-tête du rapport
        worksheet.addRow([report.title || 'RAPPORT']);
        worksheet.addRow([]);

        // Informations de base
        worksheet.addRow(['Type de rapport', report.type]);
        worksheet.addRow(['Date de création', new Date(report.createdAt).toLocaleDateString()]);
        worksheet.addRow(['Période', `${new Date(report.startDate).toLocaleDateString()} - ${new Date(report.endDate).toLocaleDateString()}`]);
        worksheet.addRow([]);

        // Mise en forme
        worksheet.getCell('A1').font = {
            size: 16,
            bold: true
        };

        // Statistiques générales
        if (report.data) {
            worksheet.addRow(['STATISTIQUES GÉNÉRALES']);
            worksheet.addRow(['Nombre d\'entreprises', report.data.entreprises?.length || 0]);
            worksheet.addRow(['Nombre d\'indicateurs', report.data.indicators?.length || 0]);
            worksheet.addRow(['Nombre de KPIs', report.data.kpis?.length || 0]);
            worksheet.addRow(['Nombre de visites', report.data.visits?.length || 0]);
            worksheet.addRow([]);

            // Entreprises
            if (report.data.entreprises && report.data.entreprises.length > 0) {
                worksheet.addRow(['ENTREPRISES']);
                worksheet.addRow(['Nom', 'Région', 'Secteur', 'Statut']);
                report.data.entreprises.forEach(ent => {
                    worksheet.addRow([
                        ent.identification?.nomEntreprise || ent.nom || 'Non spécifié',
                        ent.identification?.region || 'N/A',
                        ent.identification?.secteurActivite || 'N/A',
                        ent.statut || 'N/A'
                    ]);
                });
                worksheet.addRow([]);
            }

            // Indicateurs
            if (report.data.indicators && report.data.indicators.length > 0) {
                worksheet.addRow(['INDICATEURS']);
                worksheet.addRow(['Nom', 'Type', 'Valeur actuelle', 'Objectif']);
                report.data.indicators.forEach(ind => {
                    worksheet.addRow([
                        ind.name || 'Indicateur',
                        ind.type || 'N/A',
                        ind.currentValue || 'N/A',
                        ind.target || 'N/A'
                    ]);
                });
                worksheet.addRow([]);
            }

            // KPIs
            if (report.data.kpis && report.data.kpis.length > 0) {
                worksheet.addRow(['KPIs']);
                worksheet.addRow(['Nom', 'Catégorie', 'Valeur', 'Cible']);
                report.data.kpis.forEach(kpi => {
                    worksheet.addRow([
                        kpi.name || 'KPI',
                        kpi.category || 'N/A',
                        kpi.value || 'N/A',
                        kpi.target || 'N/A'
                    ]);
                });
                worksheet.addRow([]);
            }

            // Visites
            if (report.data.visits && report.data.visits.length > 0) {
                worksheet.addRow(['VISITES']);
                worksheet.addRow(['Date', 'Type', 'Statut']);
                report.data.visits.forEach(visit => {
                    worksheet.addRow([
                        new Date(visit.scheduledAt).toLocaleDateString(),
                        visit.type || 'N/A',
                        visit.status || 'N/A'
                    ]);
                });
                worksheet.addRow([]);
            }
        } else {
            worksheet.addRow(['Aucune donnée disponible pour cette période.']);
        }

        // Sauvegarder le fichier
        await workbook.xlsx.writeFile(filePath);

    } catch (error) {
        throw error;
    }
}

module.exports = {
    generateExcel
};
