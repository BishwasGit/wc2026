export type CuratedChannel = {
  name: string;
  logo: string;
  group: string;
  urls: string[];
  type?: "hls" | "web" | "external";
};

export const CURATED_CHANNELS: CuratedChannel[] = [
  {
    name: "FOX Sports (USA)",
    logo: "https://iptv-org.github.io/iptv/logos/foxsports.png",
    group: "World Cup 2026",
    urls: [
      "https://d1jzu95oc8fgt3.cloudfront.net/FOX_Sports.m3u8",
      "https://jmp2.uk/plu-5a74b8e1e22a61737979c6bf.m3u8",
      "https://live-manifest.production-public.tubi.io/live/6035c7fd-efff-4ec7-93dc-aa0c7a58ba47/playlist.m3u8",
    ],
  },
  {
    name: "FOX Sports 2 (USA)",
    logo: "https://iptv-org.github.io/iptv/logos/foxsports2.png",
    group: "World Cup 2026",
    urls: [
      "https://tvsen7.aynaott.com/foxsports2/index.m3u8",
    ],
  },
  {
    name: "FIFA+ (World Cup)",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/FIFA%2B_logo.svg/256px-FIFA%2B_logo.svg.png",
    group: "World Cup 2026",
    urls: [
      "https://a62dad94.wurl.com/master/f36d25e7e52f1ba8d7e56eb859c636563214f541/UmFrdXRlblRWV1VfRklGQVBsdXNFbmdsaXNoX0hMUw/playlist.m3u8",
    ],
  },
];
