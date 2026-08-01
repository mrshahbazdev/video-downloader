const fs = require('fs');
const path = require('path');

const toolsPath = path.join(__dirname, '..', 'data', 'tools.json');
const tools = JSON.parse(fs.readFileSync(toolsPath, 'utf8'));
const existingSlugs = new Set(tools.map(t => t.slug).filter(Boolean));

const newTools = [];
function add(icon, title, desc, slug, keywords) {
  if (existingSlugs.has(slug)) return;
  existingSlugs.add(slug);
  newTools.push({
    icon,
    title,
    desc,
    slug,
    placeholder: `Paste ${title.replace(' Downloader', '')} URL here...`,
    keywords,
  });
}

// Premium channels / OTT
[
  ['⭐', 'Starz Downloader', 'Download Starz videos.', 'starz', 'starz downloader'],
  ['⭐', 'Showtime Downloader', 'Download Showtime videos.', 'showtime', 'showtime downloader'],
  ['⭐', 'Cinemax Downloader', 'Download Cinemax videos.', 'cinemax', 'cinemax downloader'],
  ['⭐', 'Epix Downloader', 'Download Epix videos.', 'epix', 'epix downloader'],
  ['⭐', 'Hallmark Movies Now Downloader', 'Download Hallmark videos.', 'hallmark-movies-now', 'hallmark movies now downloader'],
  ['⭐', 'Lifetime Movie Club Downloader', 'Download Lifetime Movie Club videos.', 'lifetime-movie-club', 'lifetime movie club downloader'],
  ['⭐', 'BET+ Downloader', 'Download BET+ videos.', 'bet-plus', 'bet plus downloader'],
  ['⭐', 'ALLBLK Downloader', 'Download ALLBLK videos.', 'allblk', 'allblk downloader'],
  ['⭐', 'We TV Downloader', 'Download We TV videos.', 'we-tv', 'we tv downloader'],
  ['⭐', 'Sundance Now Downloader', 'Download Sundance Now videos.', 'sundance-now', 'sundance now downloader'],
  ['⭐', 'IFC Films Unlimited Downloader', 'Download IFC Films videos.', 'ifc-films', 'ifc films unlimited downloader'],
  ['⭐', 'DocuBay Downloader', 'Download DocuBay documentaries.', 'docubay', 'docubay downloader'],
  ['⭐', 'Docsville Downloader', 'Download Docsville documentaries.', 'docsville', 'docsville downloader'],
  ['⭐', 'Film Movement Plus Downloader', 'Download Film Movement Plus videos.', 'film-movement-plus', 'film movement plus downloader'],
  ['⭐', 'Fandor Downloader', 'Download Fandor films.', 'fandor', 'fandor downloader'],
  ['⭐', 'Kanopy Kids Downloader', 'Download Kanopy Kids videos.', 'kanopy-kids', 'kanopy kids downloader'],
  ['⭐', 'PBS Passport Downloader', 'Download PBS Passport videos.', 'pbs-passport', 'pbs passport downloader'],
  ['⭐', 'PBS Masterpiece Downloader', 'Download PBS Masterpiece videos.', 'pbs-masterpiece', 'pbs masterpiece downloader'],
  ['⭐', 'PBS Documentaries Downloader', 'Download PBS documentaries.', 'pbs-documentaries', 'pbs documentaries downloader'],
  ['⭐', 'PBS Kids Video Downloader', 'Download PBS Kids video app content.', 'pbs-kids-video', 'pbs kids video downloader'],
  ['⭐', 'PBS LearningMedia Downloader', 'Download PBS LearningMedia videos.', 'pbs-learningmedia', 'pbs learningmedia downloader'],
  ['⭐', 'Curiosity Stream Downloader', 'Download Curiosity Stream videos.', 'curiosity-stream', 'curiosity stream downloader'],
].forEach(([i,t,d,s,k])=>add(i,t,d,s,k));

