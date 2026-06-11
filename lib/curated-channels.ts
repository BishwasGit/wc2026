export type CuratedChannel = {
  name: string;
  logo: string;
  group: string;
  urls: string[];
};

export const CURATED_CHANNELS: CuratedChannel[] = [
  {
    name: "ORF 1 (Austria)",
    logo: "https://iptv-org.github.io/iptv/logos/orf1.png",
    group: "Free TV",
    urls: [
      "https://orf1.mdn.ors.at/out/u/orf1/q6a/manifest_6.m3u8",
    ],
  },
  {
    name: "ORF Sport+ (Austria)",
    logo: "https://iptv-org.github.io/iptv/logos/orfsportplus.png",
    group: "Free TV",
    urls: [
      "https://orfs.mdn.ors.at/out/u/orfs/q6a/manifest_6.m3u8",
    ],
  },
  {
    name: "Das Erste (ARD)",
    logo: "https://iptv-org.github.io/iptv/logos/daserste.png",
    group: "Free TV",
    urls: [
      "https://mcdn.daserste.de/daserste/de/master.m3u8",
    ],
  },
  {
    name: "ZDF",
    logo: "https://iptv-org.github.io/iptv/logos/zdf.png",
    group: "Free TV",
    urls: [
      "http://zdf-hls-15.akamaized.net/hls/live/2016498/de/high/master.m3u8",
    ],
  },
  {
    name: "La 1 (RTVE)",
    logo: "https://iptv-org.github.io/iptv/logos/la1.png",
    group: "Free TV",
    urls: [
      "http://rtvev4-live.hss.adaptive.level3.net/egress/ahandler/rtvegl7/la1_lv3_aosv4_gl7/la1_lv3_aosv4_gl7.isml/la1_lv3_aosv4_gl7-audio=128000-video=1500000.m3u8",
    ],
  },
  {
    name: "Teledeporte (RTVE)",
    logo: "https://iptv-org.github.io/iptv/logos/teledeporte.png",
    group: "Free TV",
    urls: [
      "http://hlsliveamdgl1-lh.akamaihd.net/i/hlsdvrlive_1@39732/master.m3u8",
    ],
  },
  {
    name: "NRK1 (Norway)",
    logo: "https://iptv-org.github.io/iptv/logos/nrk1.png",
    group: "Free TV",
    urls: [
      "https://nrk-live-no.akamaized.net/nrk1_dk6/sc-gaFEEA/m534_index.m3u8",
    ],
  },
  {
    name: "SVT1 (Sweden)",
    logo: "https://iptv-org.github.io/iptv/logos/svt1.png",
    group: "Free TV",
    urls: [
      "https://svt1-d.akamaized.net/se/svt1/master-fmp4.m3u8",
    ],
  },
  {
    name: "SVT2 (Sweden)",
    logo: "https://iptv-org.github.io/iptv/logos/svt2.png",
    group: "Free TV",
    urls: [
      "https://svt2-d.akamaized.net/se/svt2/master-fmp4.m3u8",
    ],
  },
  {
    name: "BBC One (UK)",
    logo: "https://iptv-org.github.io/iptv/logos/bbcone.png",
    group: "Free TV",
    urls: [
      "https://vs-hls-push-uk-live.akamaized.net/x=4/i=urn:bbc:pips:service:bbc_one_hd/t=3840/v=pv14/b=5070016/main.m3u8",
    ],
  },
  {
    name: "BBC Two (UK)",
    logo: "https://iptv-org.github.io/iptv/logos/bbctwo.png",
    group: "Free TV",
    urls: [
      "https://vs-hls-push-uk-live.akamaized.net/x=4/i=urn:bbc:pips:service:bbc_two_hd/t=3840/v=pv14/b=5070016/main.m3u8",
    ],
  },
  {
    name: "SRF 1 (Switzerland)",
    logo: "https://iptv-org.github.io/iptv/logos/srf1.png",
    group: "Free TV",
    urls: [
      "https://srfs.akamaized.net/hls/live/689649/srfsgeo/index.m3u8",
    ],
  },
];
