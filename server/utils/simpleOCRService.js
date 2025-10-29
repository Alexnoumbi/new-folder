/**
 * Service OCR simple pour extraction de texte des images
 * Utilise Tesseract.js (déjà installé)
 */

const Tesseract = require('tesseract.js');
const path = require('path');

class SimpleOCRService {
    constructor() {
        this.supportedLanguages = ['fra', 'eng'];
    }

    /**
     * Extraction de texte simple
     */
    async extractText(imagePath, language = 'fra+eng') {
        try {
            console.log(`Extraction de texte depuis: ${imagePath}`);
            
            const { data: { text } } = await Tesseract.recognize(
                imagePath,
                language,
                {
                    logger: m => console.log(m.status, m.progress)
                }
            );

            return {
                success: true,
                text: text.trim(),
                language: language,
                extractedAt: new Date()
            };
        } catch (error) {
            console.error('Erreur OCR:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Extraction avec analyse basique du contenu
     */
    async extractAndAnalyze(imagePath, documentType = 'general') {
        try {
            const ocrResult = await this.extractText(imagePath);
            
            if (!ocrResult.success) {
                return ocrResult;
            }

            const analysis = this.analyzeContent(ocrResult.text, documentType);

            return {
                success: true,
                text: ocrResult.text,
                analysis: analysis,
                documentType: documentType
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Analyse basique du contenu
     */
    analyzeContent(text, documentType) {
        const analysis = {
            wordCount: text.split(' ').filter(word => word.length > 0).length,
            lineCount: text.split('\n').length,
            extractedData: {}
        };

        // Recherche de données communes
        analysis.extractedData.emails = this.extractEmails(text);
        analysis.extractedData.phones = this.extractPhones(text);
        analysis.extractedData.dates = this.extractDates(text);
        analysis.extractedData.amounts = this.extractAmounts(text);

        // Analyse spécifique selon le type
        switch (documentType) {
            case 'facture':
                analysis.extractedData.invoiceData = this.extractInvoiceData(text);
                break;
            case 'kpi':
                analysis.extractedData.kpiData = this.extractKPIData(text);
                break;
            case 'rapport':
                analysis.extractedData.reportData = this.extractReportData(text);
                break;
        }

        return analysis;
    }

    /**
     * Extraction d'emails
     */
    extractEmails(text) {
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        return text.match(emailRegex) || [];
    }

    /**
     * Extraction de téléphones
     */
    extractPhones(text) {
        const phoneRegex = /(\+33|0)[1-9](\d{8}|\s\d{2}\s\d{2}\s\d{2}\s\d{2})/g;
        return text.match(phoneRegex) || [];
    }

    /**
     * Extraction de dates
     */
    extractDates(text) {
        const dateRegex = /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/g;
        return text.match(dateRegex) || [];
    }

    /**
     * Extraction de montants
     */
    extractAmounts(text) {
        const amountRegex = /(\d+[,.]?\d*)\s*€?/g;
        return text.match(amountRegex) || [];
    }

    /**
     * Extraction de données de facture
     */
    extractInvoiceData(text) {
        const invoiceRegex = /(facture|invoice|n°|num)\s*:?\s*(\w+)/gi;
        const invoiceNumbers = text.match(invoiceRegex) || [];
        
        return {
            invoiceNumbers: invoiceNumbers,
            type: 'facture'
        };
    }

    /**
     * Extraction de données KPI
     */
    extractKPIData(text) {
        const percentageRegex = /(\d+[,.]?\d*)\s*%/g;
        const percentages = text.match(percentageRegex) || [];
        
        const kpiKeywords = ['performance', 'objectif', 'résultat', 'croissance', 'chiffre'];
        const foundKeywords = kpiKeywords.filter(keyword => 
            text.toLowerCase().includes(keyword.toLowerCase())
        );

        return {
            percentages: percentages,
            keywords: foundKeywords,
            type: 'kpi'
        };
    }

    /**
     * Extraction de données de rapport
     */
    extractReportData(text) {
        const businessKeywords = ['chiffre d\'affaires', 'bénéfice', 'perte', 'croissance', 'performance'];
        const foundKeywords = businessKeywords.filter(keyword => 
            text.toLowerCase().includes(keyword.toLowerCase())
        );

        return {
            businessKeywords: foundKeywords,
            type: 'rapport'
        };
    }
}

module.exports = SimpleOCRService;
