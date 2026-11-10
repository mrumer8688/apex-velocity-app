import React, { useState } from 'react';
import JSZip from 'jszip';
import { Download, Check, Loader2 } from 'lucide-react';
import { MagneticButton } from './MagneticButton';

export const DownloadZipButton: React.FC = () => {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const zip = new JSZip();

      // Bundle key project files
      zip.file('package.json', JSON.stringify({
        name: "apex-velocity",
        private: true,
        version: "1.0.0",
        type: "module",
        scripts: {
          dev: "vite --port=3000 --host=0.0.0.0",
          build: "vite build",
          preview: "vite preview"
        },
        dependencies: {
          "react": "^19.0.1",
          "react-dom": "^19.0.1",
          "lucide-react": "^0.546.0",
          "motion": "^12.23.24",
          "gsap": "^3.12.5",
          "lenis": "^1.1.18",
          "three": "^0.170.0",
          "swiper": "^11.2.0"
        }
      }, null, 2));

      zip.file('README.md', `# Apex Velocity — Award-Winning Futuristic Luxury Automotive Site\n\nProduction React + Vite + Tailwind CSS + Three.js + Motion + GSAP project.\n\n## Quick Start\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\`\n`);

      const srcFolder = zip.folder('src');
      srcFolder?.file('main.tsx', `import { StrictMode } from 'react';\nimport { createRoot } from 'react-dom/client';\nimport App from './App.tsx';\nimport './index.css';\n\ncreateRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);`);

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'ApexVelocity_Project_Archive.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 4000);
    } catch (err) {
      console.error('Failed to generate ZIP:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <MagneticButton
      variant="secondary"
      onClick={handleDownload}
      disabled={downloading}
      className="gap-2 border-[#FF5A1F]/30 text-xs"
    >
      {downloading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-[#FF5A1F]" />
          Creating ZIP Archive...
        </>
      ) : downloaded ? (
        <>
          <Check className="w-4 h-4 text-emerald-400" />
          ZIP Archive Downloaded
        </>
      ) : (
        <>
          <Download className="w-4 h-4 text-[#FF5A1F]" />
          Download Source Code ZIP
        </>
      )}
    </MagneticButton>
  );
};
