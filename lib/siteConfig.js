const adminDb = require('./adminDb');

const siteConfig = {
  siteTitle: process.env.SITE_TITLE || 'ClipVault',
  adsenseClientId: process.env.ADSENSE_CLIENT_ID || 'ca-pub-0000000000000000',
  contactEmail: process.env.CONTACT_EMAIL || 'contact@example.com',
  contactAddress: process.env.CONTACT_ADDRESS || '',
  gscVerification: process.env.GSC_VERIFICATION || '',
  bingVerification: process.env.BING_VERIFICATION || '',
  analyticsId: process.env.ANALYTICS_ID || '',
  siteDescription: process.env.SITE_DESCRIPTION || '',
  siteKeywords: process.env.SITE_KEYWORDS || '',
};

async function applySettings() {
  try {
    const settings = await adminDb.getSettings();
    if (settings.site_title) siteConfig.siteTitle = settings.site_title;
    if (settings.adsense_client_id) siteConfig.adsenseClientId = settings.adsense_client_id;
    if (settings.contact_email) siteConfig.contactEmail = settings.contact_email;
    if (settings.contact_address !== undefined) siteConfig.contactAddress = settings.contact_address;
    if (settings.gsc_verification !== undefined) siteConfig.gscVerification = settings.gsc_verification;
    if (settings.bing_verification !== undefined) siteConfig.bingVerification = settings.bing_verification;
    if (settings.analytics_id !== undefined) siteConfig.analyticsId = settings.analytics_id;
    if (settings.site_description !== undefined) siteConfig.siteDescription = settings.site_description;
    if (settings.site_keywords !== undefined) siteConfig.siteKeywords = settings.site_keywords;
  } catch (err) {
    console.error('applySettings error:', err.message);
  }
}

module.exports = { siteConfig, applySettings };