// Anime platforms
[
  ['🇯🇵', 'RetroCrush Downloader', 'Download RetroCrush anime.', 'retrocrush', 'retrocrush downloader'],
  ['🇯🇵', 'AnimeLab Downloader', 'Download AnimeLab episodes.', 'animelab', 'animelab downloader'],
  ['🇯🇵', 'AniMixPlay Downloader', 'Download AniMixPlay videos.', 'animixplay', 'animixplay downloader'],
  ['🇯🇵', '9anime Downloader', 'Download 9anime videos.', '9anime', '9anime downloader'],
  ['🇯🇵', 'Gogoanime Downloader', 'Download Gogoanime videos.', 'gogoanime', 'gogoanime downloader'],
  ['🇯🇵', 'Zoro.to Downloader', 'Download Zoro.to anime.', 'zoroto', 'zoro to downloader'],
  ['🇯🇵', 'AnimeHeaven Downloader', 'Download AnimeHeaven videos.', 'animeheaven', 'animeheaven downloader'],
  ['🇯🇵', 'Chia-Anime Downloader', 'Download Chia-Anime videos.', 'chia-anime', 'chia anime downloader'],
  ['🇯🇵', 'AnimeFreak Downloader', 'Download AnimeFreak videos.', 'animefreak', 'animefreak downloader'],
  ['🇯🇵', 'Soul-Anime Downloader', 'Download Soul-Anime videos.', 'soul-anime', 'soul anime downloader'],
  ['🇯🇵', 'AnimeKisa Downloader', 'Download AnimeKisa videos.', 'animekisa', 'animekisa downloader'],
  ['🇯🇵', 'AnimeDao Downloader', 'Download AnimeDao videos.', 'animedao', 'animedao downloader'],
  ['🇯🇵', '4anime Downloader', 'Download 4anime videos.', '4anime', '4anime downloader'],
  ['🇯🇵', 'Masterani Downloader', 'Download Masterani videos.', 'masterani', 'masterani downloader'],
  ['🇯🇵', 'AnimeTake Downloader', 'Download AnimeTake videos.', 'animetake', 'animetake downloader'],
  ['🇯🇵', 'AnimeUltima Downloader', 'Download AnimeUltima videos.', 'animeultima', 'animeultima downloader'],
  ['🇯🇵', 'KissAnime Downloader', 'Download KissAnime archive videos.', 'kissanime', 'kissanime downloader'],
].forEach(([i,t,d,s,k])=>add(i,t,d,s,k));

// Indian regional OTT
[
  ['🇮🇳', 'Aha Telugu Downloader', 'Download Aha Telugu videos.', 'aha-telugu', 'aha telugu downloader'],
  ['🇮🇳', 'Aha Tamil Downloader', 'Download Aha Tamil videos.', 'aha-tamil', 'aha tamil downloader'],
  ['🇮🇳', 'Sun NXT Downloader', 'Download Sun NXT videos.', 'sun-nxt', 'sun nxt downloader'],
  ['🇮🇳', 'ManoramaMAX Downloader', 'Download ManoramaMAX videos.', 'manoramamax', 'manoramamax downloader'],
  ['🇮🇳', 'Koode Downloader', 'Download Koode Malayalam videos.', 'koode', 'koode downloader'],
  ['🇮🇳', 'NeeStream Downloader', 'Download NeeStream videos.', 'neestream', 'neestream downloader'],
  ['🇮🇳', 'Saina Play Downloader', 'Download Saina Play videos.', 'saina-play', 'saina play downloader'],
  ['🇮🇳', 'Roots Video Downloader', 'Download Roots Video content.', 'roots-video', 'roots video downloader'],
  ['🇮🇳', 'ETV Win Downloader', 'Download ETV Win videos.', 'etv-win', 'etv win downloader'],
  ['🇮🇳', 'Hungama Play Downloader', 'Download Hungama Play videos.', 'hungama-play', 'hungama play downloader'],
  ['🇮🇳', 'ShemarooMe Downloader', 'Download ShemarooMe videos.', 'shemaroome', 'shemaroome downloader'],
  ['🇮🇳', 'Ultra Downloader', 'Download Ultra streaming videos.', 'ultra', 'ultra downloader'],
  ['🇮🇳', 'Epic On Downloader', 'Download Epic On videos.', 'epic-on', 'epic on downloader'],
  ['🇮🇳', 'Altt Balaji Downloader', 'Download ALTBalaji videos.', 'altt', 'alt balaji downloader'],
  ['🇮🇳', 'Lionsgate Play Downloader', 'Download Lionsgate Play videos.', 'lionsgate-play', 'lionsgate play downloader'],
  ['🇮🇳', 'Amazon miniTV Downloader', 'Download Amazon miniTV videos.', 'amazon-minitv', 'amazon minitv downloader'],
  ['🇮🇳', 'Flipkart Video Downloader', 'Download Flipkart Video content.', 'flipkart-video', 'flipkart video downloader'],
  ['🇮🇳', 'YouTube India Downloader', 'Download YouTube India videos.', 'youtube-india', 'youtube india downloader'],
].forEach(([i,t,d,s,k])=>add(i,t,d,s,k));

