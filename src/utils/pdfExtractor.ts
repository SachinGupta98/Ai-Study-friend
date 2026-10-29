/**
 * pdfExtractor.ts — Client-side PDF & Text File Extractor
 */
import * as pdfjsLib from 'pdfjs-dist';

// Configure worker using CDN to ensure compatibility in Vite bundling
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export interface ExtractedDoc {
    name: string;
    text: string;
    pageCount: number;
    wordCount: number;
}

export const extractTextFromPdf = async (file: File): Promise<ExtractedDoc> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const pageTexts: string[] = [];

    // Extract first 40 pages max to keep prompt size manageable
    const maxPages = Math.min(pdf.numPages, 40);

    for (let i = 1; i <= maxPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageString = textContent.items
            .map((item: any) => item.str || '')
            .join(' ');
        pageTexts.push(`--- Page ${i} ---\n${pageString}`);
    }

    const fullText = pageTexts.join('\n\n');
    const wordCount = fullText.split(/\s+/).filter(Boolean).length;

    return {
        name: file.name,
        text: fullText,
        pageCount: pdf.numPages,
        wordCount,
    };
};

export const extractTextFromFile = async (file: File): Promise<ExtractedDoc> => {
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        return extractTextFromPdf(file);
    }

    // Handle plain text, markdown, code, etc.
    const text = await file.text();
    const wordCount = text.split(/\s+/).filter(Boolean).length;

    return {
        name: file.name,
        text,
        pageCount: 1,
        wordCount,
    };
};
