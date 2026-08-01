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

// Streaming services
add('📺', 'Netflix Downloader', 'Download Netflix trailers and clips.', 'netflix', 'netflix downloader');
add('📺', 'Hulu Downloader', 'Download Hulu videos and shows.', 'hulu', 'hulu downloader');
add('📺', 'Disney+ Downloader', 'Download Disney+ movies and shows.', 'disney-plus', 'disney plus downloader');
add('📺', 'HBO Max Downloader', 'Download HBO Max videos.', 'hbo-max', 'hbo max downloader');
add('📺', 'Paramount+ Downloader', 'Download Paramount+ videos.', 'paramount-plus', 'paramount plus downloader');
add('📺', 'Peacock Downloader', 'Download Peacock videos.', 'peacock', 'peacock downloader');
add('📺', 'Apple TV+ Downloader', 'Download Apple TV+ videos.', 'apple-tv-plus', 'apple tv plus downloader');
add('📺', 'Amazon Prime Video Downloader', 'Download Prime Video trailers and clips.', 'prime-video', 'amazon prime video downloader');
add('📺', 'Discovery+ Downloader', 'Download Discovery+ videos.', 'discovery-plus', 'discovery plus downloader');
add('📺', 'AMC+ Downloader', 'Download AMC+ videos.', 'amc-plus', 'amc plus downloader');
add('📺', 'Shudder Downloader', 'Download Shudder horror videos.', 'shudder', 'shudder downloader');
add('📺', 'Acorn TV Downloader', 'Download Acorn TV shows.', 'acorn-tv', 'acorn tv downloader');
add('📺', 'BritBox Downloader', 'Download BritBox shows.', 'britbox', 'britbox downloader');
add('📺', 'CuriosityStream Downloader', 'Download CuriosityStream docs.', 'curiositystream', 'curiositystream downloader');
add('📺', 'MagellanTV Downloader', 'Download MagellanTV documentaries.', 'magellantv', 'magellantv downloader');
add('📺', 'Nebula Downloader', 'Download Nebula creator videos.', 'nebula', 'nebula downloader');
add('📺', 'Rooster Teeth Downloader', 'Download Rooster Teeth videos.', 'rooster-teeth', 'rooster teeth downloader');
add('📺', 'Dropout Downloader', 'Download Dropout streaming videos.', 'dropout', 'dropout downloader');
add('📺', 'Tubi Downloader', 'Download Tubi movies and shows.', 'tubi', 'tubi downloader');
add('📺', 'Pluto TV Downloader', 'Download Pluto TV videos.', 'pluto-tv', 'pluto tv downloader');
add('📺', 'The Roku Channel Downloader', 'Download Roku Channel videos.', 'roku-channel', 'roku channel downloader');
add('📺', 'Amazon Freevee Downloader', 'Download Freevee videos.', 'freevee', 'freevee downloader');
add('📺', 'Xumo Downloader', 'Download Xumo streaming videos.', 'xumo', 'xumo downloader');
add('📺', 'Crackle Downloader', 'Download Crackle movies.', 'crackle', 'crackle downloader');
add('📺', 'Popcornflix Downloader', 'Download Popcornflix movies.', 'popcornflix', 'popcornflix downloader');
add('📺', 'Kanopy Downloader', 'Download Kanopy documentaries.', 'kanopy', 'kanopy downloader');
add('📺', 'Hoopla Downloader', 'Download Hoopla videos.', 'hoopla', 'hoopla downloader');