// African / MENA
[
  ['🇿🇦', 'Showmax Downloader', 'Download Showmax videos.', 'showmax', 'showmax downloader'],
  ['🇿🇦', 'DStv Downloader', 'Download DStv videos.', 'dstv', 'dstv downloader'],
  ['🇿🇦', 'GOtv Downloader', 'Download GOtv videos.', 'gotv', 'gotv downloader'],
  ['🇳🇬', 'StarTimes Downloader', 'Download StarTimes videos.', 'startimes', 'startimes downloader'],
  ['🇳🇬', 'Kwesé Downloader', 'Download Kwesé videos.', 'kwese', 'kwese downloader'],
  ['🇳🇬', 'Nollywood TV Downloader', 'Download Nollywood TV videos.', 'nollywood-tv', 'nollywood tv downloader'],
  ['🇳🇬', 'Iroko TV Downloader', 'Download Iroko TV videos.', 'iroko-tv', 'iroko tv downloader'],
  ['🇳🇬', 'Africa Magic Downloader', 'Download Africa Magic videos.', 'africa-magic', 'africa magic downloader'],
  ['🇪🇬', 'WatchIt Downloader', 'Download WatchIt videos.', 'watchit', 'watchit downloader'],
  ['🇦🇪', 'Wavo Downloader', 'Download Wavo videos.', 'wavo', 'wavo downloader'],
  ['🇦🇪', 'OSN+ Downloader', 'Download OSN+ videos.', 'osn-plus', 'osn plus downloader'],
  ['🇸🇦', 'Jawwy TV Downloader', 'Download Jawwy TV videos.', 'jawwy-tv', 'jawwy tv downloader'],
  ['🇸🇦', 'STC TV Downloader', 'Download STC TV videos.', 'stc-tv', 'stc tv downloader'],
  ['🇰🇼', 'Viu Originals Downloader', 'Download Viu Originals.', 'viu-originals', 'viu originals downloader'],
  ['🇵🇭', 'iFlix Downloader', 'Download iFlix videos.', 'iflix', 'iflix downloader'],
  ['🇵🇭', 'WeTV Philippines Downloader', 'Download WeTV Philippines videos.', 'wetv-philippines', 'wetv philippines downloader'],
  ['🇮🇩', 'Vidio Downloader', 'Download Vidio Indonesian videos.', 'vidio', 'vidio downloader'],
  ['🇮🇩', 'RCTI+ Downloader', 'Download RCTI+ videos.', 'rcti-plus', 'rcti plus downloader'],
  ['🇲🇾', 'Astro GO Downloader', 'Download Astro GO videos.', 'astro-go', 'astro go downloader'],
  ['🇸🇬', 'meWATCH Downloader', 'Download meWATCH videos.', 'mewatch', 'mewatch downloader'],
  ['🇹🇭', '3Plus Downloader', 'Download 3Plus Thai videos.', '3plus', '3plus downloader'],
  ['🇹🇭', 'CH3Thailand Downloader', 'Download CH3 Thailand videos.', 'ch3-thailand', 'ch3 thailand downloader'],
  ['🇻🇳', 'VTV Go Downloader', 'Download VTV Go videos.', 'vtv-go', 'vtv go downloader'],
  ['🇻🇳', 'FPT Play Downloader', 'Download FPT Play videos.', 'fpt-play', 'fpt play downloader'],
].forEach(([i,t,d,s,k])=>add(i,t,d,s,k));

// More US / Americas TV
[
  ['🇺🇸', 'ABC Local Downloader', 'Download ABC local station videos.', 'abc-local', 'abc local downloader'],
  ['🇺🇸', 'NBC Local Downloader', 'Download NBC local station videos.', 'nbc-local', 'nbc local downloader'],
  ['🇺🇸', 'CBS Local Downloader', 'Download CBS local station videos.', 'cbs-local', 'cbs local downloader'],
  ['🇺🇸', 'FOX Local Downloader', 'Download FOX local station videos.', 'fox-local', 'fox local downloader'],
  ['🇺🇸', 'Telemundo Downloader', 'Download Telemundo videos.', 'telemundo', 'telemundo downloader'],
  ['🇺🇸', 'Univision Downloader', 'Download Univision videos.', 'univision', 'univision downloader'],
  ['🇺🇸', 'Estrella TV Downloader', 'Download Estrella TV videos.', 'estrella-tv', 'estrella tv downloader'],
  ['🇺🇸', 'Azteca America Downloader', 'Download Azteca America videos.', 'azteca-america', 'azteca america downloader'],
  ['🇺🇸', 'Televisa Downloader', 'Download Televisa videos.', 'televisa', 'televisa downloader'],
  ['🇲🇽', 'Univision Deportes Downloader', 'Download Univision Deportes videos.', 'univision-deportes', 'univision deportes downloader'],
  ['🇺🇸', 'TUDN Downloader', 'Download TUDN sports videos.', 'tudn', 'tudn downloader'],
  ['🇺🇸', 'Fox Deportes Downloader', 'Download Fox Deportes videos.', 'fox-deportes', 'fox deportes downloader'],
  ['🇺🇸', 'ESPN+ Downloader', 'Download ESPN+ videos.', 'espn-plus', 'espn plus downloader'],
  ['🇺🇸', 'ESPN Deportes Downloader', 'Download ESPN Deportes videos.', 'espn-deportes', 'espn deportes downloader'],
  ['🇺🇸', 'FloSports Downloader', 'Download FloSports events.', 'flosports', 'flosports downloader'],
  ['🇺🇸', 'beIN SPORTS CONNECT Downloader', 'Download beIN SPORTS CONNECT videos.', 'bein-connect', 'bein sports connect downloader'],
  ['🇺🇸', 'NBC Sports Downloader', 'Download NBC Sports videos.', 'nbc-sports', 'nbc sports downloader'],
  ['🇺🇸', 'CBS Sports Downloader', 'Download CBS Sports videos.', 'cbs-sports', 'cbs sports downloader'],
  ['🇺🇸', 'Yahoo Sports Downloader', 'Download Yahoo Sports videos.', 'yahoo-sports', 'yahoo sports downloader'],
  ['🇺🇸', 'Bleacher Report Downloader', 'Download Bleacher Report videos.', 'bleacher-report', 'bleacher report downloader'],
  ['🇺🇸', 'Barstool Sports Downloader', 'Download Barstool Sports videos.', 'barstool-sports', 'barstool sports downloader'],
  ['🇺🇸', 'The Athletic Downloader', 'Download The Athletic videos.', 'the-athletic', 'the athletic downloader'],
  ['🇺🇸', 'SB Nation Downloader', 'Download SB Nation videos.', 'sb-nation', 'sb nation downloader'],
].forEach(([i,t,d,s,k])=>add(i,t,d,s,k));

