import React, { useState } from 'react';
import { SignalEvent } from '../types/trading';
import { CheckCircle2, XCircle, TrendingUp, TrendingDown, Award, Copy, Check, Trash2, Slash, RefreshCw, FileDown } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface SignalHistoryFeedProps {
  signals: SignalEvent[];
  onCopySignal: (signal: SignalEvent) => void;
  onClearHistory?: () => void;
  onOverrideResult?: (signalId: string, status: 'win' | 'loss' | 'mtg_win' | 'refund' | 'avoided') => void;
}

export const SignalHistoryFeed: React.FC<SignalHistoryFeedProps> = ({
  signals,
  onCopySignal,
  onClearHistory,
  onOverrideResult,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (sig: SignalEvent) => {
    onCopySignal(sig);
    setCopiedId(sig.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleClearAllHistory = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onClearHistory) {
      onClearHistory();
    }
    fetch('/api/signals/clear-history', { method: 'POST' }).catch(() => {});
  };

  const handleCycleStatus = (sig: SignalEvent) => {
    if (!onOverrideResult) return;
    const nextStatus: Record<string, 'win' | 'loss' | 'mtg_win' | 'refund' | 'avoided'> = {
      loss: 'win',
      win: 'mtg_win',
      mtg_win: 'refund',
      refund: 'avoided',
      avoided: 'loss',
      active: 'win',
      pre_alert: 'win',
    };
    const target = nextStatus[sig.status] || 'win';
    onOverrideResult(sig.id, target);
  };

  // =========================================================================
  // 📄 BEAUTIFUL PDF GENERATOR ENGINE
  // =========================================================================
  const handleDownloadPDF = () => {
    if (signals.length === 0) {
      alert("No signals available to generate a report.");
      return;
    }

    const doc = new jsPDF();
    
    // Calculate Report Stats
    const validTrades = signals.filter((s) => ['win', 'loss', 'mtg_win'].includes(s.status));
    const wins = signals.filter((s) => s.status === 'win').length;
    const mtgWins = signals.filter((s) => s.status === 'mtg_win').length;
    const losses = signals.filter((s) => s.status === 'loss').length;
    const avoided = signals.filter((s) => s.status === 'avoided').length;
    const accuracy = validTrades.length > 0 ? (((wins + mtgWins) / validTrades.length) * 100).toFixed(1) : '0.0';

    // 1. Draw Top Dark Header Background
    doc.setFillColor(19, 19, 22); // Dark Charcoal (#131316)
    doc.rect(0, 0, 210, 40, 'F');

    // 2. Add Branding Title
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("FNx SIGNAL PRO", 14, 20);
    
    // Add Subtitle
    doc.setTextColor(124, 108, 239); // Vibrant Purple (#7c6cef)
    doc.setFontSize(10);
    doc.text("VIP INSTITUTIONAL TRADING REPORT", 14, 28);

    // 3. Try to Load App Logo into PDF
    const img = new Image();
    img.src = '/quotex.png';
    img.onload = () => {
      doc.addImage(img, 'PNG', 176, 10, 20, 20); // Position Logo at Top Right
      generateTableData(doc);
    };
    img.onerror = () => {
      // If logo fails to load, generate PDF anyway
      generateTableData(doc);
    };

    function generateTableData(pdfDoc: jsPDF) {
      // 4. Add Report Stats Summary
      pdfDoc.setTextColor(40, 40, 48); // Dark Grey for text
      pdfDoc.setFontSize(11);
      pdfDoc.setFont("helvetica", "normal");
      
      const dateStr = new Date().toLocaleString();
      pdfDoc.text(`Date Generated: ${dateStr}`, 14, 55);
      
      pdfDoc.setFont("helvetica", "bold");
      pdfDoc.text(`Overall Accuracy: ${accuracy}%`, 14, 63);
      
      pdfDoc.setFont("helvetica", "normal");
      pdfDoc.text(`Total Signals: ${signals.length}  |  Wins: ${wins}  |  1-MTG Wins: ${mtgWins}  |  Losses: ${losses}  |  Avoided: ${avoided}`, 14, 71);

      // 5. Build Table Data
      const tableColumn = ["Time", "Asset Pair", "Direction", "Confluence", "Strike Price", "Result"];
      const tableRows = signals.map((sig) => {
        const time = new Date(sig.entryTime).toLocaleTimeString();
        let resText = sig.status.toUpperCase();
        if (resText === 'MTG_WIN') resText = '1-STEP MTG';
        
        return [
          time, 
          sig.assetName, 
          sig.direction, 
          `${sig.confidence}%`, 
          sig.entryPrice.toString(), 
          resText
        ];
      });

      // 6. Draw Table
      autoTable(pdfDoc, {
        startY: 78,
        head: [tableColumn],
        body: tableRows,
        theme: 'grid',
        headStyles: { 
          fillColor: [124, 108, 239], // Purple Header
          textColor: [255, 255, 255], 
          fontStyle: 'bold' 
        },
        styles: { 
          font: 'helvetica', 
          fontSize: 10, 
          cellPadding: 4 
        },
        alternateRowStyles: { fillColor: [247, 247, 250] },
        
        // Colorize the Result Column dynamically
        didParseCell: function (data) {
          if (data.section === 'body' && data.column.index === 5) {
             const text = data.cell.raw as string;
             if (text === 'WIN' || text === '1-STEP MTG') {
               data.cell.styles.textColor = [16, 185, 129]; // Emerald Green
               data.cell.styles.fontStyle = 'bold';
             }
             else if (text === 'LOSS') {
               data.cell.styles.textColor = [244, 63, 94]; // Rose Red
               data.cell.styles.fontStyle = 'bold';
             }
             else if (text === 'AVOIDED') {
               data.cell.styles.textColor = [245, 158, 11]; // Amber Orange
               data.cell.styles.fontStyle = 'bold';
             }
          }
        }
      });

      // 7. Save the File
      const dateName = new Date().toISOString().split('T')[0];
      pdfDoc.save(`FNx_Trading_Report_${dateName}.pdf`);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 rounded-xl border border-[#282834] bg-[#1c1c24] p-3 sm:p-4 overflow-hidden shadow-xl">
      {/* Feed Header */}
      <div className="shrink-0 flex items-center justify-between pb-2 border-b border-[#282834]">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-white tracking-wide">Live Signal Feed</h3>
          <span className="text-xs text-[#7c6cef] font-mono font-bold">({signals.length} Signals)</span>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-[11px] text-[#9e9eb0] font-mono hidden sm:block mr-2">
            Click result badge to sync broker outcome
          </span>

          {/* 📄 PDF Report Button */}
          {signals.length > 0 && (
            <button
              type="button"
              onClick={handleDownloadPDF}
              title="Download VIP Report PDF"
              className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#7c6cef]/15 border border-[#7c6cef]/40 hover:bg-[#7c6cef] text-[#7c6cef] hover:text-white text-xs font-semibold transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Export PDF</span>
            </button>
          )}

          {/* 🗑️ Clear All Button */}
          {signals.length > 0 && (
            <button
              type="button"
              onClick={handleClearAllHistory}
              title="Delete all signal history"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#131316] border border-[#282834] hover:border-rose-500/60 hover:text-rose-400 text-[#9e9eb0] text-xs font-semibold transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear All</span>
            </button>
          )}
        </div>
      </div>

      {/* Internal Scrollable Table Body */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto mt-1">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="sticky top-0 bg-[#1c1c24] z-10">
            <tr className="border-b border-[#282834] text-[#9e9eb0] font-medium">
              <th className="py-2 px-3">Time</th>
              <th className="py-2 px-3">Asset</th>
              <th className="py-2 px-3">Signal</th>
              <th className="py-2 px-3 text-center">Accuracy</th>
              <th className="py-2 px-3 text-center">Result</th>
              <th className="py-2 px-3 text-right">Copy</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#282834] font-mono tabular-nums">
            {signals.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-[#9e9eb0] font-sans">
                  No signal history available. Table cleared.
                </td>
              </tr>
            ) : (
              signals.map((sig) => {
                const date = new Date(sig.entryTime);
                const timeStr = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
                const isCall = sig.direction === 'CALL';
                const isCopied = copiedId === sig.id;

                return (
                  <tr key={sig.id} className="hover:bg-[#131316]/50 transition-colors">
                    <td className="py-2 px-3 text-[#9e9eb0]">{timeStr}</td>
                    <td className="py-2 px-3 font-sans font-bold text-white whitespace-nowrap">
                      {sig.assetName}
                    </td>
                    <td className="py-2 px-3">
                      <span
                        className={`inline-flex items-center gap-1 font-bold ${
                          isCall ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isCall ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        {sig.direction}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center text-[#7c6cef] font-bold">
                      {sig.confidence}%
                    </td>
                    <td className="py-2 px-3 text-center font-sans">
                      <button
                        onClick={() => handleCycleStatus(sig)}
                        title="Click to toggle status"
                        className="cursor-pointer group transition-transform active:scale-95"
                      >
                        {sig.status === 'win' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" /> WIN
                          </span>
                        ) : sig.status === 'mtg_win' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            <Award className="w-3 h-3" /> 1-MTG
                          </span>
                        ) : sig.status === 'loss' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                            <XCircle className="w-3 h-3" /> LOSS
                          </span>
                        ) : sig.status === 'avoided' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                            <Slash className="w-3 h-3" /> AVOIDED
                          </span>
                        ) : sig.status === 'refund' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#131316] text-[#9e9eb0] border border-[#282834]">
                            <RefreshCw className="w-3 h-3" /> REFUND
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-[#131316] text-[#9e9eb0]">
                            PENDING
                          </span>
                        )}
                      </button>
                    </td>
                    <td className="py-2 px-3 text-right">
                      <button
                        onClick={() => handleCopy(sig)}
                        className="p-1 rounded text-[#9e9eb0] hover:text-white transition-colors cursor-pointer"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};