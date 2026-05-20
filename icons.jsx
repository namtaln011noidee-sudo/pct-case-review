// icons.jsx — Lucide-style line icons (24x24 stroke)

function I({ d, size = 16, sw = 1.8, fill = "none", style, children }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size} height={size} viewBox="0 0 24 24"
      fill={fill} stroke="currentColor" strokeWidth={sw}
      strokeLinecap="round" strokeLinejoin="round"
      style={style}
    >
      {d ? <path d={d} /> : null}
      {children}
    </svg>
  );
}

const Icon = {
  // Brand mark
  Logo: function Logo(props) {
    const size = props.size || 32;
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <defs>
          <linearGradient id="lg1" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop stopColor="#84acd7" />
            <stop offset="1" stopColor="#1f4f82" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="28" height="28" rx="7" fill="url(#lg1)" />
        <path d="M9 9v14M23 9v14M9 16h14" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    );
  },

  Plus:     (p) => <I {...p} d="M12 5v14M5 12h14" />,
  Edit:     (p) => <I {...p} d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />,
  Trash:    (p) => <I {...p} d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M10 11v6M14 11v6" />,
  Check:    (p) => <I {...p} d="M20 6 9 17l-5-5" />,
  X:        (p) => <I {...p} d="M18 6 6 18M6 6l12 12" />,
  Save:     (p) => <I {...p} d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2zM17 21v-8H7v8M7 3v5h8" />,
  Copy:     (p) => <I {...p} d="M20 9h-9a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2zM5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />,
  Print:    (p) => <I {...p} d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z" />,
  Download: (p) => <I {...p} d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />,
  Search:   (p) => <I {...p} d="m21 21-4.3-4.3"><circle cx="11" cy="11" r="8" /></I>,
  ChevD:    (p) => <I {...p} d="m6 9 6 6 6-6" />,
  ChevR:    (p) => <I {...p} d="m9 18 6-6-6-6" />,
  ChevL:    (p) => <I {...p} d="m15 18-6-6 6-6" />,
  ArrowR:   (p) => <I {...p} d="M5 12h14M12 5l7 7-7 7" />,
  Calendar: (p) => <I {...p} d="M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM16 2v4M8 2v4M3 10h18" />,
  Clock:    (p) => <I {...p}><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></I>,
  FileText: (p) => <I {...p} d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8" />,
  ClipboardCheck: (p) => <I {...p} d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2zM9 14l2 2 4-4" />,
  Activity: (p) => <I {...p} d="M22 12h-4l-3 9L9 3l-3 9H2" />,
  BarChart: (p) => <I {...p} d="M12 20V10M18 20V4M6 20v-6" />,
  Database: (p) => <I {...p} d="M21 5c0 1.66-4 3-9 3s-9-1.34-9-3 4-3 9-3 9 1.34 9 3zM3 5v7c0 1.66 4 3 9 3s9-1.34 9-3V5M3 12v7c0 1.66 4 3 9 3s9-1.34 9-3v-7" />,
  Users:    (p) => <I {...p} d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"><circle cx="9" cy="7" r="4" /></I>,
  User:     (p) => <I {...p} d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"><circle cx="12" cy="7" r="4" /></I>,
  Eye:      (p) => <I {...p} d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8z"><circle cx="12" cy="12" r="3" /></I>,
  Logout:   (p) => <I {...p} d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />,
  Hospital: (p) => <I {...p} d="M12 6V2H8M5 22V8h14v14M2 22h20M18 22V11M6 22V11M10 22V18a2 2 0 1 1 4 0v4M11 6h2M12 5v2" />,
  AlertTri: (p) => <I {...p} d="m12 9 1 6M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />,
  Shield:   (p) => <I {...p} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  Info:     (p) => <I {...p}><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></I>,
  ChartPie: (p) => <I {...p} d="M21.21 15.89A10 10 0 1 1 8 2.83M22 12A10 10 0 0 0 12 2v10z" />,
  ChartLine:(p) => <I {...p} d="M3 3v18h18M7 15l4-4 4 4 5-5" />,
};

window.Icon = Icon;