// Tech media
[
  ['💻', 'The Verge Downloader', 'Download The Verge videos.', 'the-verge', 'the verge downloader'],
  ['💻', 'TechCrunch Downloader', 'Download TechCrunch videos.', 'techcrunch', 'techcrunch downloader'],
  ['💻', 'Engadget Downloader', 'Download Engadget videos.', 'engadget', 'engadget downloader'],
  ['💻', 'Wired Downloader', 'Download Wired videos.', 'wired', 'wired downloader'],
  ['💻', 'Gizmodo Downloader', 'Download Gizmodo videos.', 'gizmodo', 'gizmodo downloader'],
  ['💻', 'Mashable Downloader', 'Download Mashable videos.', 'mashable', 'mashable downloader'],
  ['💻', "Tom's Hardware Downloader", "Download Tom's Hardware videos.", 'toms-hardware', 'toms hardware downloader'],
  ['💻', 'Ars Technica Downloader', 'Download Ars Technica videos.', 'ars-technica', 'ars technica downloader'],
  ['💻', 'Android Police Downloader', 'Download Android Police videos.', 'android-police', 'android police downloader'],
  ['💻', 'XDA Downloader', 'Download XDA videos.', 'xda', 'xda downloader'],
  ['💻', '9to5Mac Downloader', 'Download 9to5Mac videos.', '9to5mac', '9to5mac downloader'],
  ['💻', '9to5Google Downloader', 'Download 9to5Google videos.', '9to5google', '9to5google downloader'],
  ['💻', 'MacRumors Downloader', 'Download MacRumors videos.', 'macrumors', 'macrumors downloader'],
  ['💻', 'TechRadar Downloader', 'Download TechRadar videos.', 'techradar', 'techradar downloader'],
  ['💻', 'Digital Trends Downloader', 'Download Digital Trends videos.', 'digital-trends', 'digital trends downloader'],
  ['💻', 'ZDNet Downloader', 'Download ZDNet videos.', 'zdnet', 'zdnet downloader'],
  ['💻', 'PCMag Downloader', 'Download PCMag videos.', 'pcmag', 'pcmag downloader'],
  ['💻', 'AnandTech Downloader', 'Download AnandTech videos.', 'anandtech', 'anandtech downloader'],
  ['💻', 'Android Central Downloader', 'Download Android Central videos.', 'android-central', 'android central downloader'],
  ['💻', 'iMore Downloader', 'Download iMore videos.', 'imore', 'imore downloader'],
  ['💻', 'Pocketnow Downloader', 'Download Pocketnow videos.', 'pocketnow', 'pocketnow downloader'],
  ['💻', 'GSMArena Downloader', 'Download GSMArena videos.', 'gsmarena', 'gsmarena downloader'],
  ['💻', 'PhoneArena Downloader', 'Download PhoneArena videos.', 'phonearena', 'phonearena downloader'],
].forEach(([i,t,d,s,k])=>add(i,t,d,s,k));

