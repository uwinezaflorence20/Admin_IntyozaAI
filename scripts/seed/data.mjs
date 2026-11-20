// Learning content for the Intyoza backend, based on:
//   - Urukundo Life Skills Board Game: Information Booklet on Comprehensive Sexuality Education
//   - SRHR Questions (reviewed question bank)
//   - Behavioral Surveillance Survey Among Youth Aged 15-24, Rwanda 2009 (Ministry of Health / TRAC Plus)
// Have the content team review the health content and the Kinyarwanda names before running with --apply:
// it goes live in the app immediately.

import { MORE, MORE_QUESTIONS } from "./more.mjs";

const REF = {
  booklet: "Urukundo Life Skills Board Game: Information Booklet on Comprehensive Sexuality Education",
  quiz: "SRHR Questions (reviewed question bank)",
  bss: "Ministry of Health / TRAC Plus, Behavioral Surveillance Survey Among Youth Aged 15-24, Rwanda 2009 (report, December 2010)",
  penal: "Law No 68/2018 of 30/08/2018 determining offences and penalties in general (Rwanda)",
  rhLaw: "Law No 21/2016 of 20/05/2016 relating to human reproductive health (Rwanda)",
  who: "World Health Organization",
};

export const categories = [
  { slug: "values-decisions", nameEn: "Values & decision-making", nameRw: "Indangagaciro no gufata ibyemezo" },
  { slug: "gender-equality", nameEn: "Gender & equality", nameRw: "Uburinganire n'ubwuzuzanye" },
  { slug: "gbv-safety", nameEn: "Gender-based violence & safety", nameRw: "Ihohoterwa rishingiye ku gitsina" },
  { slug: "puberty-adolescence", nameEn: "Puberty & adolescence", nameRw: "Ubugimbi n'ubwangavu" },
  { slug: "know-your-body", nameEn: "Know your body", nameRw: "Menya umubiri wawe" },
  { slug: "periods", nameEn: "Periods & menstrual health", nameRw: "Imihango n'isuku yayo" },
  { slug: "pregnancy", nameEn: "Fertilisation & pregnancy", nameRw: "Gusama no gutwita" },
  { slug: "abortion-law", nameEn: "Abortion & the law", nameRw: "Gukuramo inda n'amategeko" },
  { slug: "sexuality", nameEn: "Sexuality & sexual health", nameRw: "Imibonano mpuzabitsina n'ubuzima" },
  { slug: "relationships", nameEn: "Relationships & friendship", nameRw: "Imibanire n'ubucuti" },
  { slug: "communication", nameEn: "Communication & assertiveness", nameRw: "Itumanaho no kwiyemeza" },
  { slug: "contraception", nameEn: "Preventing teenage pregnancy", nameRw: "Kwirinda inda ziterwa abangavu" },
  { slug: "hiv-aids", nameEn: "HIV & AIDS", nameRw: "Virusi itera SIDA na SIDA" },
  { slug: "stis", nameEn: "Sexually transmitted infections", nameRw: "Indwara zandurira mu mibonano mpuzabitsina" },
  { slug: "talking-with-parents", nameEn: "Talking with parents", nameRw: "Kuganira n'ababyeyi" },
  { slug: "planning-future", nameEn: "Planning your future", nameRw: "Gutegura ejo hazaza" },
  { slug: "rights-law", nameEn: "Your rights & the law", nameRw: "Uburenganzira n'amategeko" },
];

/**
 * Images and videos, all from Wikimedia Commons under free licences. The seed downloads each file from
 * Commons when it creates the article, and the credit is added to the article's references.
 */
const MEDIA = {
  rwandaSchool: { commons: "Rwanda schoolchildren.jpg", credit: "Photo: Rwanda schoolchildren, USAID, public domain, via Wikimedia Commons" },
  rwandaEducation: {
    commons: "Flickr - usaid.africa - Basic education programs build skills for the future in Rwanda.jpg",
    credit: "Photo: Basic education programs build skills for the future in Rwanda, USAID Africa, public domain, via Wikimedia Commons",
  },
  rwandaDialogue: {
    commons: "Dialogue Club Building Project (Rwanda FrontLines, January 2013).jpg",
    credit: "Photo: Dialogue Club Building Project, USAID FrontLines (January 2013), public domain, via Wikimedia Commons",
  },
  rwandaCelebration: { commons: "Celebrations in Rwanda.jpg", credit: "Photo: Celebrations in Rwanda, CC0, via Wikimedia Commons" },
  rwandaMothers: {
    commons: "Mothers and children attend the bednet distribution launch in Bugesera District. Credit Amani AtharUSAID (17508345063).jpg",
    credit: "Photo: Mothers and children in Bugesera District, Amani Athar / USAID, public domain, via Wikimedia Commons",
  },
  femaleAnatomy: { commons: "Scheme female reproductive system-en.svg", credit: "Diagram: Female reproductive system, CDC and Mysid, public domain, via Wikimedia Commons" },
  maleAnatomy: { commons: "Illu repdt male.jpg", credit: "Illustration: Male reproductive system, US National Cancer Institute (SEER), public domain, via Wikimedia Commons" },
  sanitaryPad: { commons: "A Sanitary Towel on White Background.jpg", credit: "Photo: A sanitary towel, Linn.KnowSex, CC BY 4.0, via Wikimedia Commons" },
  pills: { commons: "Contraceptive Pills.jpg", credit: "Photo: Contraceptive pills, CC0, via Wikimedia Commons" },
  condomVideo: {
    commons: "How to use a Condom- Steps to Care.webm",
    credit: "Video: How to use a condom, US Centers for Disease Control and Prevention (CDC), public domain, via Wikimedia Commons",
  },
  hivVideo: {
    commons: "HIV and AIDS explained in a simple way.webm",
    credit: "Video: HIV and AIDS explained in a simple way, Jake Schneider, CC BY-SA 3.0, via Wikimedia Commons",
  },
  prepVideo: {
    commons: "PrEP - an HIV prevention option.webm",
    credit: "Video: PrEP, an HIV prevention option, US Centers for Disease Control and Prevention (CDC), public domain, via Wikimedia Commons",
  },
  stiVideo: {
    commons: "STI screening as HIV prevention.webm",
    credit: "Video: STI screening as HIV prevention, US Centers for Disease Control and Prevention (CDC), public domain, via Wikimedia Commons",
  },
};

/**
 * One article. Paragraphs are joined with blank lines; references (and the media credit) are listed at the end.
 * Videos are published with the VIDEO format so the app shows them as videos.
 */
const article = (category, title, paragraphs, { refs = [REF.booklet], media, format } = {}) => {
  const sources = [...refs, ...(media ? [media.credit] : [])];
  return {
    category,
    language: "EN",
    format: format ?? (media?.commons.endsWith(".webm") ? "VIDEO" : "ARTICLE"),
    isLowData: !media,
    title,
    content: [...paragraphs, ...(MORE[title] ?? []), `References:\n${sources.map((s) => `• ${s}`).join("\n")}`].join("\n\n"),
    ...(media ? { media: media.commons } : {}),
  };
};

/** A quiz: each question with its options, the answer and why. */
const quiz = (category, title, questions, refs = [REF.quiz, REF.booklet]) =>
  article(
    category,
    title,
    [...questions, ...(MORE_QUESTIONS[title] ?? [])].map(
      (q, i) => `${i + 1}. ${q.q}\n${q.options.map((o, j) => `   ${"ABCDEFG"[j]}. ${o}`).join("\n")}\nAnswer: ${q.answer}\nWhy: ${q.why}`
    ),
    { refs, format: "QUIZ" }
  );

