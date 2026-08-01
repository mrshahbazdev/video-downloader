import json
import os
import re

GUIDES = [
    {
        "slug": "how-to-download-reddit-videos-with-audio",
        "title": "How to Download Reddit Videos with Audio",
        "site": "Reddit",
        "formats": "MP4 with audio",
        "summary": "Save Reddit posts and videos with audio as MP4 from public subreddit links.",
        "description": "Reddit video downloader with audio. Learn how to download Reddit videos and posts as MP4.",
        "intro": "Reddit hosts millions of user-generated videos across subreddits. From funny clips to educational content, you may want to save a Reddit post to watch offline or share with friends who do not use Reddit. This guide explains how to download Reddit videos with audio safely.",
        "extra_h2": "What makes Reddit downloads different",
        "extra_p": "Reddit videos are often hosted on Reddit's own player or embedded from third-party services. The audio and video streams may be separate, which means some tools only download the silent video. A good downloader merges the streams automatically so you get both sound and picture.",
        "steps": [
            "Open the Reddit post containing the video.",
            "Copy the URL from the address bar. It looks like https://www.reddit.com/r/subreddit/comments/...",
            "Go to the ClipVault home page and paste the link.",
            "Click Get Video and wait for the format list.",
            "Choose the MP4 option that includes audio and click to download.",
        ],
        "tips": [
            "Public posts work best. Private or deleted posts cannot be downloaded.",
            "If audio is missing, try a different MP4 format in the list.",
            "Some subreddits restrict crossposting; respect the community rules.",
            "Use the file manager on your phone to move the saved video to a preferred folder.",
        ],
        "faqs": [
            ("Why is there no sound in my Reddit video?", "Audio may be in a separate stream. Pick the muxed MP4 option or try another format."),
            ("Can I download NSFW videos?", "Only if the content is legal and you have permission. Many NSFW communities have strict rules."),
            ("Do I need a Reddit account?", "No, public posts can be downloaded without logging in."),
        ]
    },
    {
        "slug": "how-to-download-soundcloud-music-to-mp3",
        "title": "How to Download SoundCloud Music to MP3",
        "site": "SoundCloud",
        "formats": "MP3, M4A, WAV",
        "summary": "Convert SoundCloud tracks, playlists, and sets to MP3 or WAV quickly.",
        "description": "SoundCloud to MP3 downloader guide. Learn how to download SoundCloud music as MP3, M4A, or WAV.",
        "intro": "SoundCloud is one of the largest platforms for independent musicians, podcasts, and remixes. If you want to listen to a SoundCloud track offline or include a royalty-free song in a personal project, converting it to MP3 is a practical option.",
        "extra_h2": "Understanding SoundCloud track permissions",
        "extra_p": "SoundCloud tracks can be public, private, or available only with a Go+ subscription. Public tracks from artists who allow downloads are the easiest to save. For subscription-only or private tracks, you need explicit permission or the artist's provided access.",
        "steps": [
            "Open the SoundCloud track or playlist in your browser.",
            "Tap the Share button and copy the link, or copy the URL from the address bar.",
            "Visit ClipVault and open the MP3 downloader.",
            "Paste the SoundCloud URL and click Get Video.",
            "Select MP3 or another audio format and download the file.",
        ],
        "tips": [
            "Choose 320 kbps MP3 for the best balance of quality and file size.",
            "If you need lossless audio, look for WAV or FLAC options when available.",
            "Support independent artists by buying their music when you can.",
            "Do not redistribute downloads without a license.",
        ],
        "faqs": [
            ("Is downloading SoundCloud music legal?", "Only for tracks you own or that the artist allows you to download."),
            ("Can I download SoundCloud playlists?", "Yes, if the playlist is public and the tracks allow downloads."),
            ("Why is the quality lower than expected?", "SoundCloud streams are often compressed. Choose the highest bitrate available."),
        ]
    },
    {
        "slug": "how-to-download-bilibili-videos",
        "title": "How to Download Bilibili Videos",
        "site": "Bilibili",
        "formats": "MP4",
        "summary": "Download anime, clips, and shows from Bilibili in MP4 format.",
        "description": "Bilibili video downloader guide. Learn how to save Bilibili videos and anime clips as MP4.",
        "intro": "Bilibili is a popular Chinese video platform known for anime, gaming, and user-generated content. Many viewers outside China want to download Bilibili videos for offline viewing or language study. This guide covers the easiest way to save Bilibili videos as MP4.",
        "extra_h2": "Why Bilibili downloads sometimes fail",
        "extra_p": "Bilibili has strong anti-bot protection and region checks. If a cloud server tries to access a Bilibili URL, the site may return a 412 error or challenge page. Using cookies from your own browser or a residential IP can help access videos you are allowed to watch.",
        "steps": [
            "Open the Bilibili video in your browser and copy the URL.",
            "It usually looks like https://www.bilibili.com/video/BV...",
            "Paste the URL into ClipVault and click Get Video.",
            "Wait for the format list to load.",
            "Choose MP4 and download the video.",
        ],
        "tips": [
            "For region-locked videos, try cookies or a proxy in the Advanced options.",
            "Some Bilibili videos have multiple parts; download each part separately.",
            "Check the video's license before sharing or reusing.",
            "Use a download manager if the file is large.",
        ],
        "faqs": [
            ("Do I need to log in to download Bilibili videos?", "Public videos may not require login, but member-only videos need cookies."),
            ("Can I download 1080p Bilibili videos?", "Yes, if the original upload is available in high resolution."),
            ("Why do I see a 412 error?", "Bilibili is blocking the server. Use cookies or a different network."),
        ]
    },
    {
        "slug": "how-to-download-dailymotion-videos",
        "title": "How to Download Dailymotion Videos",
        "site": "Dailymotion",
        "formats": "MP4",
        "summary": "Download Dailymotion videos and clips as MP4 in the quality you choose.",
        "description": "Dailymotion video downloader guide. Save Dailymotion videos as MP4 with ClipVault.",
        "intro": "Dailymotion is a major video-sharing platform hosting news, music, sports, and entertainment content. If you want to save a Dailymotion video to watch later, you can do it in a few simple steps.",
        "extra_h2": "What makes Dailymotion a good source",
        "extra_p": "Dailymotion often has content that is hard to find elsewhere, including European TV clips, music interviews, and independent films. The platform supports multiple resolutions, so you can pick the quality that matches your device and data plan.",
        "steps": [
            "Open the Dailymotion video in your browser.",
            "Copy the URL from the address bar. It looks like https://www.dailymotion.com/video/ID",
            "Go to ClipVault and paste the link.",
            "Click Get Video and wait for the format list.",
            "Choose an MP4 quality and click to download.",
        ],
        "tips": [
            "Lower resolutions download faster and use less storage.",
            "Some Dailymotion videos are geo-restricted; use an allowed network.",
            "Check the uploader's rights before reusing the content.",
            "Download during off-peak hours for faster speeds.",
        ],
        "faqs": [
            ("Is Dailymotion download free?", "Yes, for public videos that allow access."),
            ("Can I download Dailymotion on mobile?", "Yes, use any mobile browser."),
            ("What format should I choose?", "MP4 is the most compatible format across devices."),
        ]
    },
    {
        "slug": "how-to-download-9gag-memes-and-videos",
        "title": "How to Download 9GAG Memes and Videos",
        "site": "9GAG",
        "formats": "MP4 or WEBM",
        "summary": "Save 9GAG memes, funny videos, and GIFs as MP4 or WEBM.",
        "description": "9GAG video downloader guide. Download 9GAG memes and funny videos as MP4 or WEBM.",
        "intro": "9GAG is one of the most popular platforms for memes, funny clips, and viral content. If you want to save a 9GAG video or GIF to share with friends or keep for later, you can download it directly in your browser.",
        "extra_h2": "9GAG video formats",
        "extra_p": "9GAG posts are usually short videos or GIFs. The platform may serve them as MP4 or WEBM. MP4 is the safest choice because it works on almost every device and messaging app.",
        "steps": [
            "Open the 9GAG post in your browser or app.",
            "Copy the post URL from the address bar.",
            "Paste the link into ClipVault and click Get Video.",
            "Select MP4 or WEBM from the format list.",
            "Click to download the meme or video.",
        ],
        "tips": [
            "Short clips download quickly even on mobile data.",
            "MP4 works best for sharing on WhatsApp, Telegram, and other apps.",
            "Always credit the original creator when resharing.",
            "Avoid downloading content that violates 9GAG's rules.",
        ],
        "faqs": [
            ("Can I download 9GAG GIFs?", "Yes, GIFs are often available as MP4 or WEBM."),
            ("Do 9GAG videos have watermarks?", "No, downloaded videos usually do not include 9GAG branding."),
            ("Is it legal to share downloaded 9GAG videos?", "Only if you have permission or the content is public domain."),
        ]
    },
    {
        "slug": "how-to-download-odysee-videos",
        "title": "How to Download Odysee Videos",
        "site": "Odysee / LBRY",
        "formats": "MP4",
        "summary": "Save decentralized Odysee and LBRY videos as MP4.",
        "description": "Odysee and LBRY video downloader guide. Download decentralized videos as MP4.",
        "intro": "Odysee is a video platform built on the LBRY decentralized protocol. It hosts content from creators who value free speech and direct monetization. If you want to watch Odysee videos offline, you can download them as MP4.",
        "extra_h2": "How Odysee hosting works",
        "extra_p": "Unlike traditional platforms, Odysee content is distributed across a peer network. This means download links can come from multiple sources, making downloads usually fast and reliable. The direct MP4 link is often available without merging separate streams.",
        "steps": [
            "Open the Odysee video in your browser.",
            "Copy the URL from the address bar. It looks like https://odysee.com/@channel/video:ID",
            "Paste the URL into ClipVault and click Get Video.",
            "Wait for the format list.",
            "Select MP4 and click to download.",
        ],
        "tips": [
            "MP4 is usually available directly, so downloads are fast.",
            "Support creators by tipping them on Odysee when you enjoy their work.",
            "Respect each creator's reuse policy.",
            "Back up important videos in case they are removed from the network.",
        ],
        "faqs": [
            ("Do I need an Odysee account?", "No, public videos can be downloaded without an account."),
            ("Can I download livestream replays?", "If the replay is public and available as a video, yes."),
            ("Is Odysee content copyrighted?", "Yes. Always follow the creator's license."),
        ]
    },
    {
        "slug": "how-to-download-internet-archive-videos",
        "title": "How to Download Internet Archive Videos",
        "site": "Internet Archive",
        "formats": "MP4, AVI, OGG",
        "summary": "Download public domain and archived videos from archive.org in various formats.",
        "description": "Internet Archive video downloader guide. Save public domain and archived videos as MP4, AVI, or OGG.",
        "intro": "The Internet Archive is a nonprofit digital library offering millions of free books, movies, music, and websites. Many videos on archive.org are in the public domain or under Creative Commons, making them safe to download and reuse.",
        "extra_h2": "Finding public domain movies",
        "extra_p": "Archive.org has dedicated collections for public domain films, classic cartoons, old TV shows, and educational videos. Each item page shows the license, so you can confirm whether reuse is allowed before downloading.",
        "steps": [
            "Go to archive.org and find the video you want.",
            "Copy the item URL, for example https://archive.org/details/filename",
            "Paste the link into ClipVault and click Get Video.",
            "Wait for the available formats to appear.",
            "Choose MP4, AVI, or OGG and download.",
        ],
        "tips": [
            "Check the license on the item page before reusing.",
            "Older formats like AVI may be larger; MP4 is usually the best choice.",
            "Use the Internet Archive's collections to discover rare content.",
            "Credit archive.org and the original uploader when sharing.",
        ],
        "faqs": [
            ("Are all Internet Archive videos public domain?", "No, some have specific licenses. Always check the item page."),
            ("Can I use these videos in my project?", "Yes, if the license allows. Public domain videos can be used freely."),
            ("Why are some files very large?", "Older formats and high resolutions can have large file sizes."),
        ]
    },
    {
        "slug": "how-to-download-peertube-videos",
        "title": "How to Download PeerTube Videos",
        "site": "PeerTube",
        "formats": "MP4",
        "summary": "Download PeerTube videos from any instance as MP4 for offline viewing.",
        "description": "PeerTube video downloader guide. Save videos from decentralized PeerTube instances as MP4.",
        "intro": "PeerTube is a decentralized, open-source video platform. Instead of one central server, videos are spread across many instances run by different organizations and individuals. This guide explains how to download PeerTube videos as MP4.",
        "extra_h2": "PeerTube instances and federation",
        "extra_p": "Because PeerTube is federated, a video URL may look different depending on which instance hosts it. Common domains include peertube.tv, peertube.cpy.re, and many custom instances. The download process is the same for all public instances.",
        "steps": [
            "Open the PeerTube video on its instance.",
            "Copy the URL from the address bar.",
            "Paste the URL into ClipVault and click Get Video.",
            "Wait for the format list.",
            "Select MP4 and download.",
        ],
        "tips": [
            "Public videos are easiest to download. Private or local videos may need login.",
            "Some instances limit downloads; respect the instance's rules.",
            "MP4 is the standard format and works everywhere.",
            "Support PeerTube creators through donations or subscriptions when available.",
        ],
        "faqs": [
            ("Do I need an account on the PeerTube instance?", "No, public videos can be downloaded without an account."),
            ("Can I download live replays?", "Yes, if the replay is published as a public video."),
            ("Is PeerTube content free to use?", "It depends on the license chosen by the uploader."),
        ]
    },
    {
        "slug": "how-to-download-mixcloud-audio",
        "title": "How to Download Mixcloud Audio",
        "site": "Mixcloud",
        "formats": "MP3",
        "summary": "Download Mixcloud DJ mixes, radio shows, and podcasts as MP3.",
        "description": "Mixcloud to MP3 downloader guide. Save DJ mixes, radio shows, and podcasts from Mixcloud.",
        "intro": "Mixcloud is a popular platform for DJ mixes, radio shows, podcasts, and long-form audio. If you want to listen to a mix offline or keep an episode for later, you can convert it to MP3.",
        "extra_h2": "Why Mixcloud is different from music streaming",
        "extra_p": "Mixcloud focuses on long-form audio and pays royalties to artists through its licensing agreements. Because of this, downloads should be limited to personal use. Uploaders can enable or disable downloads on their profiles.",
        "steps": [
            "Open the Mixcloud show or mix in your browser.",
            "Copy the URL from the address bar.",
            "Paste it into ClipVault and open the MP3 downloader.",
            "Click Get Video and wait for the audio formats.",
            "Select MP3 and download.",
        ],
        "tips": [
            "Long mixes can be large; choose a bitrate that balances quality and size.",
            "Use headphones or speakers for the best listening experience.",
            "Support Mixcloud creators by following their profiles.",
            "Do not repost full mixes without permission."],
        "faqs": [
            ("Can I download any Mixcloud show?", "Public shows that allow access can usually be converted."),
            ("Is Mixcloud download legal for personal use?", "Yes, if the uploader allows it and you do not redistribute."),
            ("What bitrate should I choose?", "192–256 kbps is good for mixes; 320 kbps is best quality."),
        ]
    },
    {
        "slug": "how-to-download-bandcamp-music",
        "title": "How to Download Bandcamp Music",
        "site": "Bandcamp",
        "formats": "MP3 or FLAC",
        "summary": "Download Bandcamp tracks and albums as MP3 or FLAC when available.",
        "description": "Bandcamp to MP3 downloader guide. Save Bandcamp music in MP3 or FLAC with ClipVault.",
        "intro": "Bandcamp is a music platform loved by independent artists and labels. It often offers tracks and albums in multiple formats including MP3, FLAC, and AAC. If an artist allows downloads, you can save the music to your device.",
        "extra_h2": "Bandcamp download options",
        "extra_p": "Artists can set a price, offer name-your-price, or give away music for free. Purchased music can usually be downloaded directly from Bandcamp. For free or stream-only tracks, you should check the artist's download settings.",
        "steps": [
            "Open the Bandcamp track or album page.",
            "Copy the URL from the address bar.",
            "Paste it into ClipVault and open the MP3 downloader.",
            "Click Get Video and select the audio format.",
            "Download the file to your device.",
        ],
        "tips": [
            "Buy music on Bandcamp to support artists directly.",
            "FLAC is best for archiving; MP3 is best for everyday listening.",
            "Check the artist's licensing terms before using music in videos.",
            "Create a local music folder to keep your downloads organized.",
        ],
        "faqs": [
            ("Can I download Bandcamp for free?", "Only if the artist offers it for free or name-your-price at zero."),
            ("What is the best audio quality on Bandcamp?", "FLAC is lossless and offers the highest quality."),
            ("Can I download full albums?", "Yes, if the album is public and the artist allows downloads."),
        ]
    },
    {
        "slug": "how-to-download-podcast-episodes-online",
        "title": "How to Download Podcast Episodes Online",
        "site": "podcasts",
        "formats": "MP3",
        "summary": "Download podcast episodes and shows as MP3 for offline listening.",
        "description": "Podcast downloader guide. Save podcast episodes as MP3 for offline listening on any device.",
        "intro": "Podcasts are a great source of education, entertainment, and news. If you want to listen offline during a commute or flight, downloading episodes as MP3 is the easiest solution.",
        "extra_h2": "Where podcasts are hosted",
        "extra_p": "Podcasts are usually hosted on dedicated services, podcast apps, or websites. The audio file is often an MP3 with a public URL. You can paste that URL into a downloader or subscribe using an RSS feed in a podcast app.",
        "steps": [
            "Find the podcast episode you want to download.",
            "Copy the episode URL or the direct MP3 file link.",
            "Go to ClipVault and open the MP3 downloader.",
            "Paste the URL and click Get Video.",
            "Select MP3 and download.",
        ],
        "tips": [
            "Use a podcast app for automatic downloads of subscribed shows.",
            "Download episodes on Wi-Fi to save mobile data.",
            "Organize podcasts by show and date in your file manager.",
            "Check the podcast's license before sharing episodes.",
        ],
        "faqs": [
            ("Can I download any podcast?", "Public podcasts with direct MP3 links can be downloaded."),
            ("Do I need a special app?", "No, a browser-based downloader works too."),
            ("What bitrate are podcast MP3s?", "Usually 64–128 kbps, which is enough for speech."),
        ]
    },
    {
        "slug": "best-video-formats-for-downloading",
        "title": "Best Video Formats for Downloading",
        "site": "online video",
        "formats": "MP4, WEBM, MKV, MOV",
        "summary": "Learn which video formats to choose when downloading videos for different devices and uses.",
        "description": "Best video formats for downloading. Compare MP4, WEBM, MKV, and MOV for compatibility, quality, and file size.",
        "intro": "When you download a video, you often have a choice of formats. Picking the right one affects playback quality, file size, and compatibility with your device. This guide explains the most common video download formats and when to use each.",
        "extra_h2": "MP4: the universal choice",
        "extra_p": "MP4 is the most widely supported video format. It works on phones, tablets, computers, TVs, and game consoles. MP4 files use efficient compression, so they balance good quality with reasonable file size. For most users, MP4 is the best default.",
        "steps": [
            "Consider your playback device. Phones and TVs usually prefer MP4.",
            "Think about file size. Lower resolution MP4 files take less storage.",
            "For web uploads, MP4 or WEBM work best.",
            "For editing, MOV or ProRes may be better if available.",
            "For archiving, MKV can hold multiple audio and subtitle tracks.",
        ],
        "tips": [
            "MP4 with H.264 codec plays almost everywhere.",
            "WEBM is great for web pages but may not play on older TVs.",
            "MKV is flexible but may not be supported by all devices.",
            "MOV files from Apple devices are high quality but large.",
        ],
        "faqs": [
            ("What is the most compatible video format?", "MP4 with H.264 is supported by almost every device."),
            ("Which format has the smallest file size?", "MP4 and WEBM are usually the most compressed."),
            ("Should I download in 4K?", "Only if your screen supports 4K and you have enough storage."),
        ]
    },
    {
        "slug": "how-to-choose-right-video-resolution",
        "title": "How to Choose the Right Video Resolution",
        "site": "online video",
        "formats": "144p to 4K",
        "summary": "Understand video resolutions from 144p to 4K and pick the best one for your device.",
        "description": "Video resolution guide. Learn how to choose between 144p, 360p, 720p, 1080p, and 4K when downloading videos.",
        "intro": "Video resolution determines how sharp and detailed a video looks. Higher resolutions look better but require more storage and bandwidth. This guide helps you choose the right resolution for your screen, storage, and internet speed.",
        "extra_h2": "Common video resolutions explained",
        "extra_p": "144p and 240p are low resolutions useful only when data is very limited. 360p and 480p are standard for small screens and mobile viewing. 720p is considered high definition and looks good on most devices. 1080p is full HD and ideal for laptops and TVs. 1440p and 4K are ultra-high definitions best for large 4K screens.",
        "steps": [
            "Check your device's screen resolution.",
            "Estimate how much storage you can spare.",
            "Consider your internet speed and data plan.",
            "For phones, 720p is usually enough.",
            "For TVs and monitors, choose 1080p or 4K when available.",
        ],
        "tips": [
            "Downloading a higher resolution than your screen can show wastes storage.",
            "720p uses about 1 GB per hour; 1080p about 2 GB; 4K can use 7 GB or more.",
            "For speech and tutorials, 720p is often sufficient.",
            "For nature and cinematic videos, higher resolutions matter more.",
        ],
        "faqs": [
            ("Is 720p good enough?", "Yes, for most phones and small tablets."),
            ("Does higher resolution always look better?", "Not if your screen cannot display it."),
            ("Can I change resolution after downloading?", "Yes, with a video converter, but quality may be lost."),
        ]
    },
    {
        "slug": "youtube-shorts-download-guide",
        "title": "YouTube Shorts Download Guide",
        "site": "YouTube Shorts",
        "formats": "MP4",
        "summary": "Save YouTube Shorts as MP4 for offline viewing on any device.",
        "description": "YouTube Shorts downloader guide. Learn how to download YouTube Shorts videos as MP4.",
        "intro": "YouTube Shorts are short, vertical videos designed for quick viewing. They are popular for comedy, education, and viral moments. If you want to save a Short to watch later or use in a personal project, you can download it as MP4.",
        "extra_h2": "Shorts URLs are different",
        "extra_p": "A YouTube Shorts URL usually starts with https://youtube.com/shorts/. Some tools treat Shorts the same as regular YouTube videos, while others need the specific URL format. A good downloader handles both automatically.",
        "steps": [
            "Open the YouTube Short in your app or browser.",
            "Tap Share and copy the link.",
            "Paste the URL into ClipVault and click Get Video.",
            "Select MP4 from the format list.",
            "Download and enjoy the Short offline.",
        ],
        "tips": [
            "Shorts are vertical; downloads keep the same aspect ratio.",
            "For mobile viewing, 720p or 1080p is ideal.",
            "Only download Shorts you created or have permission to use.",
            "Avoid reshaping Shorts without the creator's consent.",
        ],
        "faqs": [
            ("Can I download Shorts without a watermark?", "Yes, downloaded Shorts do not include YouTube UI overlays."),
            ("Do Shorts download in HD?", "Yes, if the original upload was HD."),
            ("Can I share downloaded Shorts?", "Only with permission or for personal use."),
        ]
    },
    {
        "slug": "how-to-download-videos-on-android",
        "title": "How to Download Videos on Android",
        "site": "Android",
        "formats": "MP4 or MP3",
        "summary": "A complete guide to downloading videos and audio on Android phones and tablets.",
        "description": "Android video downloader guide. Save videos and audio on Android using any browser.",
        "intro": "Android users have many options for downloading videos, but browser-based tools are the simplest because they do not require installing apps from unknown sources. This guide explains how to download videos on Android safely.",
        "extra_h2": "Why browser downloaders are safer",
        "extra_p": "Installing video downloader apps from outside the Play Store can expose your device to malware and excessive permissions. Browser-based downloaders let you paste a URL, pick a format, and save the file directly without installing anything.",
        "steps": [
            "Copy the video URL from the app or browser.",
            "Open Chrome or any browser on your Android device.",
            "Go to ClipVault and paste the URL.",
            "Solve the captcha and tap Get Video.",
            "Choose MP4 or MP3 and tap to download.",
        ],
        "tips": [
            "Use Chrome's built-in download manager to track progress.",
            "Move downloaded files to your SD card if storage is low.",
            "Use a file manager to rename and organize downloads.",
            "Download over Wi-Fi to avoid data charges.",
        ],
        "faqs": [
            ("Do I need an app?", "No, browser-based downloaders work on Android."),
            ("Where do downloads go?", "Usually to the Downloads folder or Files app."),
            ("Can I download 4K on Android?", "Yes, if your device has enough storage and the source offers 4K."),
        ]
    },
    {
        "slug": "how-to-download-videos-on-pc-without-software",
        "title": "How to Download Videos on PC Without Software",
        "site": "Windows / Mac / Linux",
        "formats": "MP4 or MP3",
        "summary": "Download videos on your computer without installing any software using a web browser.",
        "description": "PC video downloader guide. Save videos on Windows, Mac, and Linux without installing software.",
        "intro": "Many people prefer not to install extra software on their computers. Online video downloaders let you save videos using only your web browser. This guide shows how to download videos on PC without software.",
        "extra_h2": "Benefits of browser-based downloaders",
        "extra_p": "Browser downloaders work on Windows, Mac, and Linux without installation. They reduce the risk of malware and keep your system clean. They also update automatically on the server side, so you do not need to install updates.",
        "steps": [
            "Copy the video URL from your browser's address bar.",
            "Open a new tab and go to ClipVault.",
            "Paste the URL into the input box.",
            "Click Get Video and wait for the format list.",
            "Choose MP4 or MP3 and click to save the file.",
        ],
        "tips": [
            "Use a modern browser like Chrome, Firefox, or Edge.",
            "Disable popup blockers if downloads do not start.",
            "Organize downloads into folders by category.",
            "Scan downloaded files if you are unsure about the source.",
        ],
        "faqs": [
            ("Is it safe to download without software?", "Yes, if you use a reputable browser-based tool."),
            ("Can I download on Mac?", "Yes, any browser works on Mac."),
            ("Do I need to create an account?", "No, browser downloaders usually do not require signup."),
        ]
    },
    {
        "slug": "how-to-download-live-stream-replays",
        "title": "How to Download Live Stream Replays",
        "site": "live streams",
        "formats": "MP4",
        "summary": "Save live stream replays from Twitch, YouTube Live, and other platforms as MP4.",
        "description": "Live stream replay downloader guide. Save past live streams from Twitch, YouTube Live, and more as MP4.",
        "intro": "Live streams are broadcast in real time, but many platforms save replays after the stream ends. If you want to watch a replay offline or keep it for reference, you can download the replay as MP4.",
        "extra_h2": "Replay availability varies by platform",
        "extra_p": "Twitch keeps past broadcasts for a limited time. YouTube Live videos become regular videos on the channel. Facebook Live replays may be public or private depending on the creator's settings. Always check if the replay is public before downloading.",
        "steps": [
            "Find the live stream replay on the platform.",
            "Copy the replay URL from the address bar.",
            "Paste it into ClipVault and click Get Video.",
            "Wait for the available formats.",
            "Choose MP4 and download.",
        ],
        "tips": [
            "Download replays before Twitch deletes them if the streamer has not enabled permanent storage.",
            "Long streams can be very large; choose a lower resolution if needed.",
            "Only download replays you have permission to save.",
            "Use a download manager for large files.",
        ],
        "faqs": [
            ("Can I download a live stream while it is live?", "Usually no. Wait for the replay to be published."),
            ("Are all live replays public?", "No, some are private or subscriber-only."),
            ("How long do Twitch replays last?", "Usually 14 days for regular streamers and 60 days for Partners and Turbo users."),
        ]
    },
    {
        "slug": "downloading-videos-safely-no-malware",
        "title": "Downloading Videos Safely Without Malware",
        "site": "online video",
        "formats": "MP4 or MP3",
        "summary": "Learn how to avoid malware, popups, and scams while downloading videos online.",
        "description": "Safe video downloading guide. Avoid malware and scams while downloading videos and audio online.",
        "intro": "The internet is full of video downloader sites, but not all of them are safe. Some show aggressive ads, ask for unnecessary permissions, or try to install unwanted software. This guide explains how to download videos safely without malware.",
        "extra_h2": "Red flags to watch for",
        "extra_p": "Be cautious of sites that ask you to install browser extensions, download executable files, or fill out surveys before downloading. Legitimate online downloaders process the URL in your browser and offer a direct file download without extra steps.",
        "steps": [
            "Use a trusted downloader with clear privacy and legal pages.",
            "Avoid sites that force you to install software or extensions.",
            "Do not enter personal information or passwords.",
            "Check the downloaded file extension. MP4, MP3, and similar media files are normal.",
            "Scan unknown files with antivirus before opening.",
        ],
        "tips": [
            "Look for HTTPS and a privacy policy on the downloader site.",
            "Avoid sites with excessive popups and fake download buttons.",
            "Use an ad blocker if the site has intrusive ads.",
            "Keep your browser and antivirus updated.",
        ],
        "faqs": [
            ("Can video downloaders give you viruses?", "Untrusted downloaders or required software can contain malware."),
            ("How do I know a site is safe?", "Check for HTTPS, clear legal pages, and no forced downloads."),
            ("Should I install a downloader app?", "Browser-based tools are usually safer and do not require installation."),
        ]
    },
    {
        "slug": "how-to-download-educational-videos-legally",
        "title": "How to Download Educational Videos Legally",
        "site": "education",
        "formats": "MP4 or MP3",
        "summary": "Save educational videos, lectures, and tutorials for personal study while respecting copyright.",
        "description": "Educational video downloader guide. Learn how to download lectures and tutorials legally for offline study.",
        "intro": "Educational videos are valuable for students, teachers, and lifelong learners. Many creators and institutions allow downloading content for personal or educational use. This guide explains how to download educational videos legally.",
        "extra_h2": "Legal sources for educational video",
        "extra_p": "TED Talks, Khan Academy, MIT OpenCourseWare, Crash Course, and many university channels publish content under Creative Commons or educational licenses. Some platforms include a download button directly on the video page. When a download button is available, use it first.",
        "steps": [
            "Find the educational video on a trusted platform.",
            "Check if the video has a download button or Creative Commons license.",
            "If no direct download is available, copy the public URL.",
            "Paste the URL into a downloader like ClipVault.",
            "Choose MP4 or MP3 and save the file for personal study.",
        ],
        "tips": [
            "Keep a list of sources and licenses for your downloaded content.",
            "Do not share downloaded lectures publicly without permission.",
            "Use subtitles or transcripts to improve learning.",
            "Organize videos by subject and topic.",
        ],
        "faqs": [
            ("Can students download lectures?", "Yes, for personal study if the lecture is publicly available."),
            ("Can teachers show downloaded videos in class?", "It depends on the license and local educational exemptions."),
            ("Is TED content free to download?", "Many TED Talks are Creative Commons and allow non-commercial sharing."),
        ]
    },
    {
        "slug": "top-10-sites-free-stock-video-downloads",
        "title": "Top 10 Sites for Free Stock Video Downloads",
        "site": "stock video",
        "formats": "MP4, MOV",
        "summary": "Discover the best free stock video sites with legally downloadable footage.",
        "description": "Top 10 free stock video sites. Download free stock footage for personal and commercial projects.",
        "intro": "Free stock video can improve presentations, YouTube videos, websites, and social media posts. Many sites offer high-quality footage under public domain or royalty-free licenses. This guide lists the top 10 sites for free stock video downloads.",
        "extra_h2": "Our top picks for free stock video",
        "extra_p": "Pexels, Pixabay, and Videvo offer modern, high-quality clips under permissive licenses. Coverr and Mixkit specialize in short cinematic footage. Life of Vids and Splitshire provide unique content. Videezy and StockSnap have large collections, and the Internet Archive offers historical public domain footage.",
        "steps": [
            "Choose a stock video site from our recommended list.",
            "Search for the footage you need.",
            "Read the license terms for each clip.",
            "Download the clip in the highest available resolution.",
            "Credit the creator if the license requires it.",
        ],
        "tips": [
            "Always check the license before using footage commercially.",
            "Look for 4K clips if your final project is high resolution.",
            "Use consistent color grading across multiple clips.",
            "Keep a folder of favorite clips organized by theme.",
        ],
        "faqs": [
            ("Can I use free stock videos commercially?", "Yes, if the license allows commercial use."),
            ("Do I need to credit the creator?", "Some licenses require attribution; read the terms."),
            ("Are these sites safe?", "The well-known sites listed above are reputable and safe."),
        ]
    }
]