// Japanese / Asian streaming
add('🇯🇵', 'TVer Downloader', 'Download TVer Japanese shows.', 'tver', 'tver downloader');
add('🇯🇵', 'AbemaTV Downloader', 'Download AbemaTV videos.', 'abematv', 'abematv downloader');
add('🇯🇵', 'NHK World Downloader', 'Download NHK World videos.', 'nhk-world', 'nhk world downloader');
add('🇯🇵', 'NHK Plus Downloader', 'Download NHK Plus videos.', 'nhk-plus', 'nhk plus downloader');
add('🇯🇵', 'Fuji TV On Demand Downloader', 'Download Fuji TV videos.', 'fuji-tv', 'fuji tv downloader');
add('🇯🇵', 'TV Asahi Downloader', 'Download TV Asahi videos.', 'tv-asahi', 'tv asahi downloader');
add('🇯🇵', 'Nippon TV Downloader', 'Download Nippon TV videos.', 'nippon-tv', 'nippon tv downloader');
add('🇯🇵', 'TBS Japan Downloader', 'Download TBS Japan videos.', 'tbs-japan', 'tbs japan downloader');
add('🇯🇵', 'MBS Downloader', 'Download MBS Japanese videos.', 'mbs', 'mbs downloader');
add('🇯🇵', 'GYAO Downloader', 'Download GYAO videos.', 'gyao', 'gyao downloader');
add('🇯🇵', 'Paravi Downloader', 'Download Paravi videos.', 'paravi', 'paravi downloader');
add('🇯🇵', 'FOD Downloader', 'Download Fuji TV FOD videos.', 'fod', 'fod downloader');
add('🇯🇵', 'Hulu Japan Downloader', 'Download Hulu Japan videos.', 'hulu-japan', 'hulu japan downloader');
add('🇯🇵', 'U-NEXT Downloader', 'Download U-NEXT videos.', 'u-next', 'u next downloader');
add('🇯🇵', 'DMM TV Downloader', 'Download DMM TV videos.', 'dmm-tv', 'dmm tv downloader');
add('🇯🇵', 'Rakuten Viki Downloader', 'Download Rakuten Viki shows.', 'rakuten-viki', 'rakuten viki downloader');
add('🇯🇵', 'Weverse Downloader', 'Download Weverse videos.', 'weverse', 'weverse downloader');
add('🇰🇷', 'V Live Downloader', 'Download V Live K-pop videos.', 'vlive', 'vlive downloader');
add('🇰🇷', 'Weverse Live Downloader', 'Download Weverse Live streams.', 'weverse-live', 'weverse live downloader');
add('🇰🇷', 'Kocowa Downloader', 'Download Kocowa K-dramas.', 'kocowa', 'kocowa downloader');
add('🇰🇷', 'OnDemandKorea Downloader', 'Download OnDemandKorea shows.', 'ondemandkorea', 'ondemandkorea downloader');
add('🇰🇷', 'SBS Korea Downloader', 'Download SBS Korea videos.', 'sbs-korea', 'sbs korea downloader');
add('🇰🇷', 'KBS World Downloader', 'Download KBS World videos.', 'kbs-world', 'kbs world downloader');
add('🇰🇷', 'MBC Korea Downloader', 'Download MBC Korea videos.', 'mbc-korea', 'mbc korea downloader');
add('🇰🇷', 'Yonhap News Downloader', 'Download Yonhap News videos.', 'yonhap', 'yonhap downloader');

// Indian
add('🇮🇳', 'Airtel Xstream Downloader', 'Download Airtel Xstream videos.', 'airtel-xstream', 'airtel xstream downloader');
add('🇮🇳', 'Vi Movies and TV Downloader', 'Download Vi Movies and TV videos.', 'vi-movies', 'vi movies downloader');
add('🇮🇳', 'Tata Play Downloader', 'Download Tata Play videos.', 'tata-play', 'tata play downloader');
add('🇮🇳', 'Zee News Downloader', 'Download Zee News videos.', 'zee-news', 'zee news downloader');
add('🇮🇳', 'Aaj Tak Downloader', 'Download Aaj Tak videos.', 'aaj-tak', 'aaj tak downloader');
add('🇮🇳', 'ABP News Downloader', 'Download ABP News videos.', 'abp-news', 'abp news downloader');
add('🇮🇳', 'India Today Downloader', 'Download India Today videos.', 'india-today', 'india today downloader');
add('🇮🇳', 'NDTV Downloader', 'Download NDTV videos.', 'ndtv', 'ndtv downloader');
add('🇮🇳', 'Republic World Downloader', 'Download Republic World videos.', 'republic-world', 'republic world downloader');
add('🇮🇳', 'WION Downloader', 'Download WION news videos.', 'wion', 'wion downloader');
add('🇮🇳', 'News18 Downloader', 'Download News18 videos.', 'news18', 'news18 downloader');
add('🇮🇳', 'Times Now Downloader', 'Download Times Now videos.', 'times-now', 'times now downloader');
add('🇮🇳', 'Mirror Now Downloader', 'Download Mirror Now videos.', 'mirror-now', 'mirror now downloader');
add('🇮🇳', 'CNN-News18 Downloader', 'Download CNN-News18 videos.', 'cnn-news18', 'cnn news18 downloader');
add('🇮🇳', 'The Wire Downloader', 'Download The Wire videos.', 'the-wire', 'the wire downloader');
add('🇮🇳', 'Scroll.in Downloader', 'Download Scroll.in videos.', 'scroll', 'scroll.in downloader');
add('🇮🇳', 'ThePrint Downloader', 'Download ThePrint videos.', 'theprint', 'theprint downloader');

