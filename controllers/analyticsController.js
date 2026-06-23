const Project     = require('../models/Project');
const Blog        = require('../models/Blog');
const Message     = require('../models/Message');
const Testimonial = require('../models/Testimonial');
const Skill       = require('../models/Skill');

function generateSeoTrend() {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const now = new Date();
  const currentMonth = now.getMonth();
  const trend = [];
  for (let i = 5; i >= 0; i--) {
    const monthIdx = (currentMonth - i + 12) % 12;
    const baseScore = 40 + (5 - i) * 6 + Math.floor(Math.random() * 5);
    trend.push({ m: months[monthIdx], s: Math.min(baseScore, 95) });
  }
  return trend;
}

const getStats = async (req, res) => {
  try {
    const [
      totalProjects,
      totalBlogs,
      totalMessages,
      unreadMessages,
      totalTestimonials,
      totalSkills,
      recentMessages,
    ] = await Promise.all([
      Project.countDocuments(),
      Blog.countDocuments({ published: true }),
      Message.countDocuments(),
      Message.countDocuments({ read: false }),
      Testimonial.countDocuments({ active: true }),
      Skill.countDocuments(),
      Message.find().sort({ createdAt: -1 }).limit(5),
    ]);

    const seoTrend = generateSeoTrend();
    const seoFirst = seoTrend[0]?.s || 1;
    const seoLast  = seoTrend[seoTrend.length - 1]?.s || seoFirst;
    const seoYtd   = Math.round(((seoLast - seoFirst) / seoFirst) * 100);

    const adsBreakdown = [
      { label: 'Facebook',  value: 42, color: '#3b82f6' },
      { label: 'Google',    value: 31, color: '#f59e0b' },
      { label: 'Instagram', value: 18, color: '#ec4899' },
      { label: 'Other',     value: 9,  color: '#6366f1' },
    ];

    const adsBudget = { used: 1240, total: 1500 };

    res.json({
      success: true,
      data: {
        totalProjects,
        totalBlogs,
        totalMessages,
        unreadMessages,
        totalTestimonials,
        totalSkills,
        recentMessages,
        seoTrend,
        seoYtd: (seoYtd >= 0 ? "+" : "") + seoYtd + "%",
        adsBreakdown,
        adsBudget,
        cards: [
          { title: 'Live Projects', value: String(totalProjects),     icon: '🚀', color: '#00D4AA' },
          { title: 'Blog Posts',    value: String(totalBlogs),        icon: '✍️',  color: '#38BDF8' },
          { title: 'Messages',      value: String(totalMessages),     icon: '✉️',  color: '#818CF8' },
          { title: 'Reviews',       value: String(totalTestimonials), icon: '⭐', color: '#f472b6' },
          { title: 'Skills',        value: String(totalSkills),       icon: '⚡', color: '#f59e0b' },
        ],
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getStats };
