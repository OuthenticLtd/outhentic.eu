/* Outhentic — album data (paths, titles, durations)
 *
 * EXTERNAL HOSTING (Shopify / OneDrive / CDN)
 * -------------------------------------------
 * The "src" field of each track can be ANY URL the browser can reach.
 *
 * Per-album playback rules:
 *   preview_seconds — pause playback after N seconds and show a "Buy the album"
 *                     prompt. Set to 0 to disable. Default if missing: 30s.
 *   buy_url         — link the buy button points to (must match the Buy
 *                     button in group.html so both go to the same Shopify URL).
 */
window.OUTHENTIC_PREVIEW_DEFAULT = 30;
window.OUTHENTIC_ALBUMS = {
  yestoday:
{"album":"YesToday","year":2016,"cover":"assets/img/albums/yestoday.jpg","preview_seconds":30,"buy_url":"https://zhivkovasilev.com/en-bg/products/yestoday-outhentic","tracks":[
  {"src":"assets/audio/yestoday/01-kaval-sviri.mp3","title":"Kaval Sviri","duration":217.600000},
  {"src":"assets/audio/yestoday/02-more-malka-mome.mp3","title":"More, Malka Mome","duration":188.107750},
  {"src":"assets/audio/yestoday/03-otdole-ide.mp3","title":"Otdole Ide","duration":199.601625},
  {"src":"assets/audio/yestoday/04-maika-kalina-dumashe.mp3","title":"Maika, Kalina Dumashe","duration":241.005700},
  {"src":"assets/audio/yestoday/05-ogreyalo-yasno-slantse.mp3","title":"Ogreyalo Yasno Slantse","duration":307.095500},
  {"src":"assets/audio/yestoday/06-zaspal-yunak.mp3","title":"Zaspal Yunak","duration":223.111825},
  {"src":"assets/audio/yestoday/07-tornala-mi-enitsa.mp3","title":"Tornala Mi Enitsa","duration":181.968975},
  {"src":"assets/audio/yestoday/08-slanchitse-milo-mamino.mp3","title":"Slanchitse, Milo Mamino","duration":191.608150},
  {"src":"assets/audio/yestoday/09-male-le-stara-maichinko.mp3","title":"Male Le, Stara Maichinko","duration":283.611425},
  {"src":"assets/audio/yestoday/10-kalina-voda-naliva.mp3","title":"Kalina Voda Naliva","duration":200.803250}]}
,
  transparent:
{"album":"Transparent","year":2019,"cover":"assets/img/albums/transparent.jpg","preview_seconds":30,"buy_url":"https://zhivkovasilev.com/en-bg/products/transparent-outhentic","tracks":[
  {"src":"assets/audio/transparent/01-ayda-ayda.mp3","title":"Ayda, Ayda","duration":177.684898},
  {"src":"assets/audio/transparent/02-transparent.mp3","title":"Transparent","duration":49.214694},
  {"src":"assets/audio/transparent/03-yaz-ti-postilam.mp3","title":"Yaz Ti Postilam","duration":201.351837},
  {"src":"assets/audio/transparent/04-zalibih-si-edno-libe.mp3","title":"Zalibih Si Edno Libe","duration":141.531429},
  {"src":"assets/audio/transparent/05-razoral-dedo.mp3","title":"Razoral Dedo","duration":326.034286},
  {"src":"assets/audio/transparent/06-chereshko-chorna.mp3","title":"Chereshko Chorna","duration":232.594286},
  {"src":"assets/audio/transparent/07-yunache-ludo.mp3","title":"Yunache Ludo","duration":220.551837},
  {"src":"assets/audio/transparent/08-doydi-doydi-libe-le.mp3","title":"Doydi, Doydi, Libe Le","duration":283.036735},
  {"src":"assets/audio/transparent/09-stiga-mi-sa.mp3","title":"Stiga Mi Sa, Momne Le","duration":292.545306},
  {"src":"assets/audio/transparent/10-rachenitsa.mp3","title":"Rachenitsa","duration":157.701224},
  {"src":"assets/audio/transparent/11-rano-e-moma.mp3","title":"Rano E Moma","duration":218.044082}]}

};
