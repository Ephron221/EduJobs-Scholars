import React, { useState } from 'react';
import {
  Download,
  Copy,
  Check,
  ShieldCheck,
  GraduationCap,
  Building2,
  Mail,
  Phone,
  FileText,
  Clock,
  AlertCircle,
  QrCode,
  Sparkles,
  Ban,
  Activity,
} from 'lucide-react';
import toast from 'react-hot-toast';

export type DecisionType = 'admitted' | 'conditional' | 'pending' | 'waitlisted' | 'rejected' | 'suspended' | 'graduated';

export const resolveDecisionType = (rawDecision: string = ''): DecisionType => {
  const d = rawDecision.toLowerCase().trim();
  if (d.includes('reject') || d.includes('not admitted') || d.includes('declined') || d.includes('denied')) {
    return 'rejected';
  }
  if (d.includes('suspend')) {
    return 'suspended';
  }
  if (d.includes('graduate')) {
    return 'graduated';
  }
  if (d.includes('conditional')) {
    return 'conditional';
  }
  if (d.includes('waitlist')) {
    return 'waitlisted';
  }
  if (d.includes('review') || d.includes('pending')) {
    return 'pending';
  }
  if (d.includes('admit') || d.includes('accept') || d.includes('approved') || d.includes('active')) {
    return 'admitted';
  }
  return 'admitted';
};

export interface AdmissionCardData {
  fullName: string;
  institution: string;
  registrationNumber: string;
  trackingCode: string;
  email: string;
  phoneNumber: string;
  nationalId: string;
  admissionDecision: string;
  status?: 'admitted' | 'active' | 'pending' | 'suspended' | 'graduated' | 'rejected' | 'not_admitted' | string;
  remarks?: string;
  level?: string;
  admissionDate?: string;
  decisionSentAt?: string;
  decisionSentBy?: string;
}

interface Props {
  data: AdmissionCardData;
  onSendEmail?: () => void;
  isSendingEmail?: boolean;
}

