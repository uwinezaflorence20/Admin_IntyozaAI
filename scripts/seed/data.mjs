// Starter content for the Intyoza backend. Review the health content and the Kinyarwanda wording
// with the content team before running the seed with --apply: it goes live in the app immediately.

export const categories = [
  { slug: "puberty-body-changes", nameEn: "Puberty & body changes", nameRw: "Imihindagurikire y'umubiri" },
  { slug: "periods", nameEn: "Periods", nameRw: "Imihango" },
  { slug: "contraception", nameEn: "Contraception", nameRw: "Kuboneza urubyaro" },
  { slug: "hiv-stis", nameEn: "HIV & STIs", nameRw: "Virusi itera SIDA n'indwara zandurira mu mibonano mpuzabitsina" },
  { slug: "consent-relationships", nameEn: "Consent & relationships", nameRw: "Ubwumvikane n'imibanire" },
  { slug: "mental-health", nameEn: "Mental health", nameRw: "Ubuzima bwo mu mutwe" },
  { slug: "pregnancy", nameEn: "Pregnancy", nameRw: "Gutwita" },
  { slug: "gbv-safety", nameEn: "Gender-based violence & safety", nameRw: "Ihohoterwa rishingiye ku gitsina" },
  { slug: "hygiene-self-care", nameEn: "Hygiene & self-care", nameRw: "Isuku y'umubiri" },
  { slug: "alcohol-drugs", nameEn: "Alcohol & drugs", nameRw: "Inzoga n'ibiyobyabwenge" },
  { slug: "safe-abortion-care", nameEn: "Abortion & post-abortion care", nameRw: "Gukuramo inda" },
];

/** Shared defaults: short English articles that load on slow connections. */
const article = (category, title, paragraphs, format = "ARTICLE") => ({
  category,
  language: "EN",
  format,
  isLowData: true,
  title,
  content: paragraphs.join("\n\n"),
});