/** `category` is a slug from the list above; the seed swaps it for the category id. */
export const articles = [
  // ---------- Values & decision-making ----------
  article("values-decisions", "Your values guide your choices", [
    "Values are the qualities, beliefs and ideas we feel strongly about, such as honesty, education or respect. We pick them up from our family, culture, religion, friends and the media, which is why different people hold different values.",
    "People who make decisions that match their values usually feel good about them later. Decisions that go against our values often lead to regret. Take Ngabo: he promised himself never to cheat in exams, but gave in to pressure from friends once. The punishment hurt, but what hurt most was breaking his own promise.",
    "Attitudes, the positive or negative way we feel about something, also shape behaviour. A young person who thinks \"I like the idea of abstinence, so I don't have to worry about pregnancy\" is more likely to abstain. Someone who thinks \"condoms protect me from pregnancy and infections\" is more likely to use them correctly.",
    "Before deciding how you feel about something, find out the facts: is it safe or risky, right or wrong? Attitudes built on careful thinking are stronger and help you stay true to yourself when others push you.",
  ], { media: MEDIA.rwandaEducation }),
  article("values-decisions", "Making big decisions, including about sex", [
    "Serious decisions can affect your health and your whole life, so it helps to have a process: know your options, think about the consequences of each, check them against your values, then decide.",
    "Many things influence our decisions: social norms, family, religion, the media and friends. Friends especially can push us, even without words, just by how they react. Recognising these influences helps you choose for yourself.",
    "Having sex is a decision, not something that \"just happens\". Sexual feelings are natural, but feeling aroused never means you must act on it.",
    "Reasons young people give for having sex that often lead to regret: to stop pressure from a partner or friends, to keep a partner, to get gifts or money, to prove you are grown up, or just out of curiosity.",
    "Good reasons to wait: your religious, family or personal values; not feeling ready; avoiding pregnancy, HIV and other infections; protecting your plans for school and work; and waiting for the right partner or for marriage.",
    "If you do decide to have sex, make sure it matches your values, that you can talk about it openly with your partner, that both of you agree freely, and that you know how to protect yourselves.",
  ]),

  // ---------- Gender & equality ----------
  article("gender-equality", "Sex, gender and stereotypes", [
    "Sex is the biological difference between males and females that we are born with. Gender is the set of roles and expectations that society builds on top of it, and these can change and differ from one community to another.",
    "A stereotype is the belief that everyone of the same sex, age or group should behave the same way. Common examples: \"men never cry and must always lead\", \"women are weak and should stay at home\".",
    "Stereotypes limit everyone. Boys may feel they must take risks, have many partners or use force to prove they are men. Girls may feel they must obey a partner's demands, accept harassment or avoid maths and science.",
    "None of this is true. Boys can cook, wash and care for children; girls can study any subject and lead. Majyambere, 13, does housework his friends call \"girls' work\" and speaks up whenever someone says a course or job is only for one sex. Equal roles open more opportunities for everyone.",
  ]),
  article("gender-equality", "Gender bias and discrimination", [
    "Bias means favouring one group; discrimination means treating people unfairly because of that bias. In many societies, boys and men are valued more than girls and women.",
    "Examples that hurt girls and women: not being sent to school, being married or becoming mothers too young, being sent out of school when pregnant while the boy continues, not inheriting property, earning less for the same job, and being left out of decision-making.",
    "Boys and men face discrimination too: being told never to show emotions, being expected to provide at any cost, and being kept away from activities seen as \"for girls\".",
    "Either a boy or a girl can wear any clothes, do housework, play sport, choose any career, and benefit their family and community equally. Challenging bias is a first step towards ending gender-based violence.",
  ]),

  // ---------- Gender-based violence & safety ----------
  article("gbv-safety", "Understanding gender-based violence", [
    "Gender-based violence (GBV) is harm done to someone because of their gender. It often happens at home and by someone the person knows, which is why it is also called domestic violence.",
    "Forms of violence:\n• Physical: beating, kicking, stabbing\n• Emotional: insulting, humiliating, threatening, isolating, ignoring on purpose\n• Economic: controlling or taking someone's money or property\n• Sexual: rape, forced or pressured sex, sexual harassment\n• Harmful traditional practices: forced marriage, female genital mutilation",
    "Your body belongs to you. You have the right to privacy and to tell anyone not to touch you. Anyone who ignores this is abusing you, and it is never the victim's fault.",
    "Sex must always be a joint decision with active agreement from both people. Pressuring someone with gifts, money, threats or emotions is coerced sex, which is a form of violence.",
    "Everyone can help end GBV: commit never to use violence, treat girls and boys as equally valuable, talk openly about sexuality at home, and tell someone you trust if you see or experience violence.",
  ]),
  article("gbv-safety", "What to do after sexual violence", [
    "If you have been sexually assaulted, it is not your fault, whatever happened before. Help is available.",
    "Steps to take:\n• Leave the place and go somewhere safe.\n• Tell a trusted adult or organisation as soon as you can.\n• Go to a health facility or Isange One Stop Centre as soon as possible, ideally within 72 hours. If you can, do this before washing or changing clothes, so evidence can be collected.\n• Report the abuse to the police or Isange One Stop Centre, ideally with a supportive adult.",
    "Early care can prevent HIV (with PEP medicine, started within 72 hours) and pregnancy (with emergency contraception), treat injuries and help with counselling.",
    "You can lower your risk by knowing your rights, refusing lifts and gifts from strangers, avoiding being alone in unsafe places, and avoiding alcohol and drugs, which make it harder to judge situations.",
  ]),
  quiz("gbv-safety", "Quiz: consent and violence", [
    {
      q: "If you don't feel comfortable having sex without a condom and your partner disagrees, it is okay not to have sex.",
      options: ["True", "False"],
      answer: "A. True",
      why: "Sex is an agreement between both people and should only happen when and how you want it to. If your partner does not respect what you are comfortable with, it is okay to say no.",
    },
    {
      q: "Kelia is 15. Her step-father comes home drunk, beats her, sometimes rapes her, and threatens to kill her if she tells anyone. Which type of gender-based violence is she facing?",
      options: ["Physical violence", "Emotional violence", "Sexual violence", "All of the above"],
      answer: "D. All of the above",
      why: "The beating is physical violence, the threats are emotional violence and the rape is sexual violence. Kelia can get help from an Isange One Stop Centre: no one is allowed to abuse her, and her step-father is committing a crime.",
    },
  ]),

  // ---------- Puberty & adolescence ----------
  article("puberty-adolescence", "The stages of adolescence", [
    "The World Health Organization defines adolescents as young people aged 10 to 19. Adolescence starts with puberty, the body changes that make reproduction possible, and ends with adulthood.",
    "Early adolescence (about 10 to 14): genitals grow, hair grows under the arms and around the genitals, sweating and oily skin increase. Girls' breasts and hips grow and periods start; boys' voices deepen, testicles grow and wet dreams begin. Thinking becomes more critical, and friends become very influential.",
    "Middle adolescence (about 14 to 17): body changes continue. Boys keep growing fast while girls' growth slows and periods often become regular. Many young people start to feel attracted to others and want more independence.",
    "Late adolescence (about 18 to 19): most physical growth is complete, although young men may keep building muscle and growing facial hair. Young people think more about the future, other people and becoming self-reliant.",
    "Everyone changes at their own pace, set by their hormones. Being earlier or later than friends is usually normal; talk to a parent, teacher or health worker if something worries you.",
  ], { media: MEDIA.rwandaSchool }),
  article("puberty-adolescence", "Body changes in girls and boys", [
    "In both girls and boys: genitals grow, hair grows under the arms and around the genitals, height and weight increase, sweat glands become active and skin gets oilier, which can cause acne.",
    "Mostly in girls: breasts develop, hips widen, fat is stored differently, periods start (usually between ages 9 and 15) and there is normal vaginal discharge.",
    "Mostly in boys: facial and chest hair, a deeper voice, broader shoulders and chest, stronger muscles, first ejaculation and wet dreams.",
    "Emotional and social changes are similar for both: mood swings, new sexual feelings, worry about how your body looks, wanting more independence, feeling closer to friends and being influenced by them.",
    "First periods mean a girl can become pregnant, and wet dreams mean a boy can make someone pregnant. That does not mean their bodies or minds are ready for a baby. Pregnancy in the teenage years carries extra health risks, and parenting needs emotional growth and preparation.",
  ]),
  quiz("puberty-adolescence", "Quiz: puberty", [
    {
      q: "Which statement is NOT true?",
      options: [
        "Early adolescence is generally from 10 to 14",
        "Middle adolescence is generally from 15 to 17",
        "Late adolescence is generally from 18 to 19",
        "By middle adolescence, boys and girls have finished growing physically",
      ],
      answer: "D",
      why: "Physical changes continue during middle adolescence. Most young people finish growing physically in late adolescence (18 to 19).",
    },
    {
      q: "Which of these is NOT a myth about masturbation?",
      options: ["Masturbation makes you lose your virginity", "Masturbation increases penis size", "Only girls masturbate", "Acne is usually caused by hormone changes in puberty"],
      answer: "D",
      why: "Acne comes from hormone changes. You cannot lose your virginity without penetrative sex with another person, penis size is mostly genetic, and people of any sex or age can masturbate.",
    },
  ]),

  // ---------- Know your body ----------
  article("know-your-body", "The male reproductive system", [
    "Outside the body:\n• Penis: used for urination and sex.\n• Scrotum: the skin pouch that holds and protects the testicles.\n• Foreskin: covers the tip of the penis when it is not erect (removed in circumcision).",
    "Inside the body:\n• Testicles (testes): make sperm and the hormone testosterone.\n• Epididymis: a coiled tube behind each testicle that stores sperm.\n• Vas deferens: tubes that carry sperm towards the urethra.\n• Seminal vesicles and prostate gland: make most of the fluid in semen.\n• Urethra: carries urine, and semen during ejaculation, out of the body.",
    "From puberty, the testicles grow and keep producing sperm for life.",
    "It is normal for genitals to look different from person to person and to develop at different ages. Rukundo, 13, worried that he looked different from his 15-year-old friend, but he was simply at an earlier stage of puberty. Only a health professional can tell you if something is wrong.",
  ], { media: MEDIA.maleAnatomy }),
  article("know-your-body", "The female reproductive system", [
    "Outside the body (the vulva):\n• Mons pubis: the soft pad over the pubic bone, covered with hair after puberty.\n• Outer and inner lips (labia majora and minora): folds of skin that protect the openings.\n• Clitoris: a small, very sensitive organ above the urinary opening.\n• Urinary opening: where urine leaves the body.\n• Vaginal opening: where menstrual blood leaves the body and babies are born.\n• Hymen: a thin, stretchy tissue some girls have around the vaginal opening. It can stretch or tear during sport or daily activities.",
    "Inside the body:\n• Vagina: the passage from the vulva to the cervix.\n• Cervix: the lower opening of the uterus.\n• Uterus (womb): where a pregnancy grows.\n• Fallopian tubes: carry the egg from the ovary to the uterus.\n• Ovaries: hold the eggs and make the hormones oestrogen and progesterone.",
    "Knowing the names and what each part does helps you look after your body and explain any problem clearly to a health worker.",
  ], { media: MEDIA.femaleAnatomy }),
  article("know-your-body", "When reproductive organs develop differently", [
    "Sometimes reproductive organs form differently while a baby is growing in the womb. Most of these conditions can be treated by doctors.",
    "In boys, examples include: the urinary opening being on the underside or top of the penis instead of the tip (hypospadias, epispadias), a testicle that has not moved down into the scrotum (undescended testicle), and unusually small testicles or penis.",
    "In girls, examples include: joined labia, a hymen that completely blocks the vaginal opening (which can stop menstrual blood from leaving and cause pelvic pain at puberty), and differences in the shape of the uterus, cervix or vagina. Some are only found at puberty or when trying to get pregnant.",
    "If you notice something unusual, such as no periods by age 15 with monthly pelvic pain, or a testicle you cannot feel in the scrotum, see a health worker. These are medical conditions, not something to be ashamed of.",
  ]),

  // ---------- Periods & menstrual health ----------
  article("periods", "How the menstrual cycle works", [
    "Each month, the body prepares for a possible pregnancy. Hormones make an egg grow in an ovary, and the lining of the uterus thickens. Around the middle of the cycle, the ovary releases the egg (ovulation).",
    "If the egg does not meet a sperm, hormone levels drop and the lining is shed through the vagina. This is your period (menstruation). Then the cycle starts again.",
    "Key facts:\n• Most girls get their first period between ages 9 and 16.\n• Bleeding usually lasts 3 to 7 days.\n• A cycle is counted from the first day of one period to the first day of the next. It is usually 21 to 35 days, often about 28.\n• From ovulation to the next period is usually about 14 days.\n• Periods continue until menopause, usually between ages 45 and 55, except during pregnancy.",
    "In the first years, cycles are often irregular. Stress, illness, travel, diet and hormones can all change a cycle. A missed period does not always mean pregnancy, but if you have had sex, take a pregnancy test or see a health worker.",
  ]),
  article("periods", "Counting your cycle and fertile days", [
    "Tracking your cycle helps you know when your next period is coming. To learn your pattern, write down the first day of every period for at least six months.",
    "Regular cycle (same length each month):\n1. Next period = first day of your last period + your cycle length.\n2. Ovulation = next period minus 14 days.\n3. Fertile days = from 5 days before ovulation to 2 days after it (sperm can live about 5 days; the egg about 1 day).\nExample: Iradukunda has a 32-day cycle and her last period started on 26 September. Next period: 28 October. Ovulation: 14 October. Fertile days: 9 to 16 October.",
    "Irregular cycle:\n1. First fertile day = your shortest cycle minus 18.\n2. Last fertile day = your longest cycle minus 11.\nExample: Uwamahoro's cycles last 25 to 28 days. 25 − 18 = day 7 and 28 − 11 = day 17, counted from the first day of her period.",
    "Important: counting days is not a reliable way for young people to avoid pregnancy. Cycles change easily, mistakes happen, and with short cycles the fertile days can even fall during your period. It also gives no protection from HIV or other infections. Abstinence or condoms (with or without another method) are much safer.",
    "If you recently stopped hormonal contraception, track your cycle again for several months before relying on any count, because its length may have changed.",
  ], { refs: [REF.booklet, REF.quiz] }),
  article("periods", "Menstrual hygiene", [
    "Choose a method that suits you and that you can afford: disposable pads, reusable cloth pads, tampons or a menstrual cup. Try to stick with one, as the body can react differently to each.",
    "Change regularly: pads and cloths at least every 6 hours, tampons every few hours and cups every 12 hours, or sooner if full. Blood left too long in warm, moist conditions can cause infections.",
    "Dispose of products properly: put used pads and tampons in a bin, not the toilet. Wash reusable cloths and cups with soap and water, and dry cloths in the sun.",
    "Wash every day. Clean between the labia with warm water, and wipe from front to back so germs from the anus don't reach the vagina or urinary opening.",
    "Avoid soap and other products inside the vagina: it cleans itself, and soap upsets its natural balance. Soap is fine on the outside.",
    "Wash your hands often, especially after changing a pad, and wear loose, comfortable clothes that let air through.",
  ], { media: MEDIA.sanitaryPad }),
  article("periods", "Period pain and when bleeding is not normal", [
    "Cramps in the lower belly, sometimes spreading to the back and thighs, are common during periods. They happen because the uterus contracts as it sheds its lining, triggered by chemicals called prostaglandins. When there is no other illness behind it, this is called primary dysmenorrhoea.",
    "To ease the pain: put a hot water bottle or warm cloth on your lower belly, exercise regularly, rest and sleep 7 to 8 hours. Pain relievers such as ibuprofen or naproxen reduce prostaglandins and work best when started as your period begins. A health worker can also suggest hormonal methods that make periods lighter and less painful.",
    "If pain is severe, stops you from going to school, or gets worse with age, see a health worker. It can be caused by conditions such as endometriosis or fibroids (secondary dysmenorrhoea), which can be treated.",
    "See a health worker if:\n• your cycle is much shorter than 21 days or you go more than 2 months without a period\n• bleeding lasts more than 8 days\n• bleeding is much heavier or lighter than usual for you\n• you bleed between periods\n• your shortest and longest cycles differ by 10 days or more\n• you have unexpected bleeding while using hormonal contraception",
  ]),
  quiz("periods", "Quiz: periods and fertile days", [
    {
      q: "Keza tracked her cycle for six months. Her shortest cycle was 26 days and her longest 30 days. When are her fertile days?",
      options: ["Day 6 to day 17", "Day 8 to day 18", "Day 8 to day 19", "Day 7 to day 18"],
      answer: "C. Day 8 to day 19",
      why: "Shortest cycle minus 18 (26 − 18 = 8) and longest cycle minus 11 (30 − 11 = 19), counted from the first day of her period.",
    },
    {
      q: "Iradukunda has a regular 32-day cycle. Her last period started on 26 September 2022. When are her fertile days?",
      options: ["9 to 16 October", "10 to 17 October", "8 to 15 October", "None of these"],
      answer: "A. 9 to 16 October",
      why: "Next period: 26 September + 32 days = 28 October. Ovulation: 28 October − 14 days = 14 October. Fertile days: 5 days before to 2 days after, so 9 to 16 October.",
    },
    {
      q: "Which statement about menstrual hygiene is NOT correct?",
      options: ["Choose a method of sanitation", "Change pads regularly", "Dispose of products properly", "If you use pads correctly, you don't need to bathe regularly"],
      answer: "D",
      why: "Bathing regularly during your period prevents bad smells and infections such as bacterial vaginosis and urinary tract infections.",
    },
    {
      q: "Should a girl who recently stopped using contraception rely on counting days before checking her cycle length again?",
      options: ["No, she should track her cycle again first", "Yes, her old cycle still applies"],
      answer: "A",
      why: "Hormonal contraception affects the cycle, so the new cycle may have a different length or be irregular.",
    },
    {
      q: "What are painful periods without any underlying disease called?",
      options: ["Primary dysmenorrhoea", "Secondary dysmenorrhoea", "Dyspareunia", "Polymenorrhoea"],
      answer: "A. Primary dysmenorrhoea",
      why: "It is caused by prostaglandins that make the uterus contract, even in healthy girls.",
    },
    {
      q: "Which of these pain relievers are anti-inflammatory medicines that can reduce period pain?",
      options: ["Ibuprofen or naproxen", "Aspirin", "Coartem", "All of these"],
      answer: "A. Ibuprofen or naproxen",
      why: "They reduce the release of prostaglandins. Coartem is a malaria medicine.",
    },
  ]),

  // ---------- Fertilisation & pregnancy ----------
  article("pregnancy", "How pregnancy happens", [
    "During sex, when a man ejaculates, hundreds of millions of sperm enter the vagina. Only a few make it through the cervix and uterus to the fallopian tubes.",
    "If an egg is there, one sperm can join with it. This is fertilisation, and it creates the first cell of a new human being. Rarely, two eggs are fertilised and twins develop.",
    "The fertilised egg divides as it travels to the uterus. About 8 to 9 days after fertilisation it attaches to the lining of the uterus (implantation), and pregnancy begins. The placenta then forms to feed the baby and remove waste.",
    "After 8 weeks the developing baby is called a fetus. A pregnancy usually lasts about 40 weeks, counted from the first day of the last period.",
    "It does not matter where or how unprotected sex happens: in water, standing up, in any position or at any time of day. If there is an egg, pregnancy is possible. A missed period is a common sign; a pregnancy test or a health worker can confirm it.",
  ]),
  article("pregnancy", "Pregnancy myths and facts", [
    "Myth: You can't get pregnant the first time.\nFact: You can get pregnant any time you have unprotected sex, including the first time.",
    "Myth: You can't get pregnant if you have sex in water.\nFact: Water does not stop sperm. Pregnancy is possible in a lake, pool or bath.",
    "Myth: Jumping up and down or washing the vagina after sex prevents pregnancy.\nFact: Sperm move fast. Neither jumping nor douching stops them.",
    "Myth: Sex standing up or with the girl on top can't cause pregnancy.\nFact: Sperm swim upwards. No position prevents pregnancy.",
    "Myth: Pulling out before ejaculation is safe.\nFact: The fluid released before ejaculation (pre-cum) can contain sperm, and pulling out in time takes self-control many people don't have.",
    "Myth: You can't get pregnant during your period, or if a period app says you're not fertile.\nFact: With short or irregular cycles you can, and apps can be wrong.",
    "Myth: Alcohol kills sperm, so you can't get pregnant when drunk.\nFact: Alcohol does not prevent pregnancy. It makes good decisions harder.",
    "The only reliable ways to prevent pregnancy are abstinence or protected sex.",
  ], { refs: [REF.booklet, REF.quiz] }),
  article("pregnancy", "Staying healthy during pregnancy", [
    "Common changes in pregnancy include a faster heartbeat and breathing, weight gain and stretch marks, nausea and vomiting, food cravings, tiredness, needing to urinate often, back pain, swelling of the face, hands or feet, dizziness, poor sleep and mood changes. These are usually normal, but see a health worker if they stop you from doing daily activities.",
    "Pregnancy can also have complications, such as anaemia, high blood pressure, gestational diabetes, infections, miscarriage, placenta problems and early labour, as well as depression and anxiety.",
    "Go to a health facility as soon as you think you are pregnant, and keep going for antenatal check-ups. Health workers can prevent complications and treat them early.",
    "Also: eat a balanced diet, stay active, take iron and folic acid supplements, and give birth at a health facility.",
    "Go immediately if you have bleeding, a severe headache, blurred vision, fever, or if the baby stops moving.",
  ], { refs: [REF.booklet, REF.quiz], media: MEDIA.rwandaMothers }),
  article("pregnancy", "Risks of pregnancy in the teenage years", [
    "A girl's body and mind are still developing during adolescence, so pregnancy carries extra risks for her and the baby.",
    "Health risks:\n• Higher risk of high blood pressure in pregnancy (pre-eclampsia and eclampsia), which can be fatal.\n• Higher risk of infections.\n• Difficult deliveries, and a risk of obstetric fistula, an injury that causes urine or faeces to leak, which can lead to depression, infertility and isolation.\n• Babies are more likely to be born early, small or sick.\n• Many pregnant teenagers turn to unsafe abortion, which can cause serious harm or death.",
    "Social risks: stigma, rejection by family or partner, violence, forced marriage, dropping out of school, poverty and quick repeat pregnancies.",
    "If you are pregnant, go to a health facility to confirm it and talk through your options. If you continue the pregnancy, regular antenatal care protects you and your baby. Remember that a pregnant student has the right to continue her education.",
  ], { refs: [REF.booklet, REF.quiz] }),
  quiz("pregnancy", "Quiz: pregnancy", [
    {
      q: "Which statement about pregnancy is true?",
      options: ["You can't get pregnant the first time", "You can't get pregnant in water", "Sex during the day can't cause pregnancy", "Alcohol kills sperm, so you can't get pregnant when drunk", "None of these"],
      answer: "E. None of these",
      why: "Unprotected sex can cause pregnancy anywhere, at any time, drunk or sober, including the first time.",
    },
    {
      q: "Which timing of sex can lead to pregnancy?",
      options: ["5 days before ovulation and 2 days after", "8 days before and 3 days after", "Only on the day of ovulation", "None of these"],
      answer: "A",
      why: "Sperm can live up to about 5 days in the body and the egg lives about 24 hours after ovulation.",
    },
    {
      q: "Why should pregnant women visit a health facility as soon as they suspect they are pregnant?",
      options: ["To prevent complications and treat them early", "To get an abortion", "Only to get free vitamins", "Only to get an ultrasound"],
      answer: "A",
      why: "Antenatal visits let health workers monitor mother and baby and act early if problems appear.",
    },
    {
      q: "Which is NOT a common change in pregnancy?",
      options: ["A slower heartbeat and breathing", "Weight gain and stretch marks", "Nausea, cravings and tiredness", "Frequent urination, back pain and swelling", "Dizziness, poor sleep and mood changes"],
      answer: "A",
      why: "Heart rate, breathing and blood volume increase in pregnancy to support the growing baby.",
    },
    {
      q: "What physical complication are adolescent mothers at higher risk of?",
      options: ["Low self-esteem", "Pre-eclampsia or eclampsia", "Fear of abandonment", "Loneliness"],
      answer: "B",
      why: "Mothers aged 10 to 19 face higher risks of pregnancy-related high blood pressure, which can be fatal.",
    },
    {
      q: "What risk do babies born to mothers under 20 face?",
      options: ["Rapid growth", "High birth weight", "Low birth weight", "Walking early"],
      answer: "C",
      why: "They are more likely to be born small, early, or with serious newborn illnesses.",
    },
  ]),

  // ---------- Abortion & the law ----------
  article("abortion-law", "Abortion and the law in Rwanda", [
    "Abortion means a pregnancy ending before the baby can survive. A miscarriage happens on its own; an induced abortion is brought about on purpose.",
    "In Rwanda, abortion is generally a crime. But article 125 of the penal code (Law No 68/2018) allows it in five situations:\n• the pregnant person is a child (under 18)\n• the pregnancy is the result of rape\n• the pregnancy is the result of forced marriage\n• the pregnancy is the result of incest with a relative up to the second degree\n• the pregnancy puts the health of the pregnant person or the baby at risk",
    "No court decision is needed. When one of these applies and the pregnant person wants an abortion, she can get care from a doctor at a licensed public or private hospital or polyclinic.",
    "If you were raped, an Isange One Stop Centre can also help with medical care, counselling and reporting.",
  ], { refs: [REF.penal, REF.booklet, REF.quiz] }),
  article("abortion-law", "Unsafe abortion and care after abortion", [
    "An abortion is safe only when done by a trained doctor in a properly equipped health facility. Abortions done by untrained people, or with herbs, unknown pills or objects, can cause heavy bleeding, infection, infertility and death.",
    "According to the WHO, around 45% of abortions worldwide are unsafe, almost all of them in developing countries. Unsafe abortion is a leading but preventable cause of maternal death.",
    "Go to a health facility immediately if, after an abortion or miscarriage, you have heavy bleeding (soaking more than two pads an hour for two hours), fever, strong belly pain or bad-smelling discharge.",
    "Health facilities provide care after abortion and after miscarriage. Getting help quickly can save your life, and health workers can also talk with you about contraception to prevent another unplanned pregnancy.",
  ], { refs: [REF.booklet, REF.who] }),
  quiz("abortion-law", "Quiz: abortion and the law", [
    {
      q: "In Rwanda, abortion is illegal except when:",
      options: [
        "The pregnant person is under 18",
        "The pregnancy is the result of rape",
        "The pregnancy follows a forced marriage",
        "The pregnancy is the result of incest up to the second degree",
        "The pregnancy puts the health of the pregnant person or the fetus at risk",
        "All of these",
        "None of these",
      ],
      answer: "F. All of these",
      why: "These are the five situations in article 125 of Law No 68/2018 where abortion is allowed.",
    },
  ], [REF.quiz, REF.penal]),

  // ---------- Sexuality & sexual health ----------
  article("sexuality", "Understanding sexuality and intimacy", [
    "Sexuality is much more than sex. It includes how you feel about your body, being a man or a woman, your beliefs and values, your feelings and attractions, and how you act on them. It is shaped by biology, emotions, family, culture, religion and the law.",
    "Intimacy is feeling emotionally close to someone and having that closeness returned, through caring, liking, loving and sharing. You can be very close to someone without having sex.",
    "Sexualisation is using sex to influence, manipulate or control someone, for example offering money for sex, refusing sex to punish a partner, sexual harassment or abuse.",
    "Deciding whether to have sex is one of the biggest decisions a young person makes. Before any sexual activity, make sure it fits your values, that you can talk about it openly with your partner, that you know how to protect yourselves from pregnancy and infections, and that you have thought about the consequences.",
  ]),
  article("sexuality", "Sexual feelings and how to handle them", [
    "Sexual desire, feeling attracted to someone or wanting sexual closeness, is normal for both young people and adults, and for both men and women. How strong it is changes over life and with health, tiredness, alcohol, culture and life experiences.",
    "Desire is not love, and it is not an order. Feeling attracted to someone, or having an erection or a wet dream, does not mean you have to have sex. You decide whether to act on your feelings.",
    "Healthy ways to handle sexual feelings:\n• Learn about consent and respect.\n• Know your own limits and values.\n• Talk openly with a partner about boundaries and expectations.\n• Notice what triggers you, and avoid places, content or company that push you towards choices you will regret.\n• Look after yourself: sport, hobbies, sleep and good friendships help.\n• Think about the consequences before acting.\n• Talk to a counsellor or health worker if your feelings are hard to manage.",
  ]),
  article("sexuality", "Myths about sex and sexuality", [
    "Myth: A wet dream means a boy needs sex.\nFact: Wet dreams are a normal part of puberty and don't mean anything is missing.",
    "Myth: Masturbation makes you blind or sick.\nFact: There are no proven physical or mental health harms from masturbation, though some religions and cultures don't accept it.",
    "Myth: Two condoms give double protection.\nFact: Two condoms rub together and are more likely to break. Use one, correctly, every time.",
    "Myth: Contraceptives are only for married people, are harmful, or damage your fertility.\nFact: Anyone can use contraceptives. There is no medical evidence that they damage reproductive organs.",
    "Myth: A girl needs her parents' permission to learn about contraception.\nFact: Rwanda's adolescent reproductive health policy gives young people the right to SRH information. Talking with parents is still encouraged.",
    "Myth: If you go on a date, you must have sex.\nFact: Sex needs both people's free agreement. A date is not consent.",
    "Myth: Oral sex is completely safe.\nFact: It is lower risk than penetrative sex, but STIs can still pass through body fluids.",
    "Myth: You can tell genital size from someone's mouth or feet.\nFact: There is no connection between them.",
    "Myth: Most women don't desire sex.\nFact: Both women and men have sexual desire, even if society tells women not to show it.",
    "When you hear a myth, check it with a parent, mentor, counsellor or health worker.",
  ]),
  article("sexuality", "Pornography and your wellbeing", [
    "Pornography (porn) is printed or online material showing sex or nudity, made to arouse viewers. It is edited and staged, so it does not show what real sex or relationships are like.",
    "Many adolescents watch porn out of curiosity or to learn about sex, especially when no one talks to them about sexuality.",
    "Research links watching porn as a teenager with insecurity about your body and sexual performance, lower life satisfaction, depression, anxiety, aggressive behaviour, unrealistic ideas about sex and starting sex earlier.",
    "Porn is not a good teacher. For real answers, talk with a parent, teacher, counsellor or health worker, and use trusted health information like this app.",
  ]),
  quiz("sexuality", "Quiz: sexual health", [
    {
      q: "When is a couple considered infertile?",
      options: ["After 1 year of unprotected sex, at any age", "After 6 months, at any age", "After 1 year of unprotected sex if the woman is under 35", "After 6 months if the woman is under 35"],
      answer: "C",
      why: "Infertility means not getting pregnant after 1 year of regular unprotected sex when the woman is under 35, or after 6 months when she is 35 or older.",
    },
    {
      q: "Which can influence the decisions a person makes?",
      options: ["Family", "Religion", "Social norms", "Friends", "All of these"],
      answer: "E. All of these",
      why: "Family, religion, social norms, friends and the media all shape decisions. Knowing this helps you choose for yourself.",
    },
  ]),

  // ---------- Relationships & friendship ----------
  article("relationships", "Qualities of a good friend", [
    "During adolescence, friends become very important, and being a good friend matters as much as having one.",
    "A good friend:\n• listens without interrupting, and forgives\n• is loyal and keeps your secrets\n• is honest and respectful\n• helps you and lets you know they care\n• gives and takes\n• accepts you, and helps you become your best self",
    "A friendship may be in trouble if your friend gossips about you or shares your secrets, lies or cheats, bullies you or others, only contacts you when they need something, is selfish, or pressures you to do things you know are wrong or don't want to do.",
  ], { media: MEDIA.rwandaCelebration }),
  article("relationships", "Healthy love and relationships", [
    "Love is a deep feeling of care, respect, attraction and understanding for someone, even with their faults. Sex is not the only way to show love, and having sex does not make two people fall in love.",
    "Love is never a good reason to put your health or future at risk. A healthy relationship helps both people grow and care for their health and goals.",
    "What young people look for in a partner: love, care, trust and respect; fun and support; the freedom to think for themselves; confidence; and someone who is genuine rather than putting on a show.",
    "It's okay to take your time. Gihozo and Kiza studied together and became good friends. When Kiza asked her to be his girlfriend, she chose to stay friends until she was sure she was ready, and that was her right.",
    "Warning signs: a partner who controls who you see, checks your phone, pressures you into sex, threatens you or makes you afraid. You deserve to feel safe. Talk to someone you trust if a relationship worries you.",
  ]),

  // ---------- Communication & assertiveness ----------
  article("communication", "Communicating well", [
    "Communication is sending and receiving a message so that both people understand it. It can be verbal (spoken or written words, including on social media) or non-verbal (gestures, facial expressions, body language).",
    "Good communication helps us respect each other, express ourselves safely, solve conflicts without violence and build good relationships.",
    "When listening: look at the person, don't interrupt, focus on what they say, show interest with your body, put yourself in their shoes, and repeat back what you heard in your own words.",
    "When speaking:\n• Use \"I\" statements: \"I feel uncomfortable about that\" rather than \"You always…\".\n• Be clear and direct, without being aggressive.\n• Get your facts right, and be honest when you're unsure.\n• Show respect, and don't put the other person down.\n• Mind your tone and body language; they can say more than your words.",
    "Things that get in the way: wrong words or tone, bad timing, speaking too fast, anger, not listening, interrupting, changing the subject and shouting.",
  ], { media: MEDIA.rwandaDialogue }),
  article("communication", "Being assertive and saying no", [
    "Being assertive means saying clearly and honestly what you think, feel and want, while respecting the other person. Being aggressive means getting your way at someone else's expense, through blaming, shouting or violence. Being passive means not saying what you need at all.",
    "Assertiveness helps you reach your goals, resist negative peer pressure, refuse sex you don't want, respond to sexual harassment, and refuse to join in teasing others.",
    "The STAR model for problems: Stop and recognise the problem, Think and communicate, Act, then Reflect and review.",
    "Negotiating in six steps:\n1. Say what you want, using \"I want…\".\n2. Ask what the other person wants.\n3. Listen carefully.\n4. Repeat both positions to be sure you understand, and keep emotions in check. Say \"No\" clearly to anything unsafe.\n5. Look for a compromise you can both accept.\n6. Agree on a solution, and try again if it doesn't work.",
  ]),

  // ---------- Preventing teenage pregnancy ----------
  article("contraception", "Why preventing teenage pregnancy matters", [
    "Teenage pregnancy means pregnancy in a girl under 20. The WHO estimates that about 12 million girls aged 15 to 19 give birth each year in developing countries, and complications of pregnancy and childbirth are a leading cause of death for this age group worldwide.",
    "In Rwanda, the 2015 Demographic and Health Survey found that by age 19, about 1 in 5 girls had become a mother or was pregnant. Lack of information about contraception and barriers to services are linked to teenage pregnancy.",
    "In Rwanda's 2009 national youth survey, only 21% of young women were using a contraceptive method, and the radio was the main source of information about family planning.",
    "Preventing teenage pregnancy:\n• lets girls finish school and build their future\n• protects young people from dangerous pregnancies and unsafe abortion\n• spares boys and girls costs and responsibilities they are not ready for\n• gives young people time to grow before becoming parents",
    "Kaliza accepted gifts from an older neighbour and later had sex with him. At 19 she had a 2-year-old child, had left school and had been abandoned. She says that if she had known how to prevent pregnancy, she would be preparing for university like her classmates.",
  ], { refs: [REF.booklet, REF.who, REF.bss] }),
  article("contraception", "Contraceptive methods explained", [
    "Abstinence, not having sex, is the safest way to prevent both pregnancy and HIV. If abstinence fails, there are many methods. A health worker can help you choose the right one.",
    "Short-term methods (can be started and stopped any time):\n• Condoms (male and female): the only methods that also protect against STIs, including HIV. Male condoms are about 98% effective with perfect use.\n• Pills: combined pills, or progestogen-only pills taken every day within 3 or 12 hours of the same time, depending on the type.\n• Injections (such as Depo-Provera): more than 99% effective when given on time.\n• Diaphragm or cap: not commonly available in Rwanda.",
    "Long-acting methods:\n• Implant: a small rod under the skin of the arm, lasting about 3 years, more than 99% effective.\n• IUD: a small T-shaped device in the uterus. The copper IUD lasts 5 to 10 years and the hormonal IUD 3 to 5 years, both more than 99% effective.",
    "Permanent methods: female sterilisation (tubes blocked) and vasectomy (tubes carrying sperm cut). Both are more than 99% effective and very hard to reverse. After a vasectomy, use another method for 8 to 12 weeks.",
    "Natural methods (counting days, body temperature, withdrawal) are not reliable for young people. Exclusive breastfeeding can prevent pregnancy for the first 6 months after birth if no other food is given and periods have not returned.",
    "Only condoms protect against STIs. If you use another method, use condoms too.",
  ], { refs: [REF.booklet, REF.quiz], media: MEDIA.pills }),
  article("contraception", "How to use a condom", [
    "Male condom:\n1. Check the expiry date and that the packet is not damaged.\n2. Open it carefully with your fingers, not your teeth.\n3. Check which way it unrolls, and pinch the tip to leave space.\n4. Roll it all the way down the erect penis before any contact.\n5. After ejaculation, hold the condom at the base while pulling out.\n6. Tie it, wrap it and put it in a bin, not the toilet. Use a new condom every time.",
    "Female condom:\n1. Check the expiry date and open the packet with your fingers.\n2. Squeeze the inner ring and insert it into the vagina, sitting, lying down or with one leg on a chair.\n3. Push it in with your finger; the outer ring stays outside.\n4. Guide the penis inside the condom.\n5. After sex, twist the outer ring and pull it out gently. Use it only once and throw it in a bin.",
    "Never use two condoms at once: they rub together and break. If you use extra lubricant, choose water- or silicone-based; oil, lotion or petroleum jelly can damage condoms.",
    "Talking about condoms: bring it up before things get physical. Saying \"I don't feel comfortable without a condom\" is enough. If your partner refuses, it is okay not to have sex. Removing a condom without agreement (stealthing) is abuse.",
    "If a condom breaks, emergency contraception and PEP are available at health facilities.",
  ], { media: MEDIA.condomVideo }),
  article("contraception", "Emergency contraception", [
    "Emergency contraception can prevent pregnancy after unprotected sex or when a method fails, for example if a condom breaks. It is not for regular use.",
    "Options:\n• Levonorgestrel pill: take within 3 days (72 hours) of unprotected sex.\n• Ulipristal acetate pill: take within 5 days (120 hours).\n• Copper IUD: fitted by a health worker within 5 days. It is the most effective option and can stay in as ongoing contraception.",
    "The pills work by delaying ovulation, so the sooner you take them, the better.",
    "Emergency contraception does not protect against HIV or other STIs. If there was a risk of HIV, ask about PEP at the same visit; it must start within 72 hours.",
  ]),
  article("contraception", "Where to get contraception in Rwanda", [
    "Most contraceptive methods can be found at:\n• health centres, district hospitals and referral hospitals\n• licensed pharmacies\n• online pharmacies such as Kasha Rwanda\n• youth centres and youth corners\n• some schools and shops",
    "A health worker can explain each method, help you choose one that suits you and answer questions about side effects.",
    "Young people in Rwanda have the right to sexual and reproductive health information and services.",
  ], { refs: [REF.booklet, REF.quiz, REF.rhLaw] }),
  quiz("contraception", "Quiz: preventing pregnancy", [
    {
      q: "How are progestogen-only pills taken?",
      options: ["Every day, within 3 or 12 hours of the same time, depending on the type", "Two or three times a day as convenient", "Every day within 4 or 8 hours", "None of these"],
      answer: "A",
      why: "There are 28 pills in a pack, one a day with no break. Following the instructions matters most.",
    },
    {
      q: "A vasectomy is more than 99% effective, but you must use contraception for 8 to 12 weeks after the operation.",
      options: ["Yes", "No"],
      answer: "A. Yes",
      why: "Sperm remain in the tubes for some weeks after the operation.",
    },
    {
      q: "Where can most contraceptive methods be found in Rwanda?",
      options: ["Health facilities", "Pharmacies", "Online pharmacies such as Kasha Rwanda", "Youth centres", "All of these"],
      answer: "E. All of these",
      why: "Contraception is available at health facilities, pharmacies, online pharmacies, youth centres and some schools and shops.",
    },
    {
      q: "Which protect against HIV, other STIs and unwanted pregnancy?",
      options: ["Abstinence", "Correct condom use", "Contraceptive pills", "A and B", "All of these"],
      answer: "D. Abstinence and correct condom use",
      why: "Pills prevent pregnancy but not infections. A condom is used once, for one act of sex.",
    },
    {
      q: "How long is exclusive breastfeeding recommended, which can also act as natural contraception?",
      options: ["3 months", "6 months", "9 months", "12 months"],
      answer: "B. 6 months",
      why: "Give only breast milk until 6 months. You can get pregnant before periods return, because ovulation happens about 2 weeks before the first period.",
    },
  ]),

  // ---------- HIV & AIDS ----------
  article("hiv-aids", "What are HIV and AIDS?", [
    "HIV (human immunodeficiency virus) attacks the body's immune system, specifically white blood cells (CD4 cells) that fight infections. AIDS (acquired immunodeficiency syndrome) is the most advanced stage, when the immune system is too weak to fight off infections.",
    "Stages of HIV:\n1. Acute infection: in the first weeks, there is a lot of virus in the blood and people are very infectious. Many have flu-like symptoms. If you think you were exposed, get tested.\n2. Chronic infection: HIV keeps multiplying, often without symptoms, sometimes for 10 years or more. People can still pass it on. With treatment, many never reach stage 3.\n3. AIDS: serious infections and illnesses appear. Without treatment, people with AIDS typically survive about 3 years.",
    "HIV came from a virus in chimpanzees in Central Africa and probably passed to humans through contact with infected blood when they were hunted for meat.",
    "There is no cure or vaccine yet, but treatment lets people with HIV live long, healthy lives and protect their partners.",
  ], { refs: [REF.booklet], media: MEDIA.hivVideo }),
  article("hiv-aids", "How HIV is and isn't passed on", [
    "HIV is passed on through specific body fluids: blood, semen and pre-cum, vaginal fluids, rectal fluids and breast milk.",
    "Ways HIV is passed on:\n• unprotected vaginal or anal sex with someone who has HIV\n• sharing needles or sharp objects, or contact with infected blood\n• from mother to baby during pregnancy, birth or breastfeeding, which treatment can prevent",
    "HIV is NOT passed on through: mosquitoes or other insects, saliva, tears or sweat, hugging, shaking hands, sharing toilets, plates or food, closed-mouth kissing, touching, or the air.",
    "Rare routes: oral sex (higher risk with mouth sores or bleeding gums), unsterilised tattoo or piercing equipment, and in babies, food pre-chewed by someone with bleeding gums.",
    "You can't tell if someone has HIV by looking at them. In Rwanda's 2009 youth survey, 84% of young people knew a healthy-looking person can have HIV, but only 71% knew mosquitoes can't transmit it, and just 12% had full, correct knowledge about HIV. Testing is the only way to know.",
  ], { refs: [REF.booklet, REF.bss, REF.quiz] }),
  article("hiv-aids", "PrEP and PEP: medicines that prevent HIV", [
    "PrEP (pre-exposure prophylaxis) is medicine taken before possible exposure to HIV, for example by someone whose partner has HIV or whose status is unknown. It is safe; some people get diarrhoea, nausea, headache, tiredness or stomach upset at first, which usually pass.",
    "PEP (post-exposure prophylaxis) is an emergency medicine taken after a possible exposure: a condom broke, sex without a condom, sexual assault, or shared needles. It must start within 72 hours, and the sooner the better. It is taken daily for 28 days, followed by an HIV test.",
    "In Rwanda, PrEP and PEP are free at public health facilities. If you think you were exposed, go to the nearest health facility as soon as possible.",
    "Other ways to prevent HIV: abstinence, using a condom every time, having one faithful partner, testing with your partner, and voluntary medical male circumcision, which lowers but does not remove the risk.",
  ], { refs: [REF.booklet, REF.quiz], media: MEDIA.prepVideo }),
  article("hiv-aids", "HIV testing and treatment", [
    "Testing is the only way to know your HIV status. It is quick, confidential and available at health facilities. Every young person has the right to test voluntarily and keep the result private.",
    "In Rwanda's 2009 youth survey, 52% of young people had taken a voluntary HIV test in the past year, double the 26% in 2006, and 96% of them collected their results.",
    "If the result is positive, antiretroviral therapy (ART) controls the virus. It does not cure HIV, but it stops the virus from multiplying so the immune system can recover. People on effective treatment live long, healthy lives and, once the virus is undetectable, do not pass HIV on through sex.",
    "Take the medicine every day exactly as prescribed. Missing doses can be dangerous, so tell your health worker straight away if you have trouble.",
    "Kagabo tested positive after unprotected sex and went home thinking his life was over. With treatment and support, people like Kagabo can live full lives.",
  ], { refs: [REF.booklet, REF.bss, REF.quiz] }),
  quiz("hiv-aids", "Quiz: HIV", [
    {
      q: "HIV can be transmitted through any body fluid.",
      options: ["Yes", "No"],
      answer: "B. No",
      why: "Only blood, semen and pre-cum, vaginal fluid, rectal fluid and breast milk transmit HIV.",
    },
    {
      q: "Which is true? A person can get HIV through:",
      options: ["Touching", "Unprotected vaginal or anal sex with someone who has HIV", "Mosquito bites", "Saliva, tears or sweat", "Hugging, shaking hands or sharing plates"],
      answer: "B",
      why: "The others do not transmit HIV.",
    },
    {
      q: "Circumcision protects 100% against HIV and other STIs.",
      options: ["Yes", "No"],
      answer: "B. No",
      why: "It reduces the risk but does not remove it, so abstinence or condoms are still needed.",
    },
    {
      q: "What is PrEP for?",
      options: ["Treating people with HIV", "Reducing side effects of HIV medicine", "Preventing HIV before possible exposure", "Curing HIV"],
      answer: "C",
      why: "PrEP is taken before possible exposure to lower the chance of getting HIV.",
    },
    {
      q: "Where can you get PrEP and PEP in Rwanda?",
      options: ["Only by buying at pharmacies", "Only from private providers", "Free at any public health facility", "Only at specialised HIV clinics"],
      answer: "C",
      why: "If you think you were exposed, go to the nearest public health facility as soon as possible.",
    },
    {
      q: "Can HIV be cured?",
      options: ["Yes", "No"],
      answer: "B. No",
      why: "There is no cure yet, but treatment controls the virus and lets people live long, healthy lives.",
    },
  ]),

  // ---------- Sexually transmitted infections ----------
  article("stis", "Common STIs and their signs", [
    "Sexually transmitted infections (STIs) pass mainly through unprotected vaginal, anal or oral sex. Some also pass from mother to baby, or through infected blood.",
    "Most STIs have no symptoms. When they do, common signs are: discharge from the vagina or penis, sores or blisters on the genitals, pain when urinating, lower belly pain, pain during sex, itching, and bleeding between periods.",
    "Common STIs:\n• Gonorrhoea and chlamydia (bacteria): discharge and burning, often no symptoms in women. Untreated, they can cause infertility.\n• Syphilis (bacteria): a painless sore, later a rash and fever. Untreated, it can damage the heart, brain and other organs, and pass to an unborn baby.\n• Genital herpes (virus): painful sores that can come back. It cannot be cured, but can be treated.\n• Genital warts (HPV virus): growths on the genitals. Some HPV types cause cervical cancer.\n• Hepatitis B (virus): can cause long-term liver damage. A vaccine exists.\n• Trichomoniasis (parasite): frothy yellow-green discharge and itching.\n• Pubic lice and scabies (parasites): intense itching.\n• HIV.",
    "In Rwanda's 2009 youth survey, 90% of young people had heard of STIs, and 87% of those who had an STI went to a health facility for treatment.",
    "If you notice any of these signs, or had unprotected sex, go to a health facility for testing and treatment.",
  ], { refs: [REF.booklet, REF.bss, REF.quiz] }),
  article("stis", "Preventing STIs and getting tested", [
    "Ways to protect yourself:\n• Abstinence is the safest way.\n• Use a condom correctly every time, a new one for each act of sex.\n• Have one faithful partner. More partners means more risk.\n• Get tested, and talk with your partner about testing before having sex.\n• Voluntary medical male circumcision lowers the risk for men.",
    "Testing matters because most STIs have no symptoms but can still cause serious harm, such as infertility, and make it easier to get or pass on HIV.",
    "Treat STIs early at a health facility, finish all the medicine, and make sure your partner is treated too, so you don't pass the infection back and forth.",
  ], { media: MEDIA.stiVideo }),
  article("stis", "STI myths and facts", [
    "Myth: Apart from HIV, all STIs can be cured.\nFact: Herpes and some others can't be cured yet, but they can be treated.",
    "Myth: You can tell if someone has an STI.\nFact: Most STIs have no visible signs. Only testing can tell.",
    "Myth: You can catch an STI from a toilet seat, holding hands or dancing.\nFact: STIs spread through sexual contact, and some through blood or from mother to baby.",
    "Myth: Sex with a virgin, or having sex standing up, cures an STI.\nFact: Sex never cures an STI. Only proper medical treatment does, and these beliefs harm others.",
    "Myth: Contraceptive pills protect against STIs.\nFact: Only condoms and abstinence protect against STIs.",
    "Myth: Only certain groups get HIV.\nFact: Anyone exposed to HIV can get it.",
  ], { refs: [REF.booklet, REF.quiz] }),
  quiz("stis", "Quiz: STIs", [
    {
      q: "Which are common symptoms of STIs?",
      options: ["Vaginal or penile discharge", "Genital ulcers", "Lower belly pain", "All of these"],
      answer: "D. All of these",
      why: "Most STIs have no symptoms, so testing matters even when you feel fine.",
    },
    {
      q: "With proper treatment, all STIs except HIV can be cured.",
      options: ["Yes", "No"],
      answer: "B. No",
      why: "Genital herpes, for example, cannot be cured yet.",
    },
    {
      q: "Which of these is NOT a common STI?",
      options: ["Syphilis", "Chlamydia", "Gonorrhoea", "HIV", "Hepatitis B", "None of these"],
      answer: "F. None of these",
      why: "All of them can be transmitted sexually.",
    },
    {
      q: "If you are not abstaining, what is the recommended way to protect against STIs?",
      options: ["Having many partners", "Using a condom every time", "Natural contraception", "Avoiding testing"],
      answer: "B",
      why: "A new condom for every act of sex.",
    },
  ]),

  // ---------- Talking with parents ----------
  article("talking-with-parents", "Talking with your parents about sexual health", [
    "In Rwanda, parents have a duty to talk with their children about reproductive health (Law No 21/2016, article 14). Young people can also start the conversation.",
    "Home is the first and best place to learn. Talking openly can feel awkward at first, but research shows it helps young people know more and make healthier choices.",
    "One study found only about 3 in 10 adolescents had discussed two or more SRH topics with their parents. Common barriers: parents feel it is taboo, lack information or feel shy; young people fear being judged or prefer friends and the internet.",
    "Tips: choose a calm moment, start with a question (\"Can I ask you something about growing up?\"), use something you saw on TV or in this app to begin, and remember your parents want you to be safe. If talking with a parent is not possible, try a trusted relative, teacher, counsellor or health worker.",
    "Kamali paid his children's school fees and bought everything they needed, but never made time to talk with them about their changing bodies. When his eldest daughter became pregnant at 18, he realised that talking matters too.",
  ], { refs: [REF.booklet, REF.rhLaw, REF.quiz] }),
  article("talking-with-parents", "A guide for parents", [
    "Parents are their children's first sexuality educators. When parents talk in positive, honest ways, young people make healthier decisions.",
    "Children and adolescents need five things from the adults around them:\n• Affirmation: recognise and accept their stage of development.\n• Information: accurate facts, given in ways that suit their age.\n• Values: share your values and help them understand others they hear about.\n• Limits: clear, age-appropriate rules that keep them safe.\n• Guidance: help them handle risky situations and make good choices on their own.",
    "What every parent needs to know:\n1. You are your child's main sexuality educator.\n2. Be \"askable\": a good first answer is \"That's a good question.\"\n3. Make it clear that talking to you will never make things worse: \"I'm glad you told me.\"\n4. Children make mistakes, just as parents do. Turn mistakes into learning.\n5. Failure is an event, not a person. Children who feel loved are less likely to be exploited.",
    "Use the correct names for body parts, talk about periods, wet dreams and masturbation as normal, and explain that \"If you loved me, you'd have sex with me\" is always a line to manipulate.",
  ]),
  quiz("talking-with-parents", "Quiz: talking about sexuality", [
    {
      q: "What stops adolescents from talking with their parents about sexuality?",
      options: ["They think their parents would never understand", "They prefer information from media and friends", "They feel comfortable talking to their parents", "They already have correct information", "A and B"],
      answer: "E. A and B",
      why: "Taboo, lack of information and embarrassment on both sides make these conversations hard, which leaves room for misinformation.",
    },
  ]),

  // ---------- Planning your future ----------
  article("planning-future", "Setting goals for your future", [
    "A short-term goal can be reached in a day, a week or a month. A long-term goal takes months or years, such as finishing school or becoming a doctor.",
    "Goals give your life direction and purpose, make it more interesting and guide your decisions. Good goals are clear, have a time limit, are positive and realistic, and don't put you at risk.",
    "Big goals are reached step by step. Break a long-term goal into short-term goals, and check your progress.",
    "Your values help you choose a career: if helping people matters most to you, teaching, health or social work might suit you. Obstacles like few jobs, missing skills or lack of money for training can be overcome with planning and support.",
    "Bwiza, 13, wants to be a doctor. She studies with a friend who has the same dream, and they avoid anything that could take them off course. Choose friends who support your goals.",
  ], { media: MEDIA.rwandaSchool }),
  article("planning-future", "Becoming a parent too early", [
    "Parenting can be wonderful when people are ready for it. Whether, when and with whom to have children are some of the biggest decisions in life.",
    "Teenage parenthood brings many challenges:\n• Most teenagers are not emotionally ready for pregnancy or parenting.\n• Teenage pregnancies and deliveries have more complications.\n• Teen parents, especially girls, are less likely to finish school, and families are more likely to be poor.\n• Fathers are expected to support the child until adulthood.\n• Teen relationships often break up, and many young mothers raise children alone.\n• Children of teen parents tend to face more difficulties at school.",
    "Cyuzuzo, 14, had unprotected sex during the holidays and his girlfriend became pregnant. His father wished he had made time to talk with his children about sexual health.",
    "Waiting until you are ready gives you and your future children the best start.",
  ]),

  // ---------- Your rights & the law ----------
  article("rights-law", "Your sexual and reproductive health rights", [
    "Reproductive health means physical, mental and social wellbeing in everything related to the reproductive system. Rwanda's Law No 21/2016 on human reproductive health protects these rights.",
    "Your rights include:\n• equal rights to reproductive health for everyone\n• information and education about reproductive health, including comprehensive sexuality education at school\n• protection from anything harmful to your reproductive health, including child defilement\n• voluntary, confidential HIV testing\n• care and treatment if you live with HIV\n• protecting yourself and others from STIs\n• care for a pregnant teenager and her newborn\n• making your own reproductive health decisions once you are an adult\n• safety from all forms of violence, including gender-based violence and sexual harassment",
    "A pregnant student has the right to continue her education.",
    "Parents and guardians have a duty to talk with their children about reproductive health (article 14).",
  ], { refs: [REF.rhLaw, REF.booklet] }),
  article("rights-law", "Child defilement: what the law says", [
    "Under article 133 of Rwanda's penal code (Law No 68/2018), child defilement is any sexual act with a child under 18. This includes inserting a sexual organ or any body part into a child's sexual organ, mouth or anus, and any other act on a child's body for sexual pleasure.",
    "A child cannot legally consent to sex with an adult. Whether or not the child agreed, an adult who commits child defilement faces 20 to 25 years in prison, and life imprisonment if the child is under 14 or is left with an incurable illness.",
    "If two children aged 14 to 18 have sex without violence or threats, no penalty applies. A 14 to 18-year-old who commits defilement on a child under 14 is punished under the rules for children.",
    "Mutoni, 17, became pregnant by a 24-year-old neighbour who gave her gifts. Her parents accepted money to stay silent. But this was child defilement: a crime, and not something to be settled privately.",
    "If this has happened to you or someone you know, tell a trusted adult and contact Isange One Stop Centre or the police.",
  ], { refs: [REF.penal, REF.booklet] }),
  article("rights-law", "Comprehensive sexuality education at school", [
    "Comprehensive sexuality education (CSE) is a rights-based, gender-sensitive approach to learning about sexuality. In Rwanda it is taught in school subjects such as general studies and biology and health sciences.",
    "CSE goes beyond facts. It covers puberty, menstruation, relationships, sexual intercourse, prevention of pregnancy and infections, and helps young people build positive values about their sexual and reproductive health.",
    "It encourages abstinence for teenagers, which prevents unwanted pregnancy and infections and helps people plan for marriage when they are ready, while also giving accurate information on protection.",
    "Rukundo was surprised to study sexuality at his faith-based school, because his parents had told him it was only for adults about to marry. In fact, learning early helps young people make safe choices before they face them.",
  ]),
];