export default function StudentAdmissionCard({ data, onSendEmail, isSendingEmail }: Props) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    toast.success(`${label} copied to clipboard!`);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const decisionType = resolveDecisionType(data.admissionDecision);

  const getDecisionBadge = () => {
    switch (decisionType) {
      case 'rejected':
        return {
          bg: 'bg-rose-500/15 border-rose-500/30 text-rose-400',
          dot: 'bg-rose-400',
          text: 'Not Admitted / Rejected',
          textColorClass: 'text-rose-400',
          icon: <Ban size={15} className="text-rose-400" />,
          pdfBg: '#fef2f2',
          pdfText: '#b91c1c',
          pdfBorder: '#fca5a5',
        };
      case 'suspended':
        return {
          bg: 'bg-red-500/20 border-red-500/40 text-red-400',
          dot: 'bg-red-400',
          text: 'Student Suspended',
          textColorClass: 'text-red-400',
          icon: <Ban size={15} className="text-red-400" />,
          pdfBg: '#fef2f2',
          pdfText: '#b91c1c',
          pdfBorder: '#fca5a5',
        };
      case 'graduated':
        return {
          bg: 'bg-purple-500/15 border-purple-500/30 text-purple-300',
          dot: 'bg-purple-400',
          text: 'Graduated / Alumnus',
          textColorClass: 'text-purple-300',
          icon: <GraduationCap size={15} className="text-purple-400" />,
          pdfBg: '#faf5ff',
          pdfText: '#6b21a8',
          pdfBorder: '#d8b4fe',
        };
      case 'conditional':
        return {
          bg: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
          dot: 'bg-amber-400',
          text: 'Conditional Offer',
          textColorClass: 'text-amber-400',
          icon: <AlertCircle size={15} className="text-amber-400" />,
          pdfBg: '#fffbeb',
          pdfText: '#b45309',
          pdfBorder: '#fde68a',
        };
      case 'waitlisted':
        return {
          bg: 'bg-blue-500/15 border-blue-500/30 text-blue-300',
          dot: 'bg-blue-400',
          text: 'Waitlisted (Next Intake)',
          textColorClass: 'text-blue-300',
          icon: <Clock size={15} className="text-blue-400" />,
          pdfBg: '#eff6ff',
          pdfText: '#1d4ed8',
          pdfBorder: '#bfdbfe',
        };
      case 'pending':
        return {
          bg: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300',
          dot: 'bg-cyan-400',
          text: 'Under Review',
          textColorClass: 'text-cyan-300',
          icon: <Clock size={15} className="text-cyan-400" />,
          pdfBg: '#f0f9ff',
          pdfText: '#0369a1',
          pdfBorder: '#bae6fd',
        };
      case 'admitted':
      default:
        return {
          bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
          dot: 'bg-emerald-400',
          text: 'Admitted / Accepted',
          textColorClass: 'text-emerald-400',
          icon: <ShieldCheck size={15} className="text-emerald-400" />,
          pdfBg: '#f0fdf4',
          pdfText: '#15803d',
          pdfBorder: '#86efac',
        };
    }
  };

  const badge = getDecisionBadge();
  const initials = data.fullName
    ? data.fullName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0])
        .join('')
        .toUpperCase()
    : 'ES';

  // Professional Printable / Save-as-PDF generator
  const handleDownloadPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Pop-up blocked! Please allow pop-ups to download the official PDF.');
      return;
    }

    const decisionBgColor = badge.pdfBg;
    const decisionTextColor = badge.pdfText;
    const decisionBorderColor = badge.pdfBorder;
    const displayDecisionText = badge.text;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Admission_Decision_${data.registrationNumber || 'Student'}_${data.fullName.replace(/\s+/g, '_')}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 12mm 15mm;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background: #ffffff;
            color: #0f172a;
            margin: 0;
            padding: 0;
          }
          .pdf-sheet {
            max-width: 800px;
            margin: 0 auto;
            border: 2px solid #0f172a;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          }
          .pdf-header {
            background: #0f2744;
            color: #ffffff;
            padding: 26px 32px;
            text-align: center;
            border-bottom: 3px solid #0284c7;
          }
          .badge-pill {
            display: inline-block;
            background: rgba(255, 255, 255, 0.15);
            border: 1px solid rgba(255, 255, 255, 0.3);
            color: #7dd3fc;
            padding: 4px 14px;
            border-radius: 9999px;
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            margin-bottom: 8px;
          }
          .pdf-header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 900;
            letter-spacing: -0.5px;
          }
          .pdf-header p {
            margin: 4px 0 0 0;
            color: #cbd5e1;
            font-size: 13px;
            font-weight: 500;
          }
          .institution-banner {
            background: #f8fafc;
            padding: 14px 32px;
            border-bottom: 1px solid #cbd5e1;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .institution-name {
            font-size: 17px;
            font-weight: 800;
            color: #0369a1;
          }
          .decision-tag {
            background: ${decisionBgColor};
            border: 1.5px solid ${decisionBorderColor};
            color: ${decisionTextColor};
            padding: 5px 16px;
            border-radius: 9999px;
            font-weight: 800;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.8px;
          }
          .body-content {
            padding: 24px 32px;
          }
          .student-banner {
            display: flex;
            align-items: center;
            gap: 18px;
            padding-bottom: 18px;
            border-bottom: 1.5px dashed #cbd5e1;
            margin-bottom: 20px;
          }
          .avatar-circle {
            width: 58px;
            height: 58px;
            border-radius: 50%;
            background: #0284c7;
            color: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 22px;
            font-weight: 900;
            flex-shrink: 0;
          }
          .student-name {
            font-size: 20px;
            font-weight: 900;
            color: #0f172a;
            margin: 0;
          }
          .student-sub {
            color: #64748b;
            font-size: 12px;
            margin: 4px 0 0 0;
            font-weight: 600;
          }
          .credentials-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 14px;
            margin-bottom: 20px;
          }
          .cred-box {
            background: #f8fafc;
            border: 1.5px solid #e2e8f0;
            border-radius: 10px;
            padding: 12px 16px;
          }
          .cred-box.highlight-reg {
            background: #f0fdf4;
            border-color: #86efac;
          }
          .cred-box.highlight-pin {
            background: #f0f9ff;
            border-color: #7dd3fc;
          }
          .cred-label {
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            color: #64748b;
            margin-bottom: 4px;
          }
          .cred-box.highlight-reg .cred-label { color: #166534; }
          .cred-box.highlight-pin .cred-label { color: #0369a1; }
          .cred-val {
            font-size: 16px;
            font-weight: 900;
            color: #0f172a;
            font-family: 'Courier New', Courier, monospace;
          }
          .cred-box.highlight-reg .cred-val { color: #15803d; }
          .cred-box.highlight-pin .cred-val { color: #0284c7; }
          .info-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 13px;
          }
          .info-table td {
            padding: 9px 12px;
            border-bottom: 1px solid #e2e8f0;
          }
          .info-table td:first-child {
            color: #64748b;
            font-weight: 700;
            width: 36%;
          }
          .info-table td:last-child {
            color: #0f172a;
            font-weight: 700;
          }
          .remarks-box {
            background: #fffbeb;
            border: 1px solid #fde68a;
            border-radius: 10px;
            padding: 14px 18px;
            margin-bottom: 20px;
          }
          .remarks-title {
            font-size: 11px;
            font-weight: 800;
            color: #92400e;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            margin-bottom: 4px;
          }
          .remarks-body {
            font-size: 12.5px;
            color: #78350f;
            line-height: 1.5;
            white-space: pre-line;
          }
          .footer-section {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-top: 16px;
            border-top: 1.5px dashed #cbd5e1;
            font-size: 11px;
            color: #64748b;
          }
          .security-barcode {
            font-family: 'Courier New', monospace;
            font-size: 11px;
            letter-spacing: 3px;
            font-weight: 900;
            color: #0f172a;
            padding: 3px 6px;
            border: 1px solid #cbd5e1;
            background: #f8fafc;
            border-radius: 4px;
          }
          .stamp-box {
            text-align: right;
          }
          .stamp-box .seal {
            font-weight: 900;
            color: #0369a1;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
        </style>
      </head>
      <body>
        <div class="pdf-sheet">
          <div class="pdf-header">
            <div class="badge-pill">Official Academic Credential</div>
            <h1>EduJobs Scholars</h1>
            <p>Admissions &amp; Academic Records Directorate &bull; Kigali, Rwanda</p>
          </div>

          <div class="institution-banner">
            <div class="institution-name">🎓 ${data.institution || 'Partner University'}</div>
            <div class="decision-tag">${displayDecisionText.toUpperCase()}</div>
          </div>

          <div class="body-content">
            <div class="student-banner">
              <div class="avatar-circle">${initials}</div>
              <div>
                <h2 class="student-name">${data.fullName}</h2>
                <p class="student-sub">National ID / Passport: <strong>${data.nationalId || 'N/A'}</strong> &bull; Level: <strong>${data.level || 'Level 1'}</strong> &bull; Status: <strong>${(data.status || 'Active').toUpperCase()}</strong></p>
              </div>
            </div>

            <!-- Prominent Registration & PIN Grid -->
            <div class="credentials-grid">
              <div class="cred-box highlight-reg">
                <div class="cred-label">University Reg Number (Official)</div>
                <div class="cred-val">${data.registrationNumber || 'Pending'}</div>
              </div>
              <div class="cred-box highlight-pin">
                <div class="cred-label">Tracking Code / PIN</div>
                <div class="cred-val">${data.trackingCode || 'N/A'}</div>
              </div>
            </div>

            <!-- Detailed Table -->
            <table class="info-table">
              <tr>
                <td>University / Institution:</td>
                <td>${data.institution || 'N/A'}</td>
              </tr>
              <tr>
                <td>Admission Decision:</td>
                <td><strong style="color: ${decisionTextColor};">${displayDecisionText}</strong></td>
              </tr>
              <tr>
                <td>Student Record Status:</td>
                <td><strong>${(data.status || 'Active').toUpperCase()}</strong></td>
              </tr>
              <tr>
                <td>Applicant Email:</td>
                <td>${data.email || 'N/A'}</td>
              </tr>
              <tr>
                <td>Contact Phone:</td>
                <td>${data.phoneNumber || 'N/A'}</td>
              </tr>
              <tr>
                <td>Academic Level &amp; Intake:</td>
                <td>${data.level || 'Level 1'} &bull; ${data.admissionDate ? new Date(data.admissionDate).toLocaleDateString() : 'Active Intake'}</td>
              </tr>
            </table>

            ${data.remarks ? `
            <div class="remarks-box">
              <div class="remarks-title">Admissions Office Instructions &amp; Remarks</div>
              <div class="remarks-body">${data.remarks}</div>
            </div>
            ` : ''}

            <div class="footer-section">
              <div>
                <div class="security-barcode">||| | |||| | ||| || ||||</div>
                <div style="margin-top: 4px;">VERIFIED ID: ${data.registrationNumber || 'EJS-2026'} &bull; Issued: ${new Date().toLocaleDateString()}</div>
              </div>
              <div class="stamp-box">
                <div class="seal">&#10003; OFFICIALLY CERTIFIED</div>
                <div>EduJobs Scholars Admissions Authority</div>
                <div>edujobsscholars.vercel.app</div>
              </div>
            </div>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `);

    printWindow.document.close();
  };

  return (
    <div className="space-y-4">
      {/* Top Action Bar with Download PDF, Copy, and Send Email */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-gray-900/80 border border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-bold text-gray-200 uppercase tracking-wider">
            Interactive Credential Card
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadPDF}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-95"
            title="Download high-resolution official PDF card or print"
          >
            <Download size={14} />
            <span>Download as PDF</span>
          </button>

          <button
            onClick={() =>
              copyToClipboard(
                `Full Name: ${data.fullName}\nUniversity: ${data.institution}\nRegNumber: ${data.registrationNumber}\nTracking PIN: ${data.trackingCode}\nDecision: ${data.admissionDecision}\nStatus: ${data.status || 'Active'}\nEmail: ${data.email}\nPhone: ${data.phoneNumber}\nNational ID: ${data.nationalId}`,
                'Full Details'
              )
            }
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-200 text-xs font-bold border border-white/15 transition-all"
            title="Copy all credentials to clipboard"
          >
            {copiedField === 'Full Details' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            <span>Copy All</span>
          </button>

          {onSendEmail && (
            <button
              onClick={onSendEmail}
              disabled={isSendingEmail}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
              title="Dispatch directly to applicant's email inbox"
            >
              <Mail size={14} />
              <span>{isSendingEmail ? 'Sending Email...' : 'Send to Student Email'}</span>
            </button>
          )}
        </div>
      </div>

      {/* The Visual Interactive Card Container */}
      <div
        id="official-student-card"
        className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-b from-gray-900 via-gray-950 to-black p-6 sm:p-8 text-white shadow-2xl shadow-cyan-950/40"
      >
        {/* Glow ambient accent rings */}
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        {/* Card Header: Brand & Decision Badge */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-black font-black text-base shadow-md shadow-cyan-500/30">
              EJ
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black tracking-tight text-white">EduJobs Scholars</span>
                <span className="rounded bg-cyan-400/20 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-widest text-cyan-300">
                  Verified
                </span>
              </div>
              <p className="text-xs text-gray-400 font-medium">Official Admissions &amp; Credential Authority</p>
            </div>
          </div>

          {/* Decision Status Pill (Accurately reflects Admitted, Conditional, Rejected, Suspended, etc.) */}
          <div className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-black uppercase tracking-wider ${badge.bg}`}>
            <span className={`h-2 w-2 rounded-full ${badge.dot} animate-ping`} />
            <span className="flex items-center gap-1.5">
              {badge.icon} {badge.text}
            </span>
          </div>
        </div>

        {/* Institution & Student Profile Row */}
        <div className="relative z-10 mt-6 grid gap-6 md:grid-cols-[1fr_auto] items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-emerald-500 text-2xl font-black text-white shadow-lg shadow-cyan-500/25 border border-white/20">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">{data.fullName}</h3>
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-300">
                <span className="flex items-center gap-1 font-semibold text-cyan-300">
                  <Building2 size={13} /> {data.institution}
                </span>
                <span>•</span>
                <span className="text-gray-400">ID: {data.nationalId || 'Not provided'}</span>
                <span>•</span>
                <span className="text-gray-400">{data.level || 'Level 1'}</span>
                {data.status && (
                  <>
                    <span>•</span>
                    <span className="capitalize px-2 py-0.5 rounded bg-white/10 text-cyan-300 font-bold text-[10px]">
                      {data.status}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center">
            <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-mono text-gray-300">
              Issued: {data.decisionSentAt ? new Date(data.decisionSentAt).toLocaleDateString() : new Date().toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Highlighted Credentials Cards (RegNumber + PIN) */}
        <div className="relative z-10 mt-6 grid gap-4 sm:grid-cols-2">
          {/* University Reg Number Box */}
          <div className="group relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 transition-all hover:border-emerald-500/60">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400">
                University Reg Number (Provided by University)
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(data.registrationNumber, 'Registration Number')}
                className="rounded-lg bg-emerald-500/20 p-1.5 text-emerald-300 hover:bg-emerald-500/30 hover:text-white transition-colors"
                title="Copy Registration Number"
              >
                {copiedField === 'Registration Number' ? <Check size={13} className="text-emerald-300" /> : <Copy size={13} />}
              </button>
            </div>
            <div className="mt-2 font-mono text-lg font-black tracking-wider text-emerald-300">
              {data.registrationNumber || <span className="text-gray-500 italic text-sm">Pending university issuance</span>}
            </div>
          </div>

          {/* Tracking Code / PIN Box */}
          <div className="group relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-4 transition-all hover:border-cyan-500/60">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400">
                Applicant Tracking Code / PIN
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(data.trackingCode, 'Tracking Code / PIN')}
                className="rounded-lg bg-cyan-500/20 p-1.5 text-cyan-300 hover:bg-cyan-500/30 hover:text-white transition-colors"
                title="Copy Tracking Code / PIN"
              >
                {copiedField === 'Tracking Code / PIN' ? <Check size={13} className="text-cyan-300" /> : <Copy size={13} />}
              </button>
            </div>
            <div className="mt-2 font-mono text-lg font-black tracking-wider text-cyan-300">
              {data.trackingCode || <span className="text-gray-500 italic text-sm">Unset</span>}
            </div>
          </div>
        </div>

        {/* Detailed Information Table */}
        <div className="relative z-10 mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
          <div className="grid gap-3 sm:grid-cols-2 text-xs">
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
              <span className="text-gray-400 flex items-center gap-1.5">
                <Building2 size={13} className="text-cyan-400" /> Institution:
              </span>
              <span className="font-bold text-white text-right">{data.institution}</span>
            </div>

            <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
              <span className="text-gray-400 flex items-center gap-1.5">
                <FileText size={13} className="text-cyan-400" /> National ID / Passport:
              </span>
              <span className="font-mono font-bold text-white text-right">{data.nationalId || 'N/A'}</span>
            </div>

            <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
              <span className="text-gray-400 flex items-center gap-1.5">
                <Mail size={13} className="text-cyan-400" /> Applicant Email:
              </span>
              <span className="font-medium text-cyan-200 text-right truncate max-w-[200px]" title={data.email}>
                {data.email}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
              <span className="text-gray-400 flex items-center gap-1.5">
                <Phone size={13} className="text-cyan-400" /> Phone Number:
              </span>
              <span className="font-medium text-white text-right">{data.phoneNumber || 'N/A'}</span>
            </div>

            <div className="flex items-center justify-between border-b border-white/5 pb-2.5 sm:border-0 sm:pb-0">
              <span className="text-gray-400 flex items-center gap-1.5">
                <GraduationCap size={13} className="text-cyan-400" /> Academic Level:
              </span>
              <span className="font-bold text-white text-right">{data.level || 'Level 1'}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-400 flex items-center gap-1.5">
                <Activity size={13} className="text-cyan-400" /> Admission Decision:
              </span>
              <span className={`font-extrabold ${badge.textColorClass} text-right`}>
                {badge.text}
              </span>
            </div>
          </div>

          {/* Remarks Section */}
          {data.remarks && (
            <div
              className={`mt-4 rounded-xl border p-3.5 text-xs ${
                decisionType === 'rejected' || decisionType === 'suspended'
                  ? 'border-rose-500/30 bg-rose-950/20 text-rose-100'
                  : decisionType === 'graduated'
                  ? 'border-purple-500/30 bg-purple-950/20 text-purple-100'
                  : decisionType === 'conditional'
                  ? 'border-amber-500/30 bg-amber-950/20 text-amber-100'
                  : decisionType === 'pending' || decisionType === 'waitlisted'
                  ? 'border-cyan-500/30 bg-cyan-950/20 text-cyan-100'
                  : 'border-emerald-500/30 bg-emerald-950/20 text-emerald-100'
              }`}
            >
              <span
                className={`block font-extrabold uppercase tracking-wider mb-1 ${
                  decisionType === 'rejected' || decisionType === 'suspended'
                    ? 'text-rose-400'
                    : decisionType === 'graduated'
                    ? 'text-purple-400'
                    : decisionType === 'conditional'
                    ? 'text-amber-400'
                    : decisionType === 'pending' || decisionType === 'waitlisted'
                    ? 'text-cyan-400'
                    : 'text-emerald-400'
                }`}
              >
                Admissions Directorate Remarks &amp; Instructions:
              </span>
              <p className="whitespace-pre-line leading-relaxed opacity-95">{data.remarks}</p>
            </div>
          )}
        </div>

        {/* Card Footer Bar */}
        <div className="relative z-10 mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-4 text-[11px] text-gray-400">
          <div className="flex items-center gap-2">
            <QrCode size={18} className="text-cyan-400" />
            <span className="font-mono">VERIFIED BY EDUJOBS SCHOLARS &bull; {data.registrationNumber || 'ID-AUTHENTICATED'}</span>
          </div>

          <div className="flex items-center gap-1 text-cyan-400 font-bold">
            <Sparkles size={13} />
            <span>Official Candidate Record</span>
          </div>
        </div>
      </div>
    </div>
  );
}
