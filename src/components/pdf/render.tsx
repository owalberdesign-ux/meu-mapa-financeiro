import { pdf } from "@react-pdf/renderer";
import type { Diagnostic } from "@/types/diagnostic";
import { ReportDocument } from "@/components/pdf/ReportDocument";
import { registerFonts } from "@/components/pdf/theme";

/** Gera o PDF no navegador. Carregado sob demanda: não pesa na landing. */
export async function renderReportPdf(diagnostic: Diagnostic, origin: string, reportUrl: string): Promise<Blob> {
  registerFonts(origin);
  return pdf(<ReportDocument diagnostic={diagnostic} reportUrl={reportUrl} />).toBlob();
}