/** Myth checks shown to everyone in the Myths section. */
export const myths = [
  {
    language: "EN",
    mythText: "You can tell if someone has HIV by looking at them.",
    factText: "Most people living with HIV look and feel healthy, often for years. The only way to know someone's HIV status is an HIV test, which is free and confidential at health facilities.",
    sources: [REF.booklet, REF.bss],
  },
  {
    language: "EN",
    mythText: "Contraceptives make you infertile.",
    factText: "Modern contraceptives do not damage your reproductive organs or cause infertility. Fertility returns after you stop; after the injection it can take a few months longer.",
    sources: [REF.booklet, "WHO, Family planning/contraception methods fact sheet"],
  },
  {
    language: "EN",
    mythText: "Girls should not bathe or exercise during their period.",
    factText: "Bathing every day keeps you clean and prevents infections and bad smells, and exercise can even ease period cramps. Both are safe and healthy during your period.",
    sources: [REF.booklet, REF.quiz],
  },
  {
    language: "EN",
    mythText: "Using two condoms at once gives double protection.",
    factText: "Two condoms rub against each other and are more likely to tear. Use one condom correctly, and a new one every time you have sex.",
    sources: [REF.booklet],
  },
  {
    language: "EN",
    mythText: "You can't get pregnant if you have sex in water or jump up and down afterwards.",
    factText: "Water does not stop sperm, and jumping or washing after sex does not push sperm out. Pregnancy is possible whenever you have unprotected sex.",
    sources: [REF.booklet, REF.quiz],
  },
  {
    language: "EN",
    mythText: "You can catch a sexually transmitted infection from a toilet seat.",
    factText: "STIs pass through sexual contact, and some through blood or from mother to baby. The germs that cause them cannot survive on a toilet seat.",
    sources: [REF.booklet],
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
  {
    name: "Boys Talk",
    description: "A space for boys and young men to ask about puberty, health, relationships and growing up.",
    welcome: "Welcome to Boys Talk! Ask anything about your body, health or relationships. Respect each other and keep personal details private.",
  },
  {
    name: "Safe Online",
    description: "Share tips and ask questions about staying safe on social media, chats and dating apps.",
    welcome: "Welcome! If someone online is threatening you or asking for photos, you are not alone and it is not your fault. Tell a trusted adult and report it.",
  },
];
