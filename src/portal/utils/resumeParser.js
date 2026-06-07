import * as pdfjsLib from 'pdfjs-dist';

// Point the worker at the bundled worker file
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString();

// ─── Skill keyword list ────────────────────────────────────────────────────────
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

// ─── Extract raw text from a PDF file ─────────────────────────────────────────
async function extractPdfText(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pages = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    // Join items preserving line breaks by grouping by Y position
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
// Strategy: the candidate's name is almost always in the first few non-empty
// lines of a resume, as a short line of 2–4 capitalized words with no digits,
// no email/phone patterns, and no common section headers.
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

    // Each word should start with a capital letter and contain only letters/hyphens
    const allCapitalized = words.every((w) => /^[A-Z][a-zA-Z'\-]+$/.test(w));
    if (!allCapitalized) continue;

    return {
      firstName: words[0],
      lastName:  words.slice(1).join(' '),
      fullLine:  trimmed,
    };
  }
  return { firstName: '', lastName: '', fullLine: '' };
}

// ─── Email extraction ─────────────────────────────────────────────────────────
function extractEmail(text) {
  const match = text.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/);
  return match ? match[0] : '';
}

// ─── Phone extraction ─────────────────────────────────────────────────────────
function extractPhone(text) {
  const match = text.match(
    /(\+?\d{1,3}[\s\-.]?)?\(?\d{3}\)?[\s\-.]?\d{3}[\s\-.]?\d{4}/
  );
  return match ? match[0].trim() : '';
}

// ─── Location extraction ──────────────────────────────────────────────────────
const CITY_STATE_RE = /\b([A-Z][a-zA-Z\s]+),\s*([A-Z]{2})\b/;
function extractLocation(text) {
  const match = text.match(CITY_STATE_RE);
  return match ? match[0] : '';
}

// ─── LinkedIn extraction ──────────────────────────────────────────────────────
function extractLinkedIn(text) {
  const match = text.match(/linkedin\.com\/in\/[a-zA-Z0-9\-_%]+/i);
  return match ? `https://${match[0]}` : '';
}