TEMPLATE = r"""<section class="bg-white dark:bg-slate-900 py-16">
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
    <h1 class="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-6 text-center">{{ title }}</h1>
    <p class="text-sm text-slate-500 dark:text-slate-400 text-center mb-10">Last updated: {{ current_year }}</p>

    <div class="prose dark:prose-invert max-w-none">
      <p class="text-slate-600 dark:text-slate-400">
        {{ intro }}
      </p>

      <h2 class="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">{{ extra_h2 }}</h2>
      <p class="text-slate-600 dark:text-slate-400">{{ extra_p }}</p>

      <h2 class="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">Step-by-step guide</h2>
      <ol class="list-decimal pl-6 space-y-2 text-slate-600 dark:text-slate-400">
        {% for step in steps %}<li>{{ step }}</li>{% endfor %}
      </ol>

      <h2 class="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">Helpful tips</h2>
      <ul class="list-disc pl-6 space-y-2 text-slate-600 dark:text-slate-400">
        {% for tip in tips %}<li>{{ tip }}</li>{% endfor %}
      </ul>

      <h2 class="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">Legal and safety reminder</h2>
      <p class="text-slate-600 dark:text-slate-400">Only download content you created, own, or have explicit permission to use. Respect copyright, platform terms, and local laws. For more details, read our <a href="/content-policy" class="text-sky-600 dark:text-sky-400 hover:underline">Content Policy</a>.</p>

      <h2 class="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">Frequently Asked Questions</h2>
      <div class="space-y-4">
        {% for q, a in faqs %}
        <details class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
          <summary class="font-semibold text-slate-900 dark:text-white cursor-pointer">{{ q }}</summary>
          <p class="mt-3 text-slate-600 dark:text-slate-400 text-sm">{{ a }}</p>
        </details>
        {% endfor %}
      </div>
    </div>
  </div>
</section>
"""