// Chinese platforms
add('🇨🇳', 'Mango TV Downloader', 'Download Mango TV shows.', 'mango-tv', 'mango tv downloader');
add('🇨🇳', 'Sohu Video Downloader', 'Download Sohu Video content.', 'sohu', 'sohu video downloader');
add('🇨🇳', 'PPTV Downloader', 'Download PPTV videos.', 'pptv', 'pptv downloader');
add('🇨🇳', 'LeTV Downloader', 'Download LeTV videos.', 'letv', 'letv downloader');
add('🇨🇳', 'AcFun Downloader', 'Download AcFun videos.', 'acfun', 'acfun downloader');
add('🇨🇳', 'Bilibili Comics Downloader', 'Download Bilibili Comics videos.', 'bilibili-comics', 'bilibili comics downloader');
add('🇨🇳', 'Kuaishou KShow Downloader', 'Download KShow videos.', 'kshow', 'kshow downloader');
add('🇨🇳', 'Xiaohongshu Downloader', 'Download Xiaohongshu videos.', 'xiaohongshu', 'xiaohongshu downloader');

// More social & short-form
add('📱', 'Likee Downloader', 'Download Likee videos.', 'likee', 'likee downloader');
add('📱', 'Triller Downloader', 'Download Triller videos.', 'triller', 'triller downloader');
add('📱', 'Dubsmash Downloader', 'Download Dubsmash videos.', 'dubsmash', 'dubsmash downloader');
add('📱', 'Byte Downloader', 'Download Byte videos.', 'byte', 'byte downloader');
add('📱', 'Clash Downloader', 'Download Clash videos.', 'clash', 'clash downloader');
add('📱', 'Clapper Downloader', 'Download Clapper videos.', 'clapper', 'clapper downloader');
add('📱', 'Lemon8 Downloader', 'Download Lemon8 videos.', 'lemon8', 'lemon8 downloader');
add('📱', 'Nonolive Downloader', 'Download Nonolive streams.', 'nonolive', 'nonolive downloader');
add('📱', 'StreamKar Downloader', 'Download StreamKar live videos.', 'streamkar', 'streamkar downloader');
add('📱', 'Uplive Downloader', 'Download Uplive streams.', 'uplive', 'uplive downloader');
add('📱', 'Tango Live Downloader', 'Download Tango Live streams.', 'tango-live', 'tango live downloader');
add('📱', 'Bigo Live Global Downloader', 'Download Bigo Live Global streams.', 'bigo-live-global', 'bigo live global downloader');
add('📱', 'UpStream Downloader', 'Download UpStream live videos.', 'upstream', 'upstream downloader');
add('📱', 'Trovo Downloader', 'Download Trovo live videos.', 'trovo', 'trovo downloader');
add('📱', 'DLive Downloader', 'Download DLive streams.', 'dlive', 'dlive downloader');
add('📱', 'Theta.tv Downloader', 'Download Theta.tv streams.', 'theta', 'theta tv downloader');
add('📱', 'Caffeine Downloader', 'Download Caffeine live streams.', 'caffeine', 'caffeine downloader');
add('📱', 'OmeTV Downloader', 'Download OmeTV videos.', 'ometv', 'ometv downloader');

