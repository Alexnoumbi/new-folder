const Excel = require('exceljs');

async function generateExcel(report, filePath, includeCharts) {
    try {
        const workbook = new Excel.Workbook();
        const worksheet = workbook.addWorksheet('Rapport');

        // En-tête du rapport
        worksheet.addRow(['RAPPORT']);
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

        // Si on inclut les graphiques
        if (includeCharts) {
            worksheet.addRow(['GRAPHIQUES']);
            worksheet.addRow([]);
            // TODO: Ajouter la logique pour les graphiques
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