def render(tpl, **kwargs):
    # simple jinja-like replacement
    out = tpl
    for key, val in kwargs.items():
        placeholder = '{{ ' + key + ' }}'
        out = out.replace(placeholder, str(val))
    # loops
    import re
    def loop_replace(m):
        var = m.group(1).strip()
        body = m.group(2)
        items = kwargs.get(var, [])
        result = ''
        for item in items:
            if isinstance(item, tuple):
                q, a = item
                result += body.replace('{{ q }}', q).replace('{{ a }}', a)
            else:
                result += body.replace('{{ item }}', str(item))
        return result
    out = re.sub(r'{% for \w+ in (\w+) %}(.*?){% endfor %}', loop_replace, out, flags=re.DOTALL)
    return out

def main():
    base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    blog_dir = os.path.join(base, 'views', 'blog')
    json_path = os.path.join(base, 'data', 'blogPosts.json')
    with open(json_path, 'r') as f:
        posts = json.load(f)
    existing_slugs = {p['slug'] for p in posts}
    current_year = str(__import__('datetime').datetime.now().year)
    for guide in GUIDES:
        if guide['slug'] in existing_slugs:
            print(f"Skipping existing {guide['slug']}")
            continue
        rendered = render(TEMPLATE,
                          title=guide['title'],
                          intro=guide['intro'],
                          extra_h2=guide['extra_h2'],
                          extra_p=guide['extra_p'],
                          steps=guide['steps'],
                          tips=guide['tips'],
                          faqs=guide['faqs'],
                          current_year=current_year)
        path = os.path.join(blog_dir, guide['slug'] + '.ejs')
        with open(path, 'w') as f:
            f.write(rendered)
        posts.append({
            "slug": guide['slug'],
            "title": guide['title'],
            "site": guide['site'],
            "formats": guide['formats'],
            "summary": guide['summary'],
            "description": guide['description']
        })
        print(f"Created {path}")
    with open(json_path, 'w') as f:
        json.dump(posts, f, indent=2)
    print(f"Updated {json_path} with {len(posts)} posts")

if __name__ == '__main__':
    main()