// Bollywood / Hollywood / regional cinema
add('🎬', 'Bollywood Movie Trailer Downloader', 'Download Bollywood trailers.', 'bollywood-trailer', 'bollywood trailer downloader');
add('🎬', 'Hollywood Movie Trailer Downloader', 'Download Hollywood trailers.', 'hollywood-trailer', 'hollywood trailer downloader');
add('🎬', 'Korean Drama Downloader', 'Download Korean dramas.', 'korean-drama', 'korean drama downloader');
add('🎬', 'K-Pop MV Downloader', 'Download K-pop music videos.', 'kpop-mv', 'kpop mv downloader');
add('🎬', 'J-Pop MV Downloader', 'Download J-pop music videos.', 'jpop-mv', 'jpop mv downloader');
add('🎬', 'C-Pop MV Downloader', 'Download C-pop music videos.', 'cpop-mv', 'cpop mv downloader');
add('🎬', 'Indian Pop MV Downloader', 'Download Indian pop music videos.', 'indian-pop-mv', 'indian pop mv downloader');
add('🎬', 'Bollywood Song Downloader', 'Download Bollywood songs.', 'bollywood-song', 'bollywood song downloader');
add('🎬', 'Hollywood Song Downloader', 'Download Hollywood songs.', 'hollywood-song', 'hollywood song downloader');
add('🎬', 'Punjabi Song Downloader', 'Download Punjabi songs.', 'punjabi-song', 'punjabi song downloader');
add('🎬', 'Tamil Song Downloader', 'Download Tamil songs.', 'tamil-song', 'tamil song downloader');
add('🎬', 'Telugu Song Downloader', 'Download Telugu songs.', 'telugu-song', 'telugu song downloader');
add('🎬', 'Kannada Song Downloader', 'Download Kannada songs.', 'kannada-song', 'kannada song downloader');
add('🎬', 'Malayalam Song Downloader', 'Download Malayalam songs.', 'malayalam-song', 'malayalam song downloader');
add('🎬', 'Marathi Song Downloader', 'Download Marathi songs.', 'marathi-song', 'marathi song downloader');
add('🎬', 'Bengali Song Downloader', 'Download Bengali songs.', 'bengali-song', 'bengali song downloader');
add('🎬', 'Bhojpuri Song Downloader', 'Download Bhojpuri songs.', 'bhojpuri-song', 'bhojpuri song downloader');
add('🎬', 'Gujarati Song Downloader', 'Download Gujarati songs.', 'gujarati-song', 'gujarati song downloader');
add('🎬', 'Haryanvi Song Downloader', 'Download Haryanvi songs.', 'haryanvi-song', 'haryanvi song downloader');
add('🎬', 'Rajasthani Song Downloader', 'Download Rajasthani songs.', 'rajasthani-song', 'rajasthani song downloader');
add('🎬', 'Urdu Song Downloader', 'Download Urdu songs.', 'urdu-song', 'urdu song downloader');
add('🎬', 'Pashto Song Downloader', 'Download Pashto songs.', 'pashto-song', 'pashto song downloader');
add('🎬', 'Sindhi Song Downloader', 'Download Sindhi songs.', 'sindhi-song', 'sindhi song downloader');

// More music / audio
add('🎵', '8D Tunes Downloader', 'Download 8D audio music.', '8d-tunes', '8d tunes downloader');
add('🎵', 'Free Music Archive Downloader', 'Download Free Music Archive tracks.', 'free-music-archive', 'free music archive downloader');
add('🎵', 'ccMixter Downloader', 'Download ccMixter remixes.', 'ccmixter', 'ccmixter downloader');
add('🎵', 'Musopen Downloader', 'Download Musopen classical music.', 'musopen', 'musopen downloader');
add('🎵', 'FreePD Downloader', 'Download FreePD music.', 'freepd', 'freepd downloader');
add('🎵', 'Incompetech Downloader', 'Download Incompetech royalty-free music.', 'incompetech', 'incompetech downloader');
add('🎵', 'Bensound Downloader', 'Download Bensound royalty-free music.', 'bensound', 'bensound downloader');
add('🎵', 'Epidemic Sound Downloader', 'Download Epidemic Sound tracks.', 'epidemic-sound', 'epidemic sound downloader');
add('🎵', 'Artlist Downloader', 'Download Artlist music.', 'artlist', 'artlist downloader');
add('🎵', 'Musicbed Downloader', 'Download Musicbed songs.', 'musicbed', 'musicbed downloader');
add('🎵', 'Soundstripe Downloader', 'Download Soundstripe music.', 'soundstripe', 'soundstripe downloader');
add('🎵', 'Pond5 Downloader', 'Download Pond5 music and videos.', 'pond5', 'pond5 downloader');
add('🎵', 'AudioJungle Downloader', 'Download AudioJungle music.', 'audiojungle', 'audiojungle downloader');
add('🎵', 'PremiumBeat Downloader', 'Download PremiumBeat tracks.', 'premiumbeat', 'premiumbeat downloader');