// Business / finance
[
  ['💼', 'MarketWatch Downloader', 'Download MarketWatch videos.', 'marketwatch', 'marketwatch downloader'],
  ['💼', 'Seeking Alpha Downloader', 'Download Seeking Alpha videos.', 'seeking-alpha', 'seeking alpha downloader'],
  ['💼', 'Motley Fool Downloader', 'Download Motley Fool videos.', 'motley-fool', 'motley fool downloader'],
  ['💼', 'Fast Company Downloader', 'Download Fast Company videos.', 'fast-company', 'fast company downloader'],
  ['💼', 'Inc. Downloader', 'Download Inc. videos.', 'inc', 'inc downloader'],
  ['💼', 'Entrepreneur Downloader', 'Download Entrepreneur videos.', 'entrepreneur', 'entrepreneur downloader'],
  ['💼', 'Forbes Downloader', 'Download Forbes videos.', 'forbes', 'forbes downloader'],
  ['💼', 'Fortune Downloader', 'Download Fortune videos.', 'fortune', 'fortune downloader'],
  ['💼', 'Business Insider Downloader', 'Download Business Insider videos.', 'business-insider', 'business insider downloader'],
  ['💼', 'Harvard Business Review Downloader', 'Download HBR videos.', 'harvard-business-review', 'harvard business review downloader'],
  ['💼', 'McKinsey Downloader', 'Download McKinsey videos.', 'mckinsey', 'mckinsey downloader'],
  ['💼', 'Bain & Company Downloader', 'Download Bain videos.', 'bain', 'bain downloader'],
  ['💼', 'BCG Downloader', 'Download BCG videos.', 'bcg', 'bcg downloader'],
  ['💼', 'Deloitte Insights Downloader', 'Download Deloitte videos.', 'deloitte', 'deloitte downloader'],
  ['💼', 'PwC Downloader', 'Download PwC videos.', 'pwc', 'pwc downloader'],
  ['💼', 'EY Downloader', 'Download EY videos.', 'ey', 'ey downloader'],
  ['💼', 'KPMG Downloader', 'Download KPMG videos.', 'kpmg', 'kpmg downloader'],
  ['💼', 'World Economic Forum Downloader', 'Download WEF videos.', 'wef', 'world economic forum downloader'],
  ['💼', 'TED Talks Business Downloader', 'Download TED business talks.', 'ted-business', 'ted business downloader'],
  ['💼', 'Stanford Business Downloader', 'Download Stanford GSB videos.', 'stanford-business', 'stanford business downloader'],
].forEach(([i,t,d,s,k])=>add(i,t,d,s,k));

// Education platforms
[
  ['🎓', 'Great Courses Downloader', 'Download Great Courses lectures.', 'great-courses', 'great courses downloader'],
  ['🎓', 'The Teaching Company Downloader', 'Download Teaching Company lectures.', 'teaching-company', 'teaching company downloader'],
  ['🎓', 'CreativeLive Downloader', 'Download CreativeLive classes.', 'creativelive', 'creativelive downloader'],
  ['🎓', 'Domestika Downloader', 'Download Domestika courses.', 'domestika', 'domestika downloader'],
  ['🎓', 'Craftsy Downloader', 'Download Craftsy classes.', 'craftsy', 'craftsy downloader'],
  ['🎓', 'Bluprint Downloader', 'Download Bluprint classes.', 'bluprint', 'bluprint downloader'],
  ['🎓', 'Creativebug Downloader', 'Download Creativebug classes.', 'creativebug', 'creativebug downloader'],
  ['🎓', 'MasterClass Trailers Downloader', 'Download MasterClass trailers.', 'masterclass-trailers', 'masterclass trailers downloader'],
  ['🎓', 'Udemy Free Courses Downloader', 'Download Udemy free course videos.', 'udemy-free', 'udemy free courses downloader'],
  ['🎓', 'Coursera Free Courses Downloader', 'Download Coursera free course videos.', 'coursera-free', 'coursera free courses downloader'],
  ['🎓', 'edX Free Courses Downloader', 'Download edX free course videos.', 'edx-free', 'edx free courses downloader'],
  ['🎓', 'Khan Academy Math Downloader', 'Download Khan Academy math videos.', 'khan-math', 'khan academy math downloader'],
  ['🎓', 'Khan Academy Science Downloader', 'Download Khan Academy science videos.', 'khan-science', 'khan academy science downloader'],
  ['🎓', 'Khan Academy Computing Downloader', 'Download Khan Academy computing videos.', 'khan-computing', 'khan academy computing downloader'],
  ['🎓', 'Khan Academy Arts Downloader', 'Download Khan Academy arts videos.', 'khan-arts', 'khan academy arts downloader'],
  ['🎓', 'Khan Academy Economics Downloader', 'Download Khan Academy economics videos.', 'khan-economics', 'khan academy economics downloader'],
  ['🎓', 'Duolingo Stories Downloader', 'Download Duolingo story videos.', 'duolingo', 'duolingo downloader'],
  ['🎓', 'Memrise Downloader', 'Download Memrise videos.', 'memrise', 'memrise downloader'],
  ['🎓', 'Busuu Downloader', 'Download Busuu language videos.', 'busuu', 'busuu downloader'],
  ['🎓', 'Babbel Downloader', 'Download Babbel language videos.', 'babbel', 'babbel downloader'],
].forEach(([i,t,d,s,k])=>add(i,t,d,s,k));

