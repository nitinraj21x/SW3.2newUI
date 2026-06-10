/**
 * resumeParser.js
 *
 * pdfjs-dist is loaded lazily on first call — keeps the portal initial bundle
 * ~5MB lighter. The library is only downloaded when a user uploads a resume.
 */

// ─── Lazy pdfjs loader ────────────────────────────────────────────────────────
let _pdfjsLib = null;
async function getPdfjs() {
  if (_pdfjsLib) return _pdfjsLib;
  _pdfjsLib = await import('pdfjs-dist');
  _pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url
  ).toString();
  return _pdfjsLib;
}

// ─── Skill keyword list ───────────────────────────────────────────────────────
const SKILL_KEYWORDS = [
  'React', 'Next.js', 'Vue', 'Angular', 'TypeScript', 'JavaScript', 'Redux',
  'Tailwind CSS', 'CSS', 'HTML', 'GraphQL', 'REST API',
  'Node.js', 'Express', 'NestJS', 'Python', 'Django', 'FastAPI', 'Flask',
  'Java', 'Spring Boot', 'Go', 'Rust', 'C++', 'C#', '.NET',
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQLite', 'Supabase',
  'Docker', 'Kubernetes', 'Terraform', 'AWS', 'GCP', 'Azure', 'CI/CD',
  'Machine Learning', 'TensorFlow', 'PyTorch', 'Data Science', 'Pandas',
  'NumPy', 'Scikit-learn', 'Kafka', 'RabbitMQ', 'Microservices',
  'React Native', 'iOS', 'Android', 'Firebase', 'Jest', 'Cypress',
  'Git', 'Linux', 'Ansible', 'Helm', 'Figma', 'Jira', 'Agile', 'Scrum',
];

// ─── Extract raw text from a PDF file ────────────────────────────────────────
async function extractPdfText(file) {
  const pdfjsLib = await getPdfjs();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pages = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const lines = [];
    let lastY = null;
    let currentLine = [];
    for (const item of content.items) {
      if ('str' in item) {
        const y = item.transform[5];
        if (lastY !== null && Math.abs(y - lastY) > 2) {
          if (currentLine.length) lines.push(currentLine.join(' ').trim());
          currentLine = [];
        }
        if (item.str.trim()) currentLine.push(item.str.trim());
        lastY = y;
      }
    }
    if (currentLine.length) lines.push(currentLine.join(' ').trim());
    pages.push(lines.join('\n'));
  }
  return pages.join('\n');
}