// Audiobook / reading
add('📖', 'Scribd Downloader', 'Download Scribd audiobook samples.', 'scribd', 'scribd downloader');
add('📖', 'Audiobooks.com Downloader', 'Download Audiobooks.com samples.', 'audiobooks-com', 'audiobooks.com downloader');
add('📖', 'Downpour Downloader', 'Download Downpour audiobooks.', 'downpour', 'downpour downloader');
add('📖', 'Libro.fm Downloader', 'Download Libro.fm audiobooks.', 'libro-fm', 'libro fm downloader');
add('📖', 'Loyal Books Downloader', 'Download Loyal Books audiobooks.', 'loyal-books', 'loyal books downloader');
add('📖', 'Open Culture Audio Downloader', 'Download Open Culture audio.', 'open-culture-audio', 'open culture audio downloader');

// More news / US networks
add('📰', 'PBS Newshour Downloader', 'Download PBS Newshour videos.', 'pbs-newshour', 'pbs newshour downloader');
add('📰', 'Face the Nation Downloader', 'Download Face the Nation videos.', 'face-the-nation', 'face the nation downloader');
add('📰', 'Meet the Press Downloader', 'Download Meet the Press videos.', 'meet-the-press', 'meet the press downloader');
add('📰', 'Fox News Downloader', 'Download Fox News videos.', 'fox-news', 'fox news downloader');
add('📰', 'Newsmax Downloader', 'Download Newsmax videos.', 'newsmax', 'newsmax downloader');
add('📰', 'OAN Downloader', 'Download One America News videos.', 'oan', 'oan downloader');
add('📰', 'The Hill Downloader', 'Download The Hill videos.', 'the-hill', 'the hill downloader');
add('📰', 'Vox Downloader', 'Download Vox explainer videos.', 'vox', 'vox downloader');
add('📰', 'NowThis Downloader', 'Download NowThis videos.', 'nowthis', 'nowthis downloader');
add('📰', 'AJ+ Downloader', 'Download AJ+ videos.', 'ajplus', 'ajplus downloader');
add('📰', 'Quartz Downloader', 'Download Quartz videos.', 'quartz', 'quartz downloader');
add('📰', 'Axios Downloader', 'Download Axios videos.', 'axios', 'axios downloader');
add('📰', 'Politico Downloader', 'Download Politico videos.', 'politico', 'politico downloader');
add('📰', 'ProPublica Downloader', 'Download ProPublica videos.', 'propublica', 'propublica downloader');
add('📰', 'Mother Jones Downloader', 'Download Mother Jones videos.', 'mother-jones', 'mother jones downloader');
add('📰', 'Slate Downloader', 'Download Slate videos.', 'slate', 'slate downloader');
add('📰', 'Salon Downloader', 'Download Salon videos.', 'salon', 'salon downloader');
add('📰', 'Daily Beast Downloader', 'Download Daily Beast videos.', 'daily-beast', 'daily beast downloader');
add('📰', 'HuffPost Downloader', 'Download HuffPost videos.', 'huffpost', 'huffpost downloader');
add('📰', 'BuzzFeed News Downloader', 'Download BuzzFeed News videos.', 'buzzfeed-news', 'buzzfeed news downloader');