// Kids content
[
  ['👶', 'Little Baby Bum Downloader', 'Download Little Baby Bum videos.', 'little-baby-bum', 'little baby bum downloader'],
  ['👶', 'Super Simple Songs Downloader', 'Download Super Simple Songs videos.', 'super-simple-songs', 'super simple songs downloader'],
  ['👶', 'Mother Goose Club Downloader', 'Download Mother Goose Club videos.', 'mother-goose-club', 'mother goose club downloader'],
  ['👶', 'ChuChu TV Downloader', 'Download ChuChu TV videos.', 'chuchu-tv', 'chuchu tv downloader'],
  ['👶', 'Dave and Ava Downloader', 'Download Dave and Ava videos.', 'dave-and-ava', 'dave and ava downloader'],
  ['👶', 'Baby Einstein Downloader', 'Download Baby Einstein videos.', 'baby-einstein', 'baby einstein downloader'],
  ['👶', 'Little Angel Downloader', 'Download Little Angel videos.', 'little-angel', 'little angel downloader'],
  ['👶', 'HooplaKidz Downloader', 'Download HooplaKidz videos.', 'hooplakidz', 'hooplakidz downloader'],
  ['👶', 'Wow English Downloader', 'Download Wow English videos.', 'wow-english', 'wow english downloader'],
  ['👶', 'ELF Learning Downloader', 'Download ELF Learning videos.', 'elf-learning', 'elf learning downloader'],
  ['👶', 'Maple Leaf Learning Downloader', 'Download Maple Leaf Learning videos.', 'maple-leaf-learning', 'maple leaf learning downloader'],
  ['👶', 'Kids TV Downloader', 'Download Kids TV videos.', 'kids-tv', 'kids tv downloader'],
  ['👶', 'Videogyan Downloader', 'Download Videogyan videos.', 'videogyan', 'videogyan downloader'],
  ['👶', 'Peekaboo Kidz Downloader', 'Download Peekaboo Kidz videos.', 'peekaboo-kidz', 'peekaboo kidz downloader'],
  ['👶', 'SciShow Kids Downloader', 'Download SciShow Kids videos.', 'scishow-kids', 'scishow kids downloader'],
  ['👶', 'Crash Course Kids Downloader', 'Download Crash Course Kids videos.', 'crash-course-kids', 'crash course kids downloader'],
].forEach(([i,t,d,s,k])=>add(i,t,d,s,k));

// More top creators
[
  ['🎥', 'Ali Abdaal Downloader', 'Download Ali Abdaal videos.', 'ali-abdaal', 'ali abdaal downloader'],
  ['🎥', 'Thomas Frank Downloader', 'Download Thomas Frank videos.', 'thomas-frank', 'thomas frank downloader'],
  ['🎥', 'Nathaniel Drew Downloader', 'Download Nathaniel Drew videos.', 'nathaniel-drew', 'nathaniel drew downloader'],
  ['🎥', 'Nathan Zed Downloader', 'Download Nathan Zed videos.', 'nathan-zed', 'nathan zed downloader'],
  ['🎥', 'Hannah Witton Downloader', 'Download Hannah Witton videos.', 'hannah-witton', 'hannah witton downloader'],
  ['🎥', 'Evan Edinger Downloader', 'Download Evan Edinger videos.', 'evan-edinger', 'evan edinger downloader'],
  ['🎥', 'Joey Graceffa Downloader', 'Download Joey Graceffa videos.', 'joey-graceffa', 'joey graceffa downloader'],
  ['🎥', 'Shane Dawson Downloader', 'Download Shane Dawson videos.', 'shane-dawson', 'shane dawson downloader'],
  ['🎥', 'Ryland Adams Downloader', 'Download Ryland Adams videos.', 'ryland-adams', 'ryland adams downloader'],
  ['🎥', 'Morgan Adams Downloader', 'Download Morgan Adams videos.', 'morgan-adams', 'morgan adams downloader'],
  ['🎥', 'James Charles Downloader', 'Download James Charles videos.', 'james-charles', 'james charles downloader'],
  ['🎥', 'Jeffree Star Downloader', 'Download Jeffree Star videos.', 'jeffree-star', 'jeffree star downloader'],
  ['🎥', 'Tati Westbrook Downloader', 'Download Tati Westbrook videos.', 'tati-westbrook', 'tati westbrook downloader'],
  ['🎥', 'NikkieTutorials Downloader', 'Download NikkieTutorials videos.', 'nikkietutorials', 'nikkietutorials downloader'],
  ['🎥', 'Zoella Downloader', 'Download Zoella videos.', 'zoella', 'zoella downloader'],
  ['🎥', 'Alfie Deyes Downloader', 'Download Alfie Deyes videos.', 'alfie-deyes', 'alfie deyes downloader'],
  ['🎥', 'Marcus Butler Downloader', 'Download Marcus Butler videos.', 'marcus-butler', 'marcus butler downloader'],
  ['🎥', 'Caspar Lee Downloader', 'Download Caspar Lee videos.', 'caspar-lee', 'caspar lee downloader'],
  ['🎥', 'Joe Sugg Downloader', 'Download Joe Sugg videos.', 'joe-sugg', 'joe sugg downloader'],
  ['🎥', 'Oli White Downloader', 'Download Oli White videos.', 'oli-white', 'oli white downloader'],
  ['🎥', 'Tyler Oakley Downloader', 'Download Tyler Oakley videos.', 'tyler-oakley', 'tyler oakley downloader'],
  ['🎥', 'Troye Sivan Downloader', 'Download Troye Sivan videos.', 'troye-sivan', 'troye sivan downloader'],
  ['🎥', 'Connor Franta Downloader', 'Download Connor Franta videos.', 'connor-franta', 'connor franta downloader'],
  ['🎥', 'Ricky Dillon Downloader', 'Download Ricky Dillon videos.', 'ricky-dillon', 'ricky dillon downloader'],
  ['🎥', 'Kian Lawley Downloader', 'Download Kian Lawley videos.', 'kian-lawley', 'kian lawley downloader'],
  ['🎥', 'JC Caylen Downloader', 'Download JC Caylen videos.', 'jc-caylen', 'jc caylen downloader'],
  ['🎥', 'Trevor Moran Downloader', 'Download Trevor Moran videos.', 'trevor-moran', 'trevor moran downloader'],
  ['🎥', 'Sam Pottorff Downloader', 'Download Sam Pottorff videos.', 'sam-pottorff', 'sam pottorff downloader'],
  ['🎥', 'Andrea Russett Downloader', 'Download Andrea Russett videos.', 'andrea-russett', 'andrea russett downloader'],
  ['🎥', 'Lohanthony Downloader', 'Download Lohanthony videos.', 'lohanthony', 'lohanthony downloader'],
].forEach(([i,t,d,s,k])=>add(i,t,d,s,k));

