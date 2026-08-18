import { Document as DocxDocument, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import { pdf, Document as PdfDocument, Page, Text, StyleSheet, View } from '@react-pdf/renderer';
import React from 'react';

// Very basic heuristic parser to turn raw text lines into structured elements
type LineType = 'header' | 'bullet' | 'contact' | 'name' | 'normal';

interface ParsedLine {
  text: string;
  type: LineType;
}

export function parseLines(lines: string[]): ParsedLine[] {
  return lines.map((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) return { text: '', type: 'normal' };

    if (index === 0) return { text: trimmed, type: 'name' };
    
    // Check if it's contact info (usually lines 1-3, containing typical contact chars)
    if (index > 0 && index < 4 && (trimmed.includes('@') || trimmed.includes('linkedin') || trimmed.includes('github') || trimmed.includes('+'))) {
      return { text: trimmed, type: 'contact' };
    }

    // Check if it's a section header (all caps, short)
    if (trimmed.length < 35 && trimmed === trimmed.toUpperCase() && !trimmed.match(/[a-z]/)) {
      return { text: trimmed, type: 'header' };
    }

    // Check if it's a bullet
    if (trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.startsWith('*')) {
      return { text: trimmed.substring(1).trim(), type: 'bullet' };
    }

    return { text: trimmed, type: 'normal' };
  });
}

// DOCX Export
export async function exportToDocx(lines: string[], fileName: string) {
  const parsed = parseLines(lines);

  const children = parsed.map(item => {
    switch (item.type) {
      case 'name':
        return new Paragraph({
          children: [new TextRun({ text: item.text, bold: true, size: 36 })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 }
        });
      case 'contact':
        return new Paragraph({
          children: [new TextRun({ text: item.text, size: 20 })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 }
        });
      case 'header':
        return new Paragraph({
          children: [new TextRun({ text: item.text, bold: true, size: 24, color: '333333' })],
          spacing: { before: 300, after: 100 },
          heading: HeadingLevel.HEADING_2
        });
      case 'bullet':
        return new Paragraph({
          children: [new TextRun({ text: item.text, size: 22 })],
          bullet: { level: 0 }
        });
      default:
        return new Paragraph({
          children: [new TextRun({ text: item.text, size: 22 })],
          spacing: { after: 100 }
        });
    }
  });

  const doc = new DocxDocument({
    sections: [{
      properties: {},
      children: children
    }]
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${fileName}.docx`);
}

// PDF Export (React-PDF)
const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', color: '#111' },
  name: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 6 },
  contact: { fontSize: 9, textAlign: 'center', marginBottom: 4, color: '#444' },
  header: { fontSize: 12, fontWeight: 'bold', marginTop: 12, marginBottom: 4, borderBottom: '1px solid #ccc', textTransform: 'uppercase' },
  bulletContainer: { flexDirection: 'row', marginBottom: 3, paddingLeft: 8 },
  bulletPoint: { width: 10, fontSize: 10 },
  bulletText: { fontSize: 10, flex: 1, lineHeight: 1.4 },
  normal: { fontSize: 10, marginBottom: 4, lineHeight: 1.4 }
});

const PdfTemplate = ({ lines }: { lines: string[] }) => {
  const parsed = parseLines(lines);

  return (
    <PdfDocument>
      <Page style={styles.page}>
        {parsed.map((item, i) => {
          if (!item.text) return null;
          switch (item.type) {
            case 'name': return <Text key={i} style={styles.name}>{item.text}</Text>;
            case 'contact': return <Text key={i} style={styles.contact}>{item.text}</Text>;
            case 'header': return <Text key={i} style={styles.header}>{item.text}</Text>;
            case 'bullet': return (
              <View key={i} style={styles.bulletContainer}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={styles.bulletText}>{item.text}</Text>
              </View>
            );
            default: return <Text key={i} style={styles.normal}>{item.text}</Text>;
          }
        })}
      </Page>
    </PdfDocument>
  );
};

export async function exportToPdf(lines: string[], fileName: string) {
  const blob = await pdf(React.createElement(PdfTemplate, { lines })).toBlob();
  saveAs(blob, `${fileName}.pdf`);
}