// More sports leagues
add('⚽', 'Premier League Downloader', 'Download Premier League highlights.', 'premier-league', 'premier league downloader');
add('⚽', 'La Liga Downloader', 'Download La Liga highlights.', 'la-liga', 'la liga downloader');
add('⚽', 'Serie A Downloader', 'Download Serie A highlights.', 'serie-a', 'serie a downloader');
add('⚽', 'Bundesliga Downloader', 'Download Bundesliga highlights.', 'bundesliga', 'bundesliga downloader');
add('⚽', 'Ligue 1 Downloader', 'Download Ligue 1 highlights.', 'ligue-1', 'ligue 1 downloader');
add('⚽', 'Champions League Downloader', 'Download Champions League highlights.', 'champions-league', 'champions league downloader');
add('⚽', 'Europa League Downloader', 'Download Europa League highlights.', 'europa-league', 'europa league downloader');
add('⚽', 'FIFA World Cup Downloader', 'Download World Cup videos.', 'world-cup', 'world cup downloader');
add('🏏', 'IPL Downloader', 'Download IPL cricket highlights.', 'ipl', 'ipl downloader');
add('🏏', 'Cricket World Cup Downloader', 'Download Cricket World Cup videos.', 'cricket-world-cup', 'cricket world cup downloader');
add('🏏', 'BBL Downloader', 'Download Big Bash League videos.', 'bbl', 'bbl downloader');
add('🏏', 'CPL Downloader', 'Download Caribbean Premier League videos.', 'cpl', 'cpl downloader');
add('🏀', 'EuroLeague Downloader', 'Download EuroLeague videos.', 'euroleague', 'euroleague downloader');
add('🏈', 'Premiership Rugby Downloader', 'Download Premiership Rugby videos.', 'premiership-rugby', 'premiership rugby downloader');
add('🎾', 'ATP Tour Downloader', 'Download ATP Tour videos.', 'atp-tour', 'atp tour downloader');
add('🎾', 'WTA Tour Downloader', 'Download WTA Tour videos.', 'wta-tour', 'wta tour downloader');
add('🎾', 'Grand Slam Downloader', 'Download Grand Slam tennis videos.', 'grand-slam', 'grand slam downloader');
add('🏎️', 'Formula 1 Downloader', 'Download Formula 1 videos.', 'formula-1', 'formula 1 downloader');
add('🏎️', 'NASCAR Downloader', 'Download NASCAR videos.', 'nascar', 'nascar downloader');
add('🏎️', 'MotoGP Downloader', 'Download MotoGP videos.', 'motogp', 'motogp downloader');
add('🏎️', 'IndyCar Downloader', 'Download IndyCar videos.', 'indycar', 'indycar downloader');

// More creators / brands
add('🎥', 'Beast Reacts Downloader', 'Download Beast Reacts videos.', 'beast-reacts', 'beast reacts downloader');
add('🎥', 'MrBeast Gaming Downloader', 'Download MrBeast Gaming videos.', 'mrbeast-gaming', 'mrbeast gaming downloader');
add('🎥', 'MrBeast Philanthropy Downloader', 'Download MrBeast Philanthropy videos.', 'mrbeast-philanthropy', 'mrbeast philanthropy downloader');
add('🎥', 'PewDiePie Highlights Downloader', 'Download PewDiePie highlights.', 'pewdiepie-highlights', 'pewdiepie highlights downloader');
add('🎥', 'Marques Brownlee Shorts Downloader', 'Download MKBHD shorts.', 'mkbhd-shorts', 'mkbhd shorts downloader');
add('🎥', 'Linus Tech Tips Shorts Downloader', 'Download LTT shorts.', 'ltt-shorts', 'ltt shorts downloader');
add('🎥', 'Unbox Therapy Shorts Downloader', 'Download Unbox Therapy shorts.', 'unbox-therapy-shorts', 'unbox therapy shorts downloader');
add('🎥', 'JRE Clips Downloader', 'Download JRE Clips.', 'jre-clips', 'jre clips downloader');
add('🎥', 'H3 Podcast Highlights Downloader', 'Download H3 Podcast highlights.', 'h3-highlights', 'h3 highlights downloader');
add('🎥', 'Lex Clips Downloader', 'Download Lex Fridman clips.', 'lex-clips', 'lex clips downloader');
add('🎥', 'Huberman Lab Clips Downloader', 'Download Huberman Lab clips.', 'huberman-clips', 'huberman clips downloader');
add('🎥', 'Tim Ferriss Clips Downloader', 'Download Tim Ferriss clips.', 'tim-ferriss-clips', 'tim ferriss clips downloader');
add('🎥', 'The Rich Roll Podcast Clips Downloader', 'Download Rich Roll clips.', 'rich-roll-clips', 'rich roll clips downloader');