// ─── Skills extraction ────────────────────────────────────────────────────────
function extractSkills(text) {
  const found = [];
  for (const skill of SKILL_KEYWORDS) {
    // Escape special regex chars in skill name
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(?<![a-zA-Z])${escaped}(?![a-zA-Z])`, 'i');
    if (re.test(text)) found.push(skill);
  }
  return found;
}

// ─── Experience extraction ────────────────────────────────────────────────────
function extractExperience(text) {
  // Look for explicit "X years of experience" patterns
  const explicit = text.match(/(\d+)\+?\s*years?\s*(of\s*)?(experience|exp)/i);
  if (explicit) return parseInt(explicit[1], 10);

  // Fallback: count year ranges like "2018 – 2023" or "2019 - Present"
  const yearRanges = [...text.matchAll(/\b(20\d{2}|19\d{2})\s*[-–—to]+\s*(20\d{2}|present)/gi)];
  if (yearRanges.length > 0) {
    const currentYear = new Date().getFullYear();
    let totalYears = 0;
    for (const m of yearRanges) {
      const start = parseInt(m[1], 10);
      const end   = /present/i.test(m[2]) ? currentYear : parseInt(m[2], 10);
      if (!isNaN(start) && !isNaN(end) && end >= start) {
        totalYears += end - start;
      }
    }
    return Math.min(totalYears, 30) || 0;
  }
  return 0;
}

// ─── Current role / company extraction ───────────────────────────────────────
const ROLE_KEYWORDS = /\b(engineer|developer|designer|analyst|manager|architect|consultant|specialist|lead|director|officer|intern|scientist|devops|sre|qa|tester|product|scrum|agile)\b/i;

function extractCurrentRole(lines) {
  for (const line of lines.slice(0, 20)) {
    const trimmed = line.trim();
    if (ROLE_KEYWORDS.test(trimmed) && trimmed.length < 80 && trimmed.length > 5) {
      return trimmed;
    }
  }
  return '';
}

// ─── Notice period extraction ─────────────────────────────────────────────────
function extractNoticePeriod(text) {
  if (/immediate|available\s*now|notice\s*:\s*0/i.test(text)) return 'Immediate';
  const m = text.match(/notice\s*(?:period)?\s*[:\-]?\s*(\d+)\s*(week|month)/i);
  if (m) {
    const n = parseInt(m[1], 10);
    const unit = m[2].toLowerCase();
    if (unit.startsWith('week')) return n <= 2 ? '2 weeks' : '1 month';
    if (unit.startsWith('month')) return n <= 1 ? '1 month' : '3 months';
  }
  return '1 month'; // sensible default
}

// ─── Education extraction ─────────────────────────────────────────────────────
const DEGREE_RE = /\b(b\.?s\.?|b\.?e\.?|b\.?tech|b\.?sc|m\.?s\.?|m\.?tech|m\.?sc|m\.?b\.?a|ph\.?d|bachelor|master|doctorate)\b/i;

function extractEducation(lines) {
  const results = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (DEGREE_RE.test(line)) {
      const yearMatch = line.match(/\b(19|20)\d{2}\b/);
      const year = yearMatch ? parseInt(yearMatch[0], 10) : '';
      // Try to find institution on adjacent lines
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

// ─── Work history extraction ──────────────────────────────────────────────────
const DATE_RANGE_RE = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|20\d{2}|19\d{2})\b.*?\b(20\d{2}|19\d{2}|present)\b/i;

function extractWorkHistory(lines) {
  const entries = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (DATE_RANGE_RE.test(line)) {
      const dateMatch = line.match(/((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)?\s*(?:20|19)\d{2})\s*[-–—to]+\s*((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)?\s*(?:20|19)\d{2}|present)/i);
      const from = dateMatch ? dateMatch[1].trim() : '';
      const to   = dateMatch ? dateMatch[2].trim() : '';

      // Role is usually the line before the date range
      const role    = lines[i - 1]?.trim() || '';
      // Company is usually the line before the role, or on the same line
      const company = lines[i - 2]?.trim() || '';
      const desc    = lines[i + 1]?.trim() || '';

      if (role || company) {
        entries.push({
          company: company.length < 80 ? company : '',
          role:    role.length < 80    ? role    : '',
          from,
          to,
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
  const isPdf  = file.type === 'application/pdf' || file.name.match(/\.pdf$/i);
  const isDocx = file.name.match(/\.(docx|doc)$/i);

  let rawText = '';
  let lines   = [];

  if (isPdf) {
    rawText = await extractPdfText(file);
    lines   = rawText.split('\n').filter((l) => l.trim().length > 0);
  } else {
    // For .docx we can't parse client-side without a heavy library.
    // Fall back to filename-based hints and leave fields blank for manual entry.
    rawText = '';
    lines   = [];
  }

  // ── Extract fields ──────────────────────────────────────────────────────
  const { firstName, lastName } = extractName(lines);
  const email        = extractEmail(rawText);
  const phone        = extractPhone(rawText);
  const location     = extractLocation(rawText);
  const linkedIn     = extractLinkedIn(rawText);
  const skills       = extractSkills(rawText);
  const totalExp     = extractExperience(rawText);
  const currentRole  = extractCurrentRole(lines);
  const noticePeriod = extractNoticePeriod(rawText);
  const education    = extractEducation(lines);
  const workHistory  = extractWorkHistory(lines);

  return {
    firstName,
    lastName,
    email,
    phone,
    location,
    linkedIn,
    currentRole,
    currentCompany: workHistory[0]?.company || '',
    totalExperience: totalExp,
    noticePeriod,
    skills,
    education,
    workHistory,
    notes: `Auto-extracted from ${file.name}. Please review all fields carefully.`,
    _resumeUploaded: true,
    _resumeFileName: file.name,
  };
}
