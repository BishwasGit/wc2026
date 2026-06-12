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
    logo: "",
    group: "World Cup 2026",
    urls: [
      "https://a62dad94.wurl.com/master/f36d25e7e52f1ba8d7e56eb859c636563214f541/UmFrdXRlblRWV1VfRklGQVBsdXNFbmdsaXNoX0hMUw/playlist.m3u8",
    ],
  },
  {
    name: "PBS Kids",
    logo: "https://i.imgur.com/q4cUQKW.png",
    group: "Kids",
    urls: [
      "https://livestream.pbskids.org/out/v1/14507d931bbe48a69287e4850e53443c/est.m3u8",
    ],
  },
  {
    name: "Moonbug Kids",
    logo: "https://i.imgur.com/vZHtxQb.png",
    group: "Kids",
    urls: [
      "https://moonbug-rokuus.amagi.tv/playlist.m3u8",
    ],
  },
  {
    name: "Kartoon Channel!",
    logo: "https://i.imgur.com/1luzP3T.png",
    group: "Kids",
    urls: [
      "https://lightning-fnf-samsungaus.amagi.tv/playlist.m3u8",
    ],
  },
  {
    name: "HappyKids",
    logo: "https://i.imgur.com/cPrUCFw.png",
    group: "Kids",
    urls: [
      "https://dil9xdvretp0f.cloudfront.net/index.m3u8",
    ],
  },
  {
    name: "ToonGoggles",
    logo: "https://i.imgur.com/JMnxswq.png",
    group: "Kids",
    urls: [
      "https://amg01329-otterainc-toongoggles-samsungau-ad-4c.amagi.tv/playlist/amg01329-otterainc-toongoggles-samsungau/playlist.m3u8",
    ],
  },
  {
    name: "Mr. Bean Animated",
    logo: "https://static.wikia.nocookie.net/logopedia/images/2/25/Mr._Bean_Animated_Series_stacked_logo.png",
    group: "Kids",
    urls: [
      "https://amg00627-amg00627c23-samsung-au-4110.playouts.now.amagi.tv/playlist.m3u8",
    ],
  },
  {
    name: "Nick Jr. (Pluto TV)",
    logo: "https://i.imgur.com/8DAe8wr.png",
    group: "Kids",
    urls: [
      "https://jmp2.uk/plu-5ca6748a37b88b269472dad9.m3u8",
    ],
  },
  {
    name: "Nickelodeon (Pluto TV)",
    logo: "https://i.imgur.com/N7rQyzN.png",
    group: "Kids",
    urls: [
      "https://jmp2.uk/plu-5ca673e0d0bd6c2689c94ce3.m3u8",
    ],
  },
  {
    name: "Baby Shark TV (Rakuten)",
    logo: "https://i.imgur.com/SbBKr8L.png",
    group: "Kids",
    urls: [
      "https://c0c65b821b3542c3a4dca92702f59944.mediatailor.us-east-1.amazonaws.com/v1/master/04fd913bb278d8775298c26fdca9d9841f37601f/RakutenTV-eu_BabySharkTV/playlist.m3u8",
    ],
  },
  {
    name: "Charge! (Action)",
    logo: "https://i.imgur.com/1rxmu2u.png",
    group: "Movies",
    urls: [
      "https://fast-channels.sinclairstoryline.com/CHARGE/index.m3u8",
    ],
  },
  {
    name: "Cinevault 80s",
    logo: "https://i.imgur.com/xaCyyDd.png",
    group: "Movies",
    urls: [
      "https://aegis-cloudfront-1.tubi.video/ea1ab5d1-f554-4f6b-b03f-2611fcd94257/playlist.m3u8",
    ],
  },
  {
    name: "DiscoverFilm",
    logo: "https://i.imgur.com/oMnpsQ5.png",
    group: "Movies",
    urls: [
      "https://discoverfilm-discoverfilm-1-gb.samsung.wurl.tv/playlist.m3u8",
    ],
  },
  {
    name: "80s Rewind (Pluto TV)",
    logo: "https://i.imgur.com/nkEeYfI.png",
    group: "Movies",
    urls: [
      "https://jmp2.uk/plu-5ca525b650be2571e3943c63.m3u8",
    ],
  },
  {
    name: "90s Throwback (Pluto TV)",
    logo: "https://i.imgur.com/KoGko6M.png",
    group: "Movies",
    urls: [
      "https://jmp2.uk/plu-5f4d86f519358a00072b978e.m3u8",
    ],
  },
  {
    name: "BET Cinema (Pluto TV)",
    logo: "https://i.imgur.com/FKBp987.png",
    group: "Movies",
    urls: [
      "https://jmp2.uk/plu-58af4c093a41ca9d4ecabe96.m3u8",
    ],
  },
  {
    name: "Classic Movies Channel (Pluto TV)",
    logo: "https://i.imgur.com/pQJxov2.png",
    group: "Movies",
    urls: [
      "https://jmp2.uk/plu-561c5b0dada51f8004c4d855.m3u8",
    ],
  },
  {
    name: "FilmRise Westerns",
    logo: "https://i.imgur.com/8j2npVc.png",
    group: "Movies",
    urls: [
      "https://dz05z8iljgvbe.cloudfront.net/master.m3u8",
    ],
  },
  {
    name: "Flicks of Fury (Pluto TV)",
    logo: "https://i.imgur.com/rtL5L81.png",
    group: "Movies",
    urls: [
      "https://jmp2.uk/plu-58e55b14ad8e9c364d55f717.m3u8",
    ],
  },
  {
    name: "50 Cent Action (Pluto TV)",
    logo: "https://provider-static.plex.tv/epg/cms/production/bcfb9977-809f-49ae-acc7-430f2c6ffb26/50CentAction_Logo_1500x1000_DarkBG_-_Chris_Connors.png",
    group: "Movies",
    urls: [
      "https://jmp2.uk/plu-68487fb3f212bedacf5a53e3.m3u8",
    ],
  },
];
