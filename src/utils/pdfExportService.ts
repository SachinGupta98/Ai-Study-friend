/**
 * pdfExportService.ts — Generates clean, textbook-quality PDF study notes
 */
import jsPDF from 'jspdf';
import { ChatMessage } from '../types';

// Convert raw LaTeX commands and emojis into clean unicode / ASCII representation for PDF rendering
const formatMathForPdf = (raw: string): string => {
    return raw
        // Fractions: \frac{a}{b} -> (a / b)
        .replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '($1 / $2)')
        // Square roots: \sqrt{x} -> √(x)
        .replace(/\\sqrt\{([^{}]+)\}/g, '√($1)')
        .replace(/\\sqrt\[([^{}]+)\]\{([^{}]+)\}/g, '$1√($2)')
        // Common math operators & symbols
        .replace(/\\times/g, ' × ')
        .replace(/\\cdot/g, ' · ')
        .replace(/\\pm/g, ' ± ')
        .replace(/\\mp/g, ' ∓ ')
        .replace(/\\leq/g, ' <= ')
        .replace(/\\geq/g, ' >= ')
        .replace(/\\neq/g, ' != ')
        .replace(/\\approx/g, ' ≈ ')
        .replace(/\\infty/g, ' ∞ ')
        .replace(/\\int/g, ' ∫ ')
        .replace(/\\sum/g, ' ∑ ')
        .replace(/\\Delta/g, 'Δ')
        .replace(/\\theta/g, 'θ')
        .replace(/\\pi/g, 'π')
        .replace(/\\alpha/g, 'α')
        .replace(/\\beta/g, 'β')
        .replace(/\\gamma/g, 'γ')
        .replace(/\\lambda/g, 'λ')
        .replace(/\\mu/g, 'μ')
        .replace(/\\sigma/g, 'σ')
        .replace(/\\omega/g, 'ω')
        .replace(/\\rightarrow/g, ' -> ')
        .replace(/\\leftarrow/g, ' <- ')
        .replace(/\\quad/g, ' ')
        .replace(/\\qquad/g, '   ')
        .replace(/\\text\{([^{}]+)\}/g, '$1')
        .replace(/\\mathbf\{([^{}]+)\}/g, '$1')
        .replace(/\\mathit\{([^{}]+)\}/g, '$1')
        .replace(/\\vec\{([^{}]+)\}/g, 'vec($1)')
        // Strip remaining math delimiters
        .replace(/\$\$/g, '\n')
        .replace(/\$/g, '')
        // Clean markdown bold / italics for plain pdf text
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/```(?:[a-z]+)?\n?/gi, '\n')
        .replace(/`/g, '')
        // Replace emojis with clean textual headers/bullets for standard PDF fonts
        .replace(/📌/g, '• [Core Concept] ')
        .replace(/💡/g, '• [Analogy] ')
        .replace(/📐/g, '• [Formula & Principle] ')
        .replace(/📝/g, '• [Step-by-Step] ')
        .replace(/⚠️/g, '• [Caution / Trap] ')
        .replace(/🎯/g, '• [Exam Tip] ')
        .replace(/🧠/g, '• [Concept Check] ')
        .replace(/🚀/g, '• ')
        .replace(/✨/g, '• ');
};

export const exportChatToPdf = (
    messages: ChatMessage[],
    subject: string,
    curriculum: string,
    sessionTitle?: string
) => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 18;
    const contentWidth = pageWidth - (margin * 2);
    let y = margin;

    // Helper: Add page break if needed
    const ensureSpace = (neededHeight: number) => {
        if (y + neededHeight > pageHeight - margin - 15) {
            doc.addPage();
            y = margin + 8;
            drawPageHeader();
        }
    };

    // Header on every subsequent page
    const drawPageHeader = () => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(140, 150, 170);
        doc.text(`Vidya AI Study Notes • ${subject} (${curriculum})`, margin, margin - 4);
        doc.setDrawColor(220, 225, 235);
        doc.line(margin, margin - 2, pageWidth - margin, margin - 2);
    };

    // ── First Page Header Banner ───────────────────────────────────────────────
    // Top gradient accent bar
    doc.setFillColor(14, 165, 233); // Cyan 500
    doc.rect(margin, y, contentWidth, 2.5, 'F');
    y += 8;

    // Brand Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42); // Slate 900
    doc.text('Vidya AI — Study Session Notes', margin, y);
    y += 7;

    // Subject & Meta pill
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(71, 85, 105); // Slate 600
    const dateStr = new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    doc.text(`Subject: ${subject}   |   Curriculum: ${curriculum}   |   Exported: ${dateStr}`, margin, y);
    y += 4;

    // Divider line
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    // ── Render Chat Messages ──────────────────────────────────────────────────
    let questionCount = 0;
    messages.forEach((msg) => {
        const isUser = msg.role === 'user';
        const rawContent = msg.text || '';
        const cleanContent = formatMathForPdf(rawContent);

        if (isUser) questionCount++;

        ensureSpace(14);

        // Header for message
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);

        if (isUser) {
            doc.setTextColor(2, 132, 199); // Blue 600
            doc.text(`Student Question #${questionCount}:`, margin, y);
        } else {
            doc.setTextColor(15, 118, 110); // Teal 700
            doc.text('Vidya AI Textbook Explanation:', margin, y);
        }
        y += 5.5;

        // Content
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(30, 41, 59); // Slate 800

        const lines = doc.splitTextToSize(cleanContent, contentWidth - 8);

        lines.forEach((line: string) => {
            ensureSpace(5.5);
            // Draw a clean left colored border accent line for each row to look like a textbook callout
            doc.setDrawColor(isUser ? 2 : 13, isUser ? 132 : 148, isUser ? 199 : 136);
            doc.setLineWidth(1.2);
            doc.line(margin, y - 3, margin, y + 2);

            doc.text(line, margin + 4, y);
            y += 5;
        });

        y += 5; // Spacing after block
    });

    // ── Footer on all pages ───────────────────────────────────────────────────
    const totalPages = (doc.internal as any).getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184); // Slate 400
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.4);
        doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
        doc.text('Vidya AI • Smart Study Assistant', margin, pageHeight - 7);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 18, pageHeight - 7);
    }

    // Save PDF
    const cleanFileName = `VidyaAI_${subject.replace(/[^a-zA-Z0-9]/g, '_')}_Notes.pdf`;
    doc.save(cleanFileName);
};
