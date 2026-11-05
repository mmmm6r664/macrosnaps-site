// MacroSnaps' own photos, served from the existing Wix media CDN.
// (Wix stock-library images on the old site are intentionally not reused: their license only covers Wix-hosted sites.)
import extracted from "@/data/service-images.json";

const W = "https://static.wixstatic.com/media/";
const ids = (prefix: string, list: string[], ext = "jpg") => list.map((id) => `${W}${prefix}_${id}~mv2.${ext}`);

const conference = ids("b8cb3c", [
  "db2ff2c7b5e2410797ed918d4be151e0", "52aee39798cf47248c5c212d61721cc4", "e4d65fdd0c2b4cfc864f729938a364b0",
  "607cce41a2664e118f3d3806e7c22e9e", "b30142628953446a808cf0e89e72085b", "8007487d82544b43aaceb30105126302",
  "2cde442cebc8419db3f25be06e49eec6", "1641d198a0ff4d5cbb91a47526df7b5b", "c8134a6c91fe4f81a08c83968146bd12",
  "28ce1118c7924b25a3da9b807d62f816", "6f261b1c387c451bba1872bd512c5da0", "52215a1a9b654de38a91f9bc44201c53",
  "843c056b76b041ff8017f5db4175300d", "2ae89224784c40efb0c41fb61776a3fe", "c91de18f485b447c8e60783de12b5754",
]);

const wedding = ids("b8cb3c", [
  "d36214864f43475690497b42308e9519", "586c8b988c444df18ee28bcf392c13c3", "ba473ea95c3649128abf5d1a5cb5aeaf",
  "c68c75d3746247a1b502c0f1fc7cf3c2", "52e5fa457d3f467ea76a9198ef7ffd57", "79cdec7617134e1f82b18ad6cf254476",
  "b9dd489b0afe4f149a40fda428a72bd0", "c21c80597b7c45f3ad786f1cab2cccc4", "c1cc59026163440f8ef23149f93f7f0f",
  "20a24bd01d7b4c469fd5008e8bbbfa00", "9eaeaa54ef2744c5b3668d805799f424",
]).concat(ids("1f3625", ["d2741b395b5d446da5d8ca57e5f286b2", "86e3b417178c42e5bd0985affc27b819", "3c0101d69c7c4665b8c972572c411094"]));

const portfolio = ids("1f3625", [
  "d2741b395b5d446da5d8ca57e5f286b2", "60dffbb38cbb4504b56957bf494a1fe6", "9bee7d64ee72451aae75c89f5f076926",
  "3c0101d69c7c4665b8c972572c411094", "86e3b417178c42e5bd0985affc27b819", "b7934fbbd1bd4f6e838a117847f6c74d",
  "973a086295154bf5b59bddb71bce14c6", "9e25ecebcaff425787244fe817b50433", "79013331208a4ec8826fcde024545575",
  "c647d5dd7f7b41cb8bb5df3fd4d2993a", "29e9427188304526a3c462332ef9ddc9", "793e7bdd083548108682e39e6c2baabc",
]);

const event = ids("1f3625", ["b0cb8415b81041bd95ddfaa98de0c3c7", "356d4c3ccbd7465082888135322ec671", "9e25ecebcaff425787244fe817b50433", "973a086295154bf5b59bddb71bce14c6"])
  .concat(ids("b8cb3c", ["3d1356bb4a214ef4b29545c745b7ebe4", "24afe99a9a1a47fa897c23644d323f23", "6eeef5c979b24df2b2bf05503f8bf628"]))
  .concat(conference.slice(0, 5));

const personal = ids("1f3625", [
  "356d4c3ccbd7465082888135322ec671", "ea9a4b1ef48f477b906372313e7f89a4", "689b9ae37c8846dd871cc52c4bb8a400",
  "f6ce273979f84ca2930b9e0c2f784c99", "79013331208a4ec8826fcde024545575", "9bee7d64ee72451aae75c89f5f076926",
  "8ab854da9b4843ca9b7502fe69f4e064", "9bd522d565ae46a78b23d80a037595f2",
]);

const engagement = ids("1f3625", ["9bee7d64ee72451aae75c89f5f076926", "79013331208a4ec8826fcde024545575", "c647d5dd7f7b41cb8bb5df3fd4d2993a", "86e3b417178c42e5bd0985affc27b819", "b7934fbbd1bd4f6e838a117847f6c74d"]);

export const IMG = {
  hero: `${W}1f3625_d2741b395b5d446da5d8ca57e5f286b2~mv2.jpg`,
  about: `${W}1f3625_79013331208a4ec8826fcde024545575~mv2.jpg`,
  conferenceHero: `${W}b8cb3c_af143925a50c4d24a9cdd29895d94165~mv2.jpg`,
  conference,
  conferenceVideo: [`${W}b8cb3c_3d1356bb4a214ef4b29545c745b7ebe4~mv2.jpg`, ...conference.slice(3, 12)],
  corporate: [...conference.slice(6), ...conference.slice(0, 6)],
  wedding,
  engagement,
  event,
  personal,
  portfolio,
  commercial: [...conference.slice(9), ...portfolio.slice(5, 9)],
  realEstate: [`${W}1f3625_50bff426d6f74b5887fb0effb9321fe6~mv2.jpg`, ...portfolio.slice(0, 4)],
};

const X = extracted as Record<string, string[]>;
/** Photos for a service: that page's own photos from macrosnaps.com first, then a curated fallback set. */
export const imagesForService = (slug: string, fallback: string[]) => [...new Set([...(X[slug] ?? []), ...fallback])];

export const heroFor = (images: string[]) => images[0] ?? IMG.hero;
