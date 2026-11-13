// Starter content for the Intyoza backend. Review the health content and the Kinyarwanda wording
// with the content team before running the seed with --apply: it goes live in the app immediately.

export const categories = [
  { slug: "puberty-body-changes", nameEn: "Puberty & body changes", nameRw: "Imihindagurikire y'umubiri" },
  { slug: "periods", nameEn: "Periods", nameRw: "Imihango" },
  { slug: "contraception", nameEn: "Contraception", nameRw: "Kuboneza urubyaro" },
  { slug: "hiv-stis", nameEn: "HIV & STIs", nameRw: "Virusi itera SIDA n'indwara zandurira mu mibonano mpuzabitsina" },
  { slug: "consent-relationships", nameEn: "Consent & relationships", nameRw: "Ubwumvikane n'imibanire" },
  { slug: "mental-health", nameEn: "Mental health", nameRw: "Ubuzima bwo mu mutwe" },
];

/** `category` is a slug from the list above; the seed swaps it for the category id. */
export const articles = [
  {
    category: "puberty-body-changes",
    language: "EN",
    format: "ARTICLE",
    isLowData: true,
    title: "What happens during puberty?",
    content:
      "Puberty is when your body starts changing from a child's body to an adult's. It usually starts between ages 8 and 13 for girls and 9 and 14 for boys, but everyone is different.\n\n" +
      "Common changes include growing taller, hair growing under the arms and around the genitals, skin getting oilier, and new feelings and emotions. Girls develop breasts and start having periods. Boys' voices deepen and they may have wet dreams.\n\n" +
      "All of this is normal. If you are worried about a change, or nothing has started by age 14 or 15, talk to a health worker.",
  },
  {
    category: "periods",
    language: "EN",
    format: "ARTICLE",
    isLowData: true,
    title: "Your period: the basics",
    content:
      "A period is when blood and tissue from the lining of the uterus leave the body through the vagina. It usually lasts 2 to 7 days and comes about every 21 to 35 days.\n\n" +
      "In the first years, periods are often irregular. That is normal. Use pads, cloth pads, tampons or a menstrual cup, and change them regularly to stay clean and comfortable.\n\n" +
      "See a health worker if bleeding is very heavy (soaking a pad every hour), if pain stops you doing daily activities, or if your period stops for more than three months and you are not pregnant.",
  },
  {
    category: "contraception",
    language: "EN",
    format: "ARTICLE",
    isLowData: true,
    title: "Contraception options for young people",
    content:
      "Contraception prevents pregnancy. Options include condoms, the pill, injections, implants and the IUD. Emergency contraception can be used after unprotected sex, and works best the sooner it is taken (within 3 to 5 days, depending on the type).\n\n" +
      "Condoms are the only method that also protects against HIV and other STIs. Many people use a condom together with another method.\n\n" +
      "Health centres offer family planning counselling and can help you choose a method that suits you.",
  },
  {
    category: "hiv-stis",
    language: "EN",
    format: "ARTICLE",
    isLowData: true,
    title: "HIV testing: what to expect",
    content:
      "The only way to know your HIV status is to get tested. Testing is quick, confidential and available at health centres.\n\n" +
      "If the result is negative, a health worker can talk with you about staying negative, including condoms and PrEP. If the result is positive, treatment (ART) is available. People on effective treatment can live long, healthy lives, and when the virus is undetectable it is not passed on through sex.\n\n" +
      "If you think you were exposed in the last 72 hours, go to a health facility straight away and ask about PEP.",
  },
  {
    category: "consent-relationships",
    language: "EN",
    format: "ARTICLE",
    isLowData: true,
    title: "Understanding consent",
    content:
      "Consent means freely agreeing to something. For any sexual activity, everyone involved must agree, every time.\n\n" +
      "Consent can be withdrawn at any moment. Someone who is asleep, drunk, pressured or threatened cannot give consent. Silence is not a yes.\n\n" +
      "If someone has hurt you or forced you, it is not your fault. Isange One Stop Centres offer free medical, psychological and legal support to survivors of sexual and gender-based violence.",
  },
  {
    category: "mental-health",
    language: "EN",
    format: "ARTICLE",
    isLowData: true,
    title: "Looking after your mental health",
    content:
      "Everyone has difficult days. Feeling sad, stressed or anxious sometimes is normal, but if these feelings last for weeks or stop you from doing daily activities, it is worth asking for help.\n\n" +
      "Things that can help: talking to someone you trust, sleeping and eating regularly, moving your body, and taking breaks from social media.\n\n" +
      "If you ever think about hurting yourself, talk to someone right away: a trusted adult, a health worker, or go to the nearest health facility.",
  },
];

export const myths = [
  {
    language: "EN",
    mythText: "You can't get pregnant the first time you have sex.",
    factText: "Pregnancy can happen any time sperm meets an egg, including the first time. Contraception works from the first time too.",
    sources: ["WHO — Family planning/contraception methods"],
  },
  {
    language: "EN",
    mythText: "You can tell if someone has HIV by looking at them.",
    factText: "Most people living with HIV look and feel healthy. The only way to know someone's status is an HIV test.",
    sources: ["WHO — HIV and AIDS fact sheet"],
  },
  {
    language: "EN",
    mythText: "Contraceptives make you infertile.",
    factText: "Modern contraceptives do not cause infertility. Fertility returns after stopping; after the injection it can take a few months longer.",
    sources: ["WHO — Family planning/contraception methods"],
  },
  {
    language: "EN",
    mythText: "Girls should not bathe or exercise during their period.",
    factText: "Bathing keeps you clean and comfortable, and exercise can even ease cramps. Both are safe during a period.",
    sources: ["UNICEF — Guidance on menstrual health and hygiene"],
  },
  {
    language: "EN",
    mythText: "Using two condoms at once gives double protection.",
    factText: "Two condoms rub against each other and are more likely to tear. Use one condom correctly, every time.",
    sources: ["CDC — Condom fact sheet"],
  },
  {
    language: "EN",
    mythText: "Asking for help with mental health means you are weak.",
    factText: "Asking for help is a sign of strength. Mental health conditions are common and treatable.",
    sources: ["WHO — Adolescent mental health fact sheet"],
  },
];

/** `welcome` is posted in the space as the signed-in admin. */
export const spaces = [
  {
    name: "Ask Anything",
    description: "A safe place to ask questions about your body, health and relationships. No question is silly.",
    welcome: "Welcome! Ask your questions here. Please don't share your full name, phone number or where you live.",
  },
  {
    name: "Periods Talk",
    description: "Share tips and questions about periods, pads and managing pain.",
    welcome: "Welcome to Periods Talk. Be kind and respectful — everyone's experience is different.",
  },
  {
    name: "Relationships & Consent",
    description: "Talk about friendships, dating, respect and consent.",
    welcome: "Welcome! If you or someone you know is in danger or has been hurt, please reach out to a health facility or Isange One Stop Centre.",
  },
  {
    name: "Mind Matters",
    description: "Support each other with stress, exams, feelings and mental health.",
    welcome: "Welcome to Mind Matters. This is a supportive space — if you are thinking about hurting yourself, please talk to someone you trust or visit a health facility today.",
  },
];