// Country TV downloaders
const countries = [
  ['🇷🇸', 'Serbian TV Downloader', 'serbian-tv'],
  ['🇭🇷', 'Croatian TV Downloader', 'croatian-tv'],
  ['🇧🇦', 'Bosnian TV Downloader', 'bosnian-tv'],
  ['🇸🇮', 'Slovenian TV Downloader', 'slovenian-tv'],
  ['🇸🇰', 'Slovak TV Downloader', 'slovak-tv'],
  ['🇱🇹', 'Lithuanian TV Downloader', 'lithuanian-tv'],
  ['🇱🇻', 'Latvian TV Downloader', 'latvian-tv'],
  ['🇪🇪', 'Estonian TV Downloader', 'estonian-tv'],
  ['🇧🇾', 'Belarusian TV Downloader', 'belarusian-tv'],
  ['🇲🇩', 'Moldovan TV Downloader', 'moldovan-tv'],
  ['🇦🇲', 'Armenian TV Downloader', 'armenian-tv'],
  ['🇦🇿', 'Azerbaijani TV Downloader', 'azerbaijani-tv'],
  ['🇬🇪', 'Georgian TV Downloader', 'georgian-tv'],
  ['🇰🇿', 'Kazakh TV Downloader', 'kazakh-tv'],
  ['🇺🇿', 'Uzbek TV Downloader', 'uzbek-tv'],
  ['🇹🇲', 'Turkmen TV Downloader', 'turkmen-tv'],
  ['🇰🇬', 'Kyrgyz TV Downloader', 'kyrgyz-tv'],
  ['🇹🇯', 'Tajik TV Downloader', 'tajik-tv'],
  ['🇦🇫', 'Afghan TV Downloader', 'afghan-tv'],
  ['🇳🇵', 'Nepali TV Downloader', 'nepali-tv'],
  ['🇱🇰', 'Sri Lankan TV Downloader', 'sri-lankan-tv'],
  ['🇲🇻', 'Maldivian TV Downloader', 'maldivian-tv'],
  ['🇲🇲', 'Myanmar TV Downloader', 'myanmar-tv'],
  ['🇰🇭', 'Cambodian TV Downloader', 'cambodian-tv'],
  ['🇱🇦', 'Laotian TV Downloader', 'laotian-tv'],
  ['🇲🇳', 'Mongolian TV Downloader', 'mongolian-tv'],
  ['🇰🇵', 'North Korean TV Downloader', 'north-korean-tv'],
  ['🇧🇳', 'Bruneian TV Downloader', 'bruneian-tv'],
  ['🇸🇬', 'Singapore TV Downloader', 'singapore-tv'],
  ['🇹🇱', 'Timorese TV Downloader', 'timorese-tv'],
  ['🇵🇬', 'Papua New Guinean TV Downloader', 'png-tv'],
  ['🇫🇯', 'Fijian TV Downloader', 'fijian-tv'],
  ['🇼🇸', 'Samoan TV Downloader', 'samoan-tv'],
  ['🇹🇴', 'Tongan TV Downloader', 'tongan-tv'],
  ['🇻🇺', 'Vanuatuan TV Downloader', 'vanuatuan-tv'],
  ['🇸🇧', 'Solomon Islands TV Downloader', 'solomon-islands-tv'],
  ['🇵🇼', 'Palauan TV Downloader', 'palauan-tv'],
  ['🇲🇭', 'Marshallese TV Downloader', 'marshallese-tv'],
  ['🇫🇲', 'Micronesian TV Downloader', 'micronesian-tv'],
  ['🇰🇮', 'Kiribati TV Downloader', 'kiribati-tv'],
  ['🇹🇻', 'Tuvaluan TV Downloader', 'tuvaluan-tv'],
  ['🇳🇷', 'Nauruan TV Downloader', 'nauruan-tv'],
  ['🇮🇸', 'Icelandic TV Downloader', 'icelandic-tv'],
  ['🇮🇪', 'Irish TV Downloader', 'irish-tv'],
  ['🏴󠁧󠁢󠁳󠁣󠁴󠁿', 'Scottish TV Downloader', 'scottish-tv'],
  ['🏴󠁧󠁢󠁷󠁬󠁳󠁿', 'Welsh TV Downloader', 'welsh-tv'],
  ['🇦🇩', 'Andorran TV Downloader', 'andorran-tv'],
  ['🇲🇨', 'Monacan TV Downloader', 'monacan-tv'],
  ['🇱🇮', 'Liechtenstein TV Downloader', 'liechtenstein-tv'],
  ['🇸🇲', 'Sammarinese TV Downloader', 'sammarinese-tv'],
  ['🇻🇦', 'Vatican TV Downloader', 'vatican-tv'],
  ['🇦🇱', 'Albanian TV Downloader', 'albanian-tv'],
  ['🇲🇰', 'Macedonian TV Downloader', 'macedonian-tv'],
  ['🇲🇪', 'Montenegrin TV Downloader', 'montenegrin-tv'],
  ['🇽🇰', 'Kosovar TV Downloader', 'kosovar-tv'],
  ['🇧🇹', 'Bhutanese TV Downloader', 'bhutanese-tv'],
  ['🇲🇴', 'Macanese TV Downloader', 'macanese-tv'],
  ['🇭🇰', 'Hong Kong TV Downloader', 'hong-kong-tv'],
  ['🇹🇼', 'Taiwanese TV Downloader', 'taiwanese-tv'],
];
countries.forEach(([flag, title, slug]) => {
  const country = title.replace(' TV Downloader', '');
  add(flag, title, `Download ${country} TV shows and clips.`, slug, `${slug.replace(/-tv$/, '')} tv downloader ${country.toLowerCase()} video downloader`);
});