// ─── Name extraction ──────────────────────────────────────────────────────────
const SECTION_HEADERS = /^(summary|objective|experience|education|skills|projects|certifications|contact|profile|about|work history|employment|references|languages|interests|awards|publications|volunteer)/i;
const NOISE_PATTERNS  = /[@\d\|\/\\#\(\)\[\]<>]/;
const TITLE_WORDS     = /\b(engineer|developer|manager|analyst|designer|architect|consultant|specialist|lead|senior|junior|intern|director|officer|head|vp|cto|ceo|coo)\b/i;

function extractName(lines) {
  for (const line of lines.slice(0, 12)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (SECTION_HEADERS.test(trimmed)) continue;
    if (NOISE_PATTERNS.test(trimmed)) continue;
    if (TITLE_WORDS.test(trimmed)) continue;
    if (trimmed.length < 4 || trimmed.length > 50) continue;
    const words = trimmed.split(/\s+/);
    if (words.length < 2 || words.length > 5) continue;
    const allCapitalized = words.every((w) => /^[A-Z][a-zA-Z'\-]+$/.test(w));
    if (!allCapitalized) continue;
    return { firstName: words[0], lastName: words.slice(1).join(' '), fullLine: trimmed };
  }
  return { firstName: '', lastName: '', fullLine: '' };
}

// ─── Field extractors ─────────────────────────────────────────────────────────
function extractEmail(text) {
  const m = text.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/);
  return m ? m[0] : '';
}

function extractPhone(text) {
  const m = text.match(/(\+?\d{1,3}[\s\-.]?)?\(?\d{3}\)?[\s\-.]?\d{3}[\s\-.]?\d{4}/);
  return m ? m[0].trim() : '';
}

const CITY_STATE_RE = /\b([A-Z][a-zA-Z\s]+),\s*([A-Z]{2})\b/;
function extractLocation(text) {
  const m = text.match(CITY_STATE_RE);
  return m ? m[0] : '';
}

function extractLinkedIn(text) {
  const m = text.match(/linkedin\.com\/in\/[a-zA-Z0-9\-_%]+/i);
  return m ? `https://${m[0]}` : '';
}

function extractSkills(text) {
  const found = [];
  for (const skill of SKILL_KEYWORDS) {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(?<![a-zA-Z])${escaped}(?![a-zA-Z])`, 'i');
    if (re.test(text)) found.push(skill);
  }
  return found;
}

function extractExperience(text) {
  const explicit = text.match(/(\d+)\+?\s*years?\s*(of\s*)?(experience|exp)/i);
  if (explicit) return parseInt(explicit[1], 10);
  const yearRanges = [...text.matchAll(/\b(20\d{2}|19\d{2})\s*[-–—to]+\s*(20\d{2}|present)/gi)];
  if (yearRanges.length > 0) {
    const currentYear = new Date().getFullYear();
    let total = 0;
    for (const m of yearRanges) {
      const start = parseInt(m[1], 10);
      const end   = /present/i.test(m[2]) ? currentYear : parseInt(m[2], 10);
      if (!isNaN(start) && !isNaN(end) && end >= start) total += end - start;
    }
    return Math.min(total, 30) || 0;
  }
  return 0;
}

const ROLE_KEYWORDS = /\b(engineer|developer|designer|analyst|manager|architect|consultant|specialist|lead|director|officer|intern|scientist|devops|sre|qa|tester|product|scrum|agile)\b/i;
function extractCurrentRole(lines) {
  for (const line of lines.slice(0, 20)) {
    const t = line.trim();
    if (ROLE_KEYWORDS.test(t) && t.length < 80 && t.length > 5) return t;
  }
  return '';
}

function extractNoticePeriod(text) {
  if (/immediate|available\s*now|notice\s*:\s*0/i.test(text)) return 'Immediate';
  const m = text.match(/notice\s*(?:period)?\s*[:\-]?\s*(\d+)\s*(week|month)/i);
  if (m) {
    const n = parseInt(m[1], 10);
    const unit = m[2].toLowerCase();
    if (unit.startsWith('week'))  return n <= 2 ? '2 weeks' : '1 month';
    if (unit.startsWith('month')) return n <= 1 ? '1 month' : '3 months';
  }
  return '1 month';
}

const DEGREE_RE = /\b(b\.?s\.?|b\.?e\.?|b\.?tech|b\.?sc|m\.?s\.?|m\.?tech|m\.?sc|m\.?b\.?a|ph\.?d|bachelor|master|doctorate)\b/i;
function extractEducation(lines) {
  const results = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (DEGREE_RE.test(line)) {
      const yearMatch = line.match(/\b(19|20)\d{2}\b/);
      const year = yearMatch ? parseInt(yearMatch[0], 10) : '';
      const institution = lines[i + 1]?.trim() || '';
      results.push({
        degree: line.replace(/\b(19|20)\d{2}\b/, '').trim(),
        institution: institution.length < 80 ? institution : '',
        year,
      });
      if (results.length >= 3) break;
    }
  }
  return results.length > 0 ? results : [{ degree: '', institution: '', year: '' }];
}

const DATE_RANGE_RE = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|20\d{2}|19\d{2})\b.*?\b(20\d{2}|19\d{2}|present)\b/i;
function extractWorkHistory(lines) {
  const entries = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (DATE_RANGE_RE.test(line)) {
      const dateMatch = line.match(/((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)?\s*(?:20|19)\d{2})\s*[-–—to]+\s*((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)?\s*(?:20|19)\d{2}|present)/i);
      const from    = dateMatch ? dateMatch[1].trim() : '';
      const to      = dateMatch ? dateMatch[2].trim() : '';
      const role    = lines[i - 1]?.trim() || '';
      const company = lines[i - 2]?.trim() || '';
      const desc    = lines[i + 1]?.trim() || '';
      if (role || company) {
        entries.push({
          company: company.length < 80 ? company : '',
          role:    role.length < 80    ? role    : '',
          from, to,
          description: desc.length < 200 ? desc : 'See resume for details.',
        });
      }
      if (entries.length >= 4) break;
    }
  }
  return entries.length > 0
    ? entries
    : [{ company: '', role: '', from: '', to: 'Present', description: 'Extracted from resume — please verify.' }];
}

// ─── Main export ──────────────────────────────────────────────────────────────
export async function parseResume(file) {
  const isPdf = file.type === 'application/pdf' || file.name.match(/\.pdf$/i);

  let rawText = '';
  let lines   = [];

  if (isPdf) {
    rawText = await extractPdfText(file);
    lines   = rawText.split('\n').filter((l) => l.trim().length > 0);
  }
  // .docx: can't parse client-side without heavy deps — leave fields for manual entry

  const { firstName, lastName } = extractName(lines);

  return {
    firstName,
    lastName,
    email:           extractEmail(rawText),
    phone:           extractPhone(rawText),
    location:        extractLocation(rawText),
    linkedIn:        extractLinkedIn(rawText),
    currentRole:     extractCurrentRole(lines),
    currentCompany:  extractWorkHistory(lines)[0]?.company || '',
    totalExperience: extractExperience(rawText),
    noticePeriod:    extractNoticePeriod(rawText),
    skills:          extractSkills(rawText),
    education:       extractEducation(lines),
    workHistory:     extractWorkHistory(lines),
    notes:           `Auto-extracted from ${file.name}. Please review all fields carefully.`,
    _resumeUploaded: true,
    _resumeFileName: file.name,
  };
}
