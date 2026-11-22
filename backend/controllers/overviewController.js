import Content from '../models/Content.js';
import ContactMessage from '../models/ContactMessage.js';
import { defaultContent } from '../config/defaultContent.js';
import { normalizeSectionData } from './contentController.js';
import { dbReady, findAssetByKey, assetUrl } from '../config/gridfs.js';

const LABELS = {
  profile: 'Profile / Hero',
  socials: 'Contact information',
  nav: 'Navigation',
  skills: 'Technical skills',
  projects: 'Projects',
  about: 'About section',
  experience: 'Experience',
  education: 'Education',
  certificates: 'Certificates',
  build: 'Development approach',
  mern: 'Engineering focus',
  tech: 'Tech marquee',
  journey: 'Journey',
  design: 'Design tokens',
};

function sectionData(map, key) {
  const data = map[key]?.data ?? defaultContent[key] ?? null;
  return normalizeSectionData(key, data);
}

export async function getOverview(req, res) {
  try {
    const docs = await Content.find({}).select('section data updatedAt updatedBy').lean();
    const map = Object.fromEntries(docs.map((doc) => [doc.section, doc]));
    const profile = sectionData(map, 'profile') || {};

    const skills = sectionData(map, 'skills');
    const skillCount = Array.isArray(skills)
      ? skills.reduce((sum, group) => sum + (Array.isArray(group.skills) ? group.skills.length : 0), 0)
      : 0;

    const projects = sectionData(map, 'projects');
    const experience = sectionData(map, 'experience');
    const education = sectionData(map, 'education');
    const certificates = sectionData(map, 'certificates');

    let messages = 0;
    let unread = 0;
    let recentMessages = [];
    if (dbReady()) {
      messages = await ContactMessage.countDocuments();
      unread = await ContactMessage.countDocuments({ read: { $ne: true } });
      recentMessages = await ContactMessage.find()
        .select('name email message read createdAt')
        .sort({ createdAt: -1 })
        .limit(3)
        .lean();
    }

    const resumeMeta = profile.resumeMeta || null;
    const resumeFile = resumeMeta?.key ? await findAssetByKey(resumeMeta.key) : null;
    const resume = {
      status: resumeFile ? 'uploaded' : profile.resume ? 'legacy' : 'missing',
      filename: resumeMeta?.filename || (profile.resume ? String(profile.resume).split('/').pop() : ''),
      size: resumeFile?.length ?? resumeMeta?.size ?? null,
      uploadedAt: resumeMeta?.uploadedAt || resumeFile?.metadata?.uploadedAt || null,
      url: profile.resume || '',
      previewUrl: resumeMeta?.key ? assetUrl(resumeMeta.key) : profile.resume || '',
    };

    const lastUpdate = docs.reduce((latest, doc) => {
      const t = new Date(doc.updatedAt || 0).getTime();
      return t > latest ? t : latest;
    }, 0);

    const recentActivity = [...docs]
      .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))
      .slice(0, 5)
      .map((doc) => ({
        section: doc.section,
        label: LABELS[doc.section] || doc.section,
        updatedAt: doc.updatedAt,
        updatedBy: doc.updatedBy || 'admin',
      }));

    return res.json({
      success: true,
      data: {
        stats: {
          projects: Array.isArray(projects) ? projects.length : 0,
          skills: skillCount,
          skillGroups: Array.isArray(skills) ? skills.length : 0,
          experience: Array.isArray(experience) ? experience.length : profile.internship ? 1 : 0,
          education: Array.isArray(education) ? education.length : profile.education ? 1 : 0,
          certificates: Array.isArray(certificates) ? certificates.length : 0,
          messages,
          unread,
        },
        resume,
        lastUpdate: lastUpdate ? new Date(lastUpdate).toISOString() : null,
        recentActivity,
        recentMessages,
        contentStatus: dbReady() ? 'ready' : 'offline',
      },
    });
  } catch (err) {
    console.error('[overview]', err);
    return res.status(500).json({ success: false, message: 'Could not load dashboard overview.' });
  }
}