// More generic feature tools
add('🛠️', 'Fast Video Downloader', 'Download videos faster with optimized settings.', 'fast-video', 'fast video downloader');
add('🛠️', 'HD Video Downloader', 'Download videos in HD quality.', 'hd-video', 'hd video downloader');
add('🛠️', '4K Video Downloader', 'Download videos in 4K resolution.', '4k-video', '4k video downloader');
add('🛠️', '8K Video Downloader', 'Download videos in 8K resolution.', '8k-video', '8k video downloader');
add('🛠️', '1080p Video Downloader', 'Download videos in 1080p.', '1080p-video', '1080p video downloader');
add('🛠️', '720p Video Downloader', 'Download videos in 720p.', '720p-video', '720p video downloader');
add('🛠️', '360p Video Downloader', 'Download videos in 360p.', '360p-video', '360p video downloader');
add('🛠️', 'Mobile Video Downloader', 'Download videos optimized for mobile.', 'mobile-video', 'mobile video downloader');
add('🛠️', 'PC Video Downloader', 'Download videos for PC.', 'pc-video', 'pc video downloader');
add('🛠️', 'Mac Video Downloader', 'Download videos for Mac.', 'mac-video', 'mac video downloader');
add('🛠️', 'Linux Video Downloader', 'Download videos for Linux.', 'linux-video', 'linux video downloader');
add('🛠️', 'Android Video Downloader', 'Download videos for Android.', 'android-video', 'android video downloader');
add('🛠️', 'iPhone Video Downloader', 'Download videos for iPhone.', 'iphone-video', 'iphone video downloader');
add('🛠️', 'iPad Video Downloader', 'Download videos for iPad.', 'ipad-video', 'ipad video downloader');
add('🛠️', 'Tablet Video Downloader', 'Download videos for tablets.', 'tablet-video', 'tablet video downloader');
add('🛠️', 'Smart TV Video Downloader', 'Download videos for Smart TV.', 'smart-tv-video', 'smart tv video downloader');
add('🛠️', 'Chromecast Video Downloader', 'Download videos for Chromecast.', 'chromecast-video', 'chromecast video downloader');
add('🛠️', 'Firestick Video Downloader', 'Download videos for Firestick.', 'firestick-video', 'firestick video downloader');
add('🛠️', 'Roku Video Downloader', 'Download videos for Roku.', 'roku-video', 'roku video downloader');
add('🛠️', 'Apple TV Video Downloader', 'Download videos for Apple TV.', 'apple-tv-video', 'apple tv video downloader');
add('🛠️', 'Offline Video Downloader', 'Download videos to watch offline.', 'offline-video', 'offline video downloader');
add('🛠️', 'Batch MP3 Downloader', 'Convert multiple videos to MP3.', 'batch-mp3', 'batch mp3 downloader');
add('🛠️', 'Batch MP4 Downloader', 'Download multiple videos as MP4.', 'batch-mp4', 'batch mp4 downloader');
add('🛠️', 'Fast MP3 Converter', 'Fast convert videos to MP3.', 'fast-mp3', 'fast mp3 converter');
add('🛠️', 'High Quality MP3 Downloader', 'Download high quality MP3 audio.', 'high-quality-mp3', 'high quality mp3 downloader');
add('🛠️', '320kbps MP3 Downloader', 'Download 320kbps MP3 audio.', '320kbps-mp3', '320kbps mp3 downloader');
add('🛠️', '256kbps MP3 Downloader', 'Download 256kbps MP3 audio.', '256kbps-mp3', '256kbps mp3 downloader');
add('🛠️', '128kbps MP3 Downloader', 'Download 128kbps MP3 audio.', '128kbps-mp3', '128kbps mp3 downloader');

fs.writeFileSync(toolsPath, JSON.stringify([...tools, ...newTools], null, 2));
console.log(`Added ${newTools.length} new tools. Total: ${tools.length + newTools.length}`);
