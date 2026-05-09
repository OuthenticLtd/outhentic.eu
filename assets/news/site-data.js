/* Outhentic — site-wide content. Saved via /editor.html on 2026-05-09 11:17:22 UTC. */
window.OUTHENTIC_SITE = {
  "social": {
    "facebook": "https://www.facebook.com/outhentic.band",
    "instagram": "https://www.instagram.com/outhentic.eu",
    "youtube": "https://www.youtube.com/@Outhentic_Music"
  },
  "contact": {
    "email": "info@outhentic.eu",
    "address_en": "Sofia 1592, Bulgaria",
    "address_bg": "София 1592, България"
  },
<<<<<<< HEAD

  /* Main navigation menu — fully editable per page.
     Each top-level key (group/foundation/news) is a different page's menu.
     Section anchors like "#about" only work on the page they belong to.
     Each item: { href, label_en, label_bg }. Order here is what shows in nav. */
  nav: {
    group: [
      { href: "#about",          label_en: "About",                label_bg: "За нас" },
      { href: "#music",          label_en: "Music",                label_bg: "Музика" },
      { href: "#members",        label_en: "Members",              label_bg: "Състав" },
      { href: "#live",           label_en: "Live",                 label_bg: "Галерия" },
      { href: "foundation.html", label_en: "Outhentic Foundation", label_bg: "Фондация Аутентик" },
      { href: "news.html",       label_en: "News",                 label_bg: "Новини" },
      { href: "#contact",        label_en: "Contact",              label_bg: "Контакти" }
    ],
    foundation: [
      { href: "group.html",      label_en: "Outhentic Group",      label_bg: "Група Аутентик" },
      { href: "#mission",        label_en: "About",                label_bg: "За нас" },
      { href: "#ethno",          label_en: "ETHNO Bulgaria",       label_bg: "ЕТНО България" },
      { href: "#projects",       label_en: "World Fest 2019",      label_bg: "World Fest 2019" },
      { href: "news.html",       label_en: "News",                 label_bg: "Новини" },
      { href: "#support",        label_en: "Support us",           label_bg: "Подкрепи ни" }
    ],
    news: [
      { href: "group.html",      label_en: "Outhentic Group",      label_bg: "Група Аутентик" },
      { href: "foundation.html", label_en: "Outhentic Foundation", label_bg: "Фондация Аутентик" },
      { href: "news.html",       label_en: "News",                 label_bg: "Новини" }
    ]
  },

  /* Hero sections — top banner of group.html and foundation.html.
     Image path is relative to site root (no leading slash).
     Title supports inline HTML like <br> and &nbsp;.
     Foundation has an eyebrow + meta strip; the group hero usually doesn't. */
  hero: {
    group: {
      image: "assets/img/hero-band.jpg",
      image_alt_en: "Outhentic band photo",
      image_alt_bg: "Outhentic",
      eyebrow_en: "",
      eyebrow_bg: "",
      title_en: "Out of the&nbsp;authentic.",
      title_bg: "Извън&nbsp;автентичното.",
      lead_en:   "Outhentic is a Bulgarian ensemble blending Balkan folk traditions, jazz and contemporary improvised music. From the kaval to the tamboura, from village songs to Glastonbury — we step out of the authentic, and bring it back transformed.",
      lead_bg:   "Outhentic е българска формация, в която се преплитат балканските фолклорни традиции, джазът и съвременната импровизирана музика. От кавала до тамбурата, от родопските песни до Гластънбъри — излизаме извън автентичното и го връщаме преобразено.",
      button_en: "Listen to the music",
      button_bg: "Слушай музиката",
      button_href: "#music",
      mobile_focus: "100% center",
      meta_en: [],
      meta_bg: []
    },
    foundation: {
      image: "assets/img/foundation/hero-ethno.jpg",
      image_alt_en: "ETHNO Bulgaria 2023",
      image_alt_bg: "ЕТНО България 2023",
      eyebrow_en: "Outhentic Foundation · Est. 2018",
      eyebrow_bg: "Фондация Аутентик · от 2018 г.",
      title_en: "Inspiring young musicians.<br>Celebrating the music of the world.",
      title_bg: "Вдъхновяваме младите музиканти.<br>Празнуваме музиката на света.",
      lead_en:   "An independent non-governmental organisation incorporated for public benefit. We bring Bulgarian folklore and world music to a new generation — through festivals, concerts, education and exchange across Bulgaria and abroad.",
      lead_bg:   "Независима неправителствена организация, учредена в обществена полза. Представяме българския фолклор и световната музика пред новото поколение — чрез фестивали, концерти, образование и обмен в България и в чужбина.",
      button_en: "Support our work",
      button_bg: "Подкрепи дейността ни",
      button_href: "#support",
      mobile_focus: "center center",
      meta_en: ["JMI Associate Member", "ETHNO Bulgaria · National rep.", "Sofia 1592 · Bulgaria"],
      meta_bg: ["Член на JMI", "ЕТНО България · нац. представител", "София 1592 · България"]
    }
  },

  /* Group members (band) */
  groupMembers: [
=======
  "nav": [
>>>>>>> 69cf73ad062b280123c0ca3095cef6fcca38a75c
    {
      "id": "group",
      "href": "group.html",
      "label_en": "Outhentic Group",
      "label_bg": "Група Аутентик"
    },
    {
      "id": "foundation",
      "href": "foundation.html",
      "label_en": "Outhentic Foundation",
      "label_bg": "Фондация Аутентик"
    },
    {
      "id": "news",
      "href": "news.html",
      "label_en": "News",
      "label_bg": "Новини"
    }
  ],
  "hero": {
    "group": {
      "image": "assets/img/hero-band.jpg",
      "image_alt_en": "Outhentic band photo",
      "image_alt_bg": "Outhentic",
      "eyebrow_en": "",
      "eyebrow_bg": "",
      "title_en": "Out of the&nbsp;authentic.",
      "title_bg": "Извън&nbsp;автентичното.",
      "lead_en": "Outhentic is a Bulgarian ensemble blending Balkan folk traditions, jazz and contemporary improvised music. From the kaval to the tamboura, from village songs to Glastonbury — we step out of the authentic, and bring it back transformed.",
      "lead_bg": "Outhentic е българска формация, в която се преплитат балканските фолклорни традиции, джазът и съвременната импровизирана музика. От кавала до тамбурата, от родопските песни до Гластънбъри — излизаме извън автентичното и го връщаме преобразено.",
      "button_en": "Listen to the music",
      "button_bg": "Слушай музиката",
      "button_href": "#music",
      "mobile_focus": "100% center",
      "meta_en": [],
      "meta_bg": []
    },
    "foundation": {
      "image": "assets/img/foundation/hero-ethno.jpg",
      "image_alt_en": "ETHNO Bulgaria 2023",
      "image_alt_bg": "ЕТНО България 2023",
      "eyebrow_en": "Outhentic Foundation · Est. 2018",
      "eyebrow_bg": "Фондация Аутентик · от 2018 г.",
      "title_en": "<br>Celebrating the music of the world.",
      "title_bg": "Празнуваме музиката на света.",
      "lead_en": "An independent non-governmental organisation incorporated for public benefit. We bring Bulgarian folklore and world music to a new generation — through festivals, concerts, education and exchange across Bulgaria and abroad.",
      "lead_bg": "Независима неправителствена организация, учредена в обществена полза. Представяме българския фолклор и световната музика пред новото поколение — чрез фестивали, концерти, образование и обмен в България и в чужбина.",
      "button_en": "Support our work",
      "button_bg": "Подкрепи дейността ни",
      "button_href": "#support",
      "mobile_focus": "center center",
      "meta_en": [
        "JMI Associate Member",
        "ETHNO Bulgaria · National rep.",
        "Sofia 1592 · Bulgaria"
      ],
      "meta_bg": [
        "Член на JMI",
        "ЕТНО България · нац. представител",
        "София 1592 · България"
      ]
    }
  },
  "groupMembers": [
    {
      "photo": "assets/img/band/zhivko.jpg",
      "name_en": "Zhivko Vasilev",
      "name_bg": "Живко Василев",
      "role_en": "Kaval · Piano",
      "role_bg": "Кавал · Пиано",
      "bio_en": "Zhivko is amongst the most popular kaval players in Bulgaria. He is well-known to the public both in Bulgaria and Europe with his constant experiments and his search for new and unexplored paths in music.",
      "bio_bg": "Живко е сред най-популярните кавалджии в България. Той е добре познат на публиката както в България, така и в Европа с постоянните си експерименти и търсенето на нови и неизследвани пътища в музиката."
    },
    {
      "photo": "assets/img/band/rayna.jpg",
      "name_en": "Rayna Vasileva",
      "name_bg": "Райна Василева",
      "role_en": "Vocal",
      "role_bg": "Вокал",
      "bio_en": "Rayna is a Bulgarian vocal folklore / pop / jazz performer and educator. She possesses a specific and recognisable voice. She was born in Smolyan, a city situated in the heart of the Rhodope Mountains, Bulgaria.",
      "bio_bg": "Райна е български вокален фолклорен / поп / джаз изпълнител и педагог. Притежава специфичен и разпознаваем глас. Родена е в Смолян, град, разположен в сърцето на Родопите, България."
    },
    {
      "photo": "assets/img/band/borislav.jpg",
      "name_en": "Borislav Iliev",
      "name_bg": "Борислав Илиев",
      "role_en": "Guitar · Tamboura",
      "role_bg": "Китара · Тамбура",
      "bio_en": "Guitarist, tamboura player and composer, Borislav has been steadily building his name as one of the most compelling performers in Bulgaria. He started playing guitar at the age of seven in his home town, Gorna Oryahovitsa.",
      "bio_bg": "Китарист, тамбурист и композитор. Борислав гради стабилно името си на един от най-завладяващите изпълнители в България. Започва да свири на китара на седемгодишна възраст в родния си град Горна Оряховица."
    },
    {
      "photo": "assets/img/band/stoil.jpg",
      "name_en": "Stoil Ivanov",
      "name_bg": "Стоил Иванов",
      "role_en": "Drums · Percussion",
      "role_bg": "Барабани · Перкусии",
      "bio_en": "Stoil is a drummer, composer and tupan player. He studied percussion instruments and graduated from Dobrin Petkov National School of Music in his home town, Plovdiv. In 2016 he received his Master's degree from the National Academy of Music.",
      "bio_bg": "Стоил е барабанист, композитор и тупанист. Учи ударни инструменти и завършва НУИ „Добрин Петков“ в родния си град Пловдив. През 2016 г. получава магистърска степен от Националната музикална академия."
    }
  ],
  "foundationMembers": [
    {
      "photo": "assets/img/band/zhivko.jpg",
      "name_en": "Zhivko Vasilev",
      "name_bg": "Живко Василев",
      "role_en": "Co-founder",
      "role_bg": "Съосновател",
      "bio_en": "One of the most popular Bulgarian musicians and kaval players in the world. Co-founder of the Outhentic Foundation. Experienced in preparing project proposals and in organising and coordinating cultural events such as World Fest Plovdiv 2019.",
      "bio_bg": "Един от най-популярните български музиканти и кавалджии в света. Съосновател на Фондация Аутентик. Има опит в изготвянето на проектни предложения, както и в организирането и координирането на културни събития като World Fest Plovdiv 2019."
    },
    {
      "photo": "assets/img/band/rayna.jpg",
      "name_en": "Rayna Vasileva",
      "name_bg": "Райна Василева",
      "role_en": "Co-founder",
      "role_bg": "Съосновател",
      "bio_en": "One of the most distinctive Bulgarian singers and co-founder of the Outhentic Foundation. Coordinator and project manager for foundation initiatives — including World Fest Plovdiv 2019 — with extensive experience in cultural project management.",
      "bio_bg": "Една от най-разпознаваемите български певици и съосновател на Фондация Аутентик. Координатор и проектен мениджър за инициативи на фондацията — включително World Fest Plovdiv 2019 — с обширен опит в културния проектен мениджмънт."
    },
    {
      "photo": "",
      "name_en": "Alexandrina Vasileva",
      "name_bg": "Александрина Василева",
      "role_en": "Co-founder · Finance",
      "role_bg": "Съосновател · Финанси",
      "bio_en": "Co-founder of the Outhentic Foundation. Brings solid financial and accounting experience — a business consultant, financial expert and accountant — and has led project proposals and event coordination including World Fest Plovdiv 2019.",
      "bio_bg": "Съосновател на Фондация Аутентик. Носи солиден финансов и счетоводен опит — бизнес консултант, финансов експерт и счетоводител — и е ръководила проектни предложения и координация на събития, включително World Fest Plovdiv 2019."
    }
  ],
  "gallery": [
    {
      "src": "assets/img/gallery/world-fest-plovdiv-2.jpg",
      "alt_en": "Outhentic at World Fest Plovdiv",
      "alt_bg": "Outhentic на World Fest Plovdiv"
    },
    {
      "src": "assets/img/gallery/zhivko-world-fest.jpg",
      "alt_en": "Zhivko Vasilev at World Fest Plovdiv",
      "alt_bg": "Живко Василев на World Fest Plovdiv"
    },
    {
      "src": "assets/img/gallery/borislav-world-fest.jpg",
      "alt_en": "Borislav Iliev at World Fest Plovdiv",
      "alt_bg": "Борислав Илиев на World Fest Plovdiv"
    },
    {
      "src": "assets/img/gallery/varna-jazz-days-2020.jpg",
      "alt_en": "Outhentic at Varna Jazz Days 2020",
      "alt_bg": "Outhentic на Варненски джаз дни 2020"
    },
    {
      "src": "assets/img/gallery/sofia-live-club.jpg",
      "alt_en": "Outhentic at Sofia Live Club",
      "alt_bg": "Outhentic в Sofia Live Club"
    },
    {
      "src": "assets/img/gallery/fusion-fest.jpg",
      "alt_en": "Outhentic at Fusion Fest, Veliko Tarnovo",
      "alt_bg": "Outhentic на Fusion Fest, Велико Търново"
    },
    {
      "src": "assets/img/gallery/in-plovdiv.jpg",
      "alt_en": "Outhentic in Plovdiv",
      "alt_bg": "Outhentic в Пловдив"
    },
    {
      "src": "assets/img/gallery/outhentic-band-2024.jpg",
      "alt_en": "Outhentic band photo",
      "alt_bg": "Outhentic"
    },
    {
      "src": "assets/img/gallery/zhivko-rayna.jpg",
      "alt_en": "Zhivko and Rayna",
      "alt_bg": "Живко и Райна"
    },
    {
      "src": "assets/img/gallery/rayna-zhivko.jpg",
      "alt_en": "Rayna and Zhivko",
      "alt_bg": "Райна и Живко"
    },
    {
      "src": "assets/img/gallery/zhivko-kabana.jpg",
      "alt_en": "Zhivko Vasilev at Kino Kabana",
      "alt_bg": "Живко Василев в Кино Кабана"
    },
    {
      "src": "assets/img/gallery/rayna-vasileva.jpg",
      "alt_en": "Rayna Vasileva of Outhentic",
      "alt_bg": "Райна Василева"
    },
    {
      "src": "assets/img/gallery/rashe-nosiya.jpg",
      "alt_en": "Rayna in traditional Bulgarian costume",
      "alt_bg": "Райна в българска народна носия"
    },
    {
      "src": "assets/img/gallery/outhentic-2024.jpg",
      "alt_en": "Outhentic on stage",
      "alt_bg": "Outhentic"
    }
  ]
};