/** `category` is a slug from the list above; the seed swaps it for the category id. */
export const articles = [
  // Puberty & body changes
  article("puberty-body-changes", "What happens during puberty?", [
    "Puberty is when your body starts changing from a child's body to an adult's. It usually starts between ages 8 and 13 for girls and 9 and 14 for boys, but everyone is different.",
    "Common changes include growing taller, hair growing under the arms and around the genitals, skin getting oilier, and new feelings and emotions. Girls develop breasts and start having periods. Boys' voices deepen and they may have wet dreams.",
    "All of this is normal. If you are worried about a change, or nothing has started by age 14 or 15, talk to a health worker.",
  ]),
  article("puberty-body-changes", "Feelings and emotions during puberty", [
    "Hormones during puberty affect your mood as well as your body. You may feel happy one moment and upset the next, or feel more self-conscious about how you look.",
    "You might also start to feel attracted to other people. These feelings are a normal part of growing up, and you do not have to act on them.",
    "Talking to a parent, teacher, friend or health worker you trust can help when things feel confusing.",
  ]),

  // Periods
  article("periods", "Your period: the basics", [
    "A period is when blood and tissue from the lining of the uterus leave the body through the vagina. It usually lasts 2 to 7 days and comes about every 21 to 35 days.",
    "In the first years, periods are often irregular. That is normal. Use pads, cloth pads, tampons or a menstrual cup, and change them regularly to stay clean and comfortable.",
    "See a health worker if bleeding is very heavy (soaking a pad every hour), if pain stops you doing daily activities, or if your period stops for more than three months and you are not pregnant.",
  ]),
  article("periods", "Managing period pain", [
    "Cramps in the lower belly are common in the first days of a period. They happen when the uterus tightens to release its lining.",
    "Things that can help: a warm cloth or bottle on your belly, gentle exercise, drinking water, rest, and pain relief such as paracetamol or ibuprofen taken as the packet says.",
    "Pain so strong that you miss school, or that does not get better with pain relief, is worth checking with a health worker.",
  ]),

  // Contraception
  article("contraception", "Contraception options for young people", [
    "Contraception prevents pregnancy. Options include condoms, the pill, injections, implants and the IUD. Emergency contraception can be used after unprotected sex, and works best the sooner it is taken (within 3 to 5 days, depending on the type).",
    "Condoms are the only method that also protects against HIV and other STIs. Many people use a condom together with another method.",
    "Health centres offer family planning counselling and can help you choose a method that suits you.",
  ]),
  article("contraception", "How to use a condom correctly", [
    "Check the expiry date and that the packet is not damaged. Open it carefully with your fingers, not your teeth.",
    "Pinch the tip to leave space, then roll the condom all the way down the erect penis before any contact. Use a new condom every time, and never use two at once.",
    "After sex, hold the base while withdrawing, then tie it and throw it in the bin. If a condom breaks, emergency contraception and PEP are available at health facilities.",
  ]),

  // HIV & STIs
  article("hiv-stis", "HIV testing: what to expect", [
    "The only way to know your HIV status is to get tested. Testing is quick, confidential and available at health centres.",
    "If the result is negative, a health worker can talk with you about staying negative, including condoms and PrEP. If the result is positive, treatment (ART) is available. People on effective treatment can live long, healthy lives, and when the virus is undetectable it is not passed on through sex.",
    "If you think you were exposed in the last 72 hours, go to a health facility straight away and ask about PEP.",
  ]),
  article("hiv-stis", "Common STIs and their signs", [
    "Sexually transmitted infections (STIs) such as chlamydia, gonorrhoea, syphilis and herpes are passed on through sexual contact.",
    "Signs can include unusual discharge, pain when urinating, sores or itching around the genitals. Many STIs have no signs at all, so testing is the only way to know.",
    "Most STIs can be cured, and all can be treated. Using condoms lowers the risk. If you have signs or had unprotected sex, visit a health centre.",
  ]),

  // Consent & relationships
  article("consent-relationships", "Understanding consent", [
    "Consent means freely agreeing to something. For any sexual activity, everyone involved must agree, every time.",
    "Consent can be withdrawn at any moment. Someone who is asleep, drunk, pressured or threatened cannot give consent. Silence is not a yes.",
    "If someone has hurt you or forced you, it is not your fault. Isange One Stop Centres offer free medical, psychological and legal support to survivors of sexual and gender-based violence.",
  ]),
  article("consent-relationships", "Signs of a healthy relationship", [
    "In a healthy relationship, both people respect each other, are honest, and can say no without fear.",
    "Warning signs include jealousy that controls who you see, checking your phone, pressure to have sex, threats, or making you feel afraid.",
    "You deserve to feel safe. If a relationship worries you, talk to someone you trust or a health worker.",
  ]),

  // Mental health
  article("mental-health", "Looking after your mental health", [
    "Everyone has difficult days. Feeling sad, stressed or anxious sometimes is normal, but if these feelings last for weeks or stop you from doing daily activities, it is worth asking for help.",
    "Things that can help: talking to someone you trust, sleeping and eating regularly, moving your body, and taking breaks from social media.",
    "If you ever think about hurting yourself, talk to someone right away: a trusted adult, a health worker, or go to the nearest health facility.",
  ]),
  article("mental-health", "Coping with exam stress", [
    "Some stress before exams is normal and can even help you focus. Too much can make it hard to sleep, eat or study.",
    "Break revision into short sessions with breaks, keep a regular sleep time, eat and drink water, and move your body each day.",
    "Remember that one exam does not define you. If stress feels too much, talk to a teacher, family member or health worker.",
  ]),

  // Pregnancy
  article("pregnancy", "Early signs of pregnancy", [
    "Common early signs include a missed period, feeling sick, sore breasts, feeling very tired and needing to urinate more often.",
    "A pregnancy test can confirm it. Tests are available at health centres and pharmacies, and are most accurate from the day your period was due.",
    "If you might be pregnant, visit a health centre. Health workers can talk through your options confidentially.",
  ]),
  article("pregnancy", "Why antenatal care matters", [
    "Antenatal care means health check-ups during pregnancy. The WHO recommends at least eight contacts with a health worker during a pregnancy, starting in the first 12 weeks.",
    "Check-ups track the baby's growth, test for conditions like anaemia, HIV and high blood pressure, and give vitamins and vaccines that protect mother and baby.",
    "Go to a health facility straight away if you have bleeding, a bad headache, blurred vision, fever or the baby stops moving.",
  ]),

  // Gender-based violence & safety
  article("gbv-safety", "What is gender-based violence?", [
    "Gender-based violence (GBV) is harm done to someone because of their gender. It can be physical, sexual, emotional or economic, and it can happen at home, at school, online or in a relationship.",
    "It is never the survivor's fault. No one has the right to hurt you, touch you without consent, or control you with threats or money.",
    "Isange One Stop Centres, found at district hospitals, offer free medical care, counselling, and help with reporting to the police.",
  ]),
  article("gbv-safety", "What to do after sexual violence", [
    "Go to a health facility or Isange One Stop Centre as soon as possible, ideally within 72 hours.",
    "Early care can prevent HIV (with PEP) and pregnancy (with emergency contraception), treat injuries and collect evidence if you decide to report. Try not to wash or change clothes first if you can.",
    "You can get medical care even if you are not ready to report. Talking to someone you trust can also help.",
  ]),

  // Hygiene & self-care
  article("hygiene-self-care", "Daily hygiene during puberty", [
    "During puberty you sweat more and your skin gets oilier. Washing every day with soap and water, and wearing clean underwear, helps prevent body odour and infections.",
    "Wash the genital area with plain water or mild soap only, from front to back. Douching or using strong products inside the vagina can cause infections.",
    "Washing your face twice a day helps with spots. Avoid squeezing them, which can cause scars.",
  ]),
  article("hygiene-self-care", "Making and caring for reusable pads", [
    "Reusable cloth pads are a cheap, eco-friendly option. Choose soft cotton cloth that absorbs well.",
    "After use, rinse in cold water, then wash with soap and dry fully in the sun, which helps kill germs. Store them in a clean, dry place.",
    "Replace pads that are worn out or stay stained, and change pads every 4 to 6 hours, or more often if your flow is heavy.",
  ]),

  // Alcohol & drugs
  article("alcohol-drugs", "Alcohol and your health", [
    "Alcohol affects the brain, which keeps developing until your mid-20s. Drinking young increases the risk of problems with memory, learning and addiction later.",
    "Alcohol also makes it harder to make safe choices, including about sex and consent, and raises the risk of accidents and violence.",
    "It is okay to say no. If you are worried about your own or someone else's drinking, talk to a health worker.",
  ]),
  article("alcohol-drugs", "Saying no to peer pressure", [
    "Peer pressure is when friends push you to do something you don't want to do, like drinking, smoking or taking drugs.",
    "Ways to say no: be clear and calm (\"No thanks\"), give a reason if you want to, suggest something else to do, or walk away. Real friends will respect your choice.",
    "Spending time with people who share your values makes it easier to stay true to yourself.",
  ]),

  // Abortion & post-abortion care (Rwanda). Check against the source shared on Slack before relying on it.
  article("safe-abortion-care", "Abortion and the law in Rwanda", [
    "In Rwanda, abortion is legal in specific situations set out in the penal code (Law No. 68/2018). A doctor may end a pregnancy when:",
    "• the pregnant person is a child;\n• the pregnancy is the result of rape;\n• the pregnancy is the result of forced marriage;\n• the pregnancy is the result of incest with a close relative (up to the second degree);\n• continuing the pregnancy seriously endangers the health of the pregnant woman or of the baby.",
    "No court decision is needed. The abortion must be done by a doctor in a health facility, following rules set by the Ministry of Health. Outside these situations, abortion is a crime in Rwanda.",
    "If one of these situations applies to you, go to a health centre or district hospital as early as you can. If you were raped, an Isange One Stop Centre can also help with medical care, counselling and reporting.",
  ]),
  article("safe-abortion-care", "Unsafe abortion and post-abortion care", [
    "Abortions done by untrained people, or with herbs, pills from unknown sources or objects, can cause heavy bleeding, infection, infertility and death.",
    "Go to a health facility straight away if, after an abortion or a miscarriage, you have heavy bleeding (soaking more than two pads an hour for two hours), fever, strong pain in the belly, or bad-smelling discharge from the vagina.",
    "Health facilities provide post-abortion care, including after a miscarriage. Getting care quickly can save your life. Health workers can also talk with you about contraception to prevent another unplanned pregnancy.",
  ]),
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