// Country news downloaders
const newsCountries = [
  'Serbian', 'Croatian', 'Bosnian', 'Slovenian', 'Slovak', 'Lithuanian', 'Latvian',
  'Estonian', 'Belarusian', 'Moldovan', 'Armenian', 'Azerbaijani', 'Georgian', 'Kazakh',
  'Uzbek', 'Turkmen', 'Kyrgyz', 'Tajik', 'Afghan', 'Nepali', 'Sri Lankan', 'Maldivian',
  'Myanmar', 'Cambodian', 'Laotian', 'Mongolian', 'North Korean', 'Bruneian', 'Singapore',
  'Timorese', 'Papua New Guinean', 'Fijian', 'Samoan', 'Tongan', 'Vanuatuan', 'Solomon Islands',
  'Palauan', 'Marshallese', 'Micronesian', 'Kiribati', 'Tuvaluan', 'Nauruan', 'Icelandic',
  'Irish', 'Scottish', 'Welsh', 'Andorran', 'Monacan', 'Liechtenstein', 'Sammarinese',
  'Vatican', 'Albanian', 'Macedonian', 'Montenegrin', 'Kosovar', 'Bhutanese', 'Macanese', 'Hong Kong', 'Taiwanese'
];
newsCountries.forEach(country => {
  const slug = `${country.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-news`;
  add('📰', `${country} News Downloader`, `Download ${country} news videos.`, slug, `${slug.replace(/-news$/, '')} news downloader ${country.toLowerCase()} news`);
});

fs.writeFileSync(toolsPath, JSON.stringify([...tools, ...newTools], null, 2));
console.log(`Added ${newTools.length} new tools. Total: ${tools.length + newTools.length}`);
