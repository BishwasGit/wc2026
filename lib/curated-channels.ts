export type CuratedChannel = {
  name: string;
  logo: string;
  group: string;
  urls: string[];
};

export const CURATED_CHANNELS: CuratedChannel[] = [
  {
    name: "FIFA+ (World Cup)",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/FIFA%2B_logo.svg/256px-FIFA%2B_logo.svg.png",
    group: "World Cup 2026",
    urls: [
      "https://a62dad94.wurl.com/master/f36d25e7e52f1ba8d7e56eb859c636563214f541/UmFrdXRlblRWV1VfRklGQVBsdXNFbmdsaXNoX0hMUw/playlist.m3u8",
    ],
  },
  {
    name: "ESPN (USA)",
    logo: "https://iptv-org.github.io/iptv/logos/espn.png",
    group: "World Cup 2026",
    urls: [
      "https://waw01-1gbe.fscdn.fun/espn/tracks-v1a1/mono.m3u8",
    ],
  },
  {
    name: "ESPN 2 (USA)",
    logo: "https://iptv-org.github.io/iptv/logos/espn2.png",
    group: "World Cup 2026",
    urls: [
      "https://waw01-1gbe.fscdn.fun/ESPN2/tracks-v1a1/mono.m3u8",
    ],
  },
  {
    name: "TNT (USA)",
    logo: "https://iptv-org.github.io/iptv/logos/tnt.png",
    group: "World Cup 2026",
    urls: [
      "https://jfk01-10gbe.fscdn.fun/tnt/tracks-v1a1/mono.ts.m3u8",
    ],
  },
  {
    name: "ABC (USA)",
    logo: "https://iptv-org.github.io/iptv/logos/abc.png",
    group: "World Cup 2026",
    urls: [
      "https://waw01-1gbe.fscdn.fun/abc/tracks-v1a1/mono.m3u8",
    ],
  },
  {
    name: "Fox Sports (USA)",
    logo: "https://iptv-org.github.io/iptv/logos/foxsports.png",
    group: "World Cup 2026",
    urls: [
      "https://apollo.production-public.tubi.io/live/fox-sports-espanol.m3u8",
    ],
  },
  {
    name: "Sky Sports Premier League (UK)",
    logo: "https://iptv-org.github.io/iptv/logos/skysportspremierleague.png",
    group: "World Cup 2026",
    urls: [
      "https://waw01-1gbe.fscdn.fun/skysportspremierleague/tracks-v1a1/mono.m3u8",
    ],
  },
  {
    name: "BeIN Sports (MENA)",
    logo: "https://iptv-org.github.io/iptv/logos/beinsports.png",
    group: "World Cup 2026",
    urls: [
      "https://uzayterligi.lol/static/bs1.m3u8",
      "https://uzayterligi.lol/static/bs4.m3u8",
    ],
  },
  {
    name: "ORF 1 (Austria)",
    logo: "https://iptv-org.github.io/iptv/logos/orf1.png",
    group: "World Cup 2026",
    urls: [
      "https://orf1.mdn.ors.at/out/u/orf1/q6a/manifest_6.m3u8",
    ],
  },
  {
    name: "ORF Sport+ (Austria)",
    logo: "https://iptv-org.github.io/iptv/logos/orfsportplus.png",
    group: "World Cup 2026",
    urls: [
      "https://orfs.mdn.ors.at/out/u/orfs/q6a/manifest_6.m3u8",
    ],
  },
  {
    name: "Das Erste / ARD (Germany)",
    logo: "https://iptv-org.github.io/iptv/logos/daserste.png",
    group: "World Cup 2026",
    urls: [
      "https://mcdn.daserste.de/daserste/de/master.m3u8",
    ],
  },
  {
    name: "ZDF (Germany)",
    logo: "https://iptv-org.github.io/iptv/logos/zdf.png",
    group: "World Cup 2026",
    urls: [
      "http://zdf-hls-15.akamaized.net/hls/live/2016498/de/high/master.m3u8",
    ],
  },
  {
    name: "La 1 / RTVE (Spain)",
    logo: "https://iptv-org.github.io/iptv/logos/la1.png",
    group: "World Cup 2026",
    urls: [
      "http://rtvev4-live.hss.adaptive.level3.net/egress/ahandler/rtvegl7/la1_lv3_aosv4_gl7/la1_lv3_aosv4_gl7.isml/la1_lv3_aosv4_gl7-audio=128000-video=1500000.m3u8",
    ],
  },
  {
    name: "Teledeporte / RTVE (Spain)",
    logo: "https://iptv-org.github.io/iptv/logos/teledeporte.png",
    group: "World Cup 2026",
    urls: [
      "http://hlsliveamdgl1-lh.akamaihd.net/i/hlsdvrlive_1@39732/master.m3u8",
    ],
  },
  {
    name: "NRK1 (Norway)",
    logo: "https://iptv-org.github.io/iptv/logos/nrk1.png",
    group: "World Cup 2026",
    urls: [
      "https://nrk-live-no.akamaized.net/nrk1_dk6/sc-gaFEEA/m534_index.m3u8",
    ],
  },
  {
    name: "SVT1 (Sweden)",
    logo: "https://iptv-org.github.io/iptv/logos/svt1.png",
    group: "World Cup 2026",
    urls: [
      "https://svt1-d.akamaized.net/se/svt1/master-fmp4.m3u8",
    ],
  },
  {
    name: "SVT2 (Sweden)",
    logo: "https://iptv-org.github.io/iptv/logos/svt2.png",
    group: "World Cup 2026",
    urls: [
      "https://svt2-d.akamaized.net/se/svt2/master-fmp4.m3u8",
    ],
  },
  {
    name: "BBC One (UK)",
    logo: "https://iptv-org.github.io/iptv/logos/bbcone.png",
    group: "World Cup 2026",
    urls: [
      "https://vs-hls-push-uk-live.akamaized.net/x=4/i=urn:bbc:pips:service:bbc_one_hd/t=3840/v=pv14/b=5070016/main.m3u8",
    ],
  },
  {
    name: "BBC Two (UK)",
    logo: "https://iptv-org.github.io/iptv/logos/bbctwo.png",
    group: "World Cup 2026",
    urls: [
      "https://vs-hls-push-uk-live.akamaized.net/x=4/i=urn:bbc:pips:service:bbc_two_hd/t=3840/v=pv14/b=5070016/main.m3u8",
    ],
  },
  {
    name: "SRF 1 (Switzerland)",
    logo: "https://iptv-org.github.io/iptv/logos/srf1.png",
    group: "World Cup 2026",
    urls: [
      "https://srfs.akamaized.net/hls/live/689649/srfsgeo/index.m3u8",
    ],
  },
];
