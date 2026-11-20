// Extra sections added to each learning article (by title), and extra quiz questions (by quiz title).
// Based on the same sources as data.mjs. Reviewed content goes live with: npm run seed -- --learning --update --apply

/** Paragraphs added after an article's own paragraphs, before its references. */
export const MORE = {
  // ---------- Values & decision-making ----------
  "Your values guide your choices": [
    "Find your own values: think about the people you admire and why, what makes you proud of yourself, and what you would never want to do even if everyone else did. Write down your three most important values and keep them somewhere you will see them.",
    "Values can be tested by pressure from friends, a boyfriend or girlfriend, or the media. When you face a choice, ask yourself: \"Does this fit who I want to be? Will I feel proud of it tomorrow?\" If the answer is no, it is okay to say no, even if others are doing it.",
    "Your values can grow as you learn. Talking with parents, teachers and faith leaders you trust helps you understand where your values come from and decide which ones you want to keep.",
  ],
  "Making big decisions, including about sex": [
    "A simple way to decide:\n1. Name the decision you need to make.\n2. List your choices, including saying no or waiting.\n3. Think about what could happen with each choice, for you and for others.\n4. Check each choice against your values and goals.\n5. Choose, and act on your choice.\n6. Later, look back: was it a good decision? What did you learn?",
    "Decisions made in a hurry, when you are drunk, angry or under pressure, are the ones people regret most. If someone is pushing you to decide quickly, that is a sign to slow down. You can always say \"I need time to think.\"",
    "If you make a decision you regret, it does not define you. Talk to someone you trust, learn from it, and make a different choice next time. If there was a risk of pregnancy or HIV, go to a health facility quickly: emergency contraception and PEP work best when taken early.",
  ],

  // ---------- Gender & equality ----------
  "Sex, gender and stereotypes": [
    "Stereotypes are learned from family, culture, religion, school and the media. Notice them in songs, adverts and films: who is shown as strong, who cooks, who leads, who is shown only for their looks?",
    "Ways to challenge stereotypes: share housework equally at home, encourage friends of any sex to follow the subjects and careers they love, speak up kindly when someone says \"that's not for girls\" or \"boys don't cry\", and treat everyone with the same respect.",
    "Equality between women and men is good for families and for Rwanda's development. When girls and boys both get the chance to learn, work and lead, everyone benefits.",
  ],
  "Gender bias and discrimination": [
    "In Rwanda, girls and boys have the same right to education, and girls have the right to inherit property. A pregnant girl also has the right to continue her studies.",
    "If you see discrimination at school or at home, you can talk to a teacher, a school counsellor, a local leader or a trusted adult. Changing unfair habits starts with people noticing and speaking up.",
    "Boys can be allies: support girls' education, share tasks at home, respect girls' choices and stand against violence. Girls can be allies too, by supporting boys who show emotions or do work seen as \"for girls\".",
  ],

  // ---------- Gender-based violence & safety ----------
  "Understanding gender-based violence": [
    "Signs that someone may be experiencing violence: unexplained injuries, fear of going home or of a partner, sudden changes in mood or school results, being cut off from friends, or having no control over their own money or phone.",
    "If a friend tells you about violence: listen without judging, believe them, tell them it is not their fault, and help them reach a trusted adult, a health facility, Isange One Stop Centre or the police. Don't promise to keep a secret if they are in danger.",
    "Violence can cause injuries, infections, unwanted pregnancy, depression and fear that lasts a long time. Survivors deserve care and support, and help is available free of charge at Isange One Stop Centres in district hospitals.",
  ],
  "What to do after sexual violence": [
    "At the health facility, a health worker can: treat injuries, give PEP to prevent HIV, give emergency contraception to prevent pregnancy, test and treat STIs, and collect evidence if you choose to report. You can get medical care even if you are not ready to report.",
    "Feelings after an assault can include shock, fear, shame, anger or numbness. All of these are normal. Counselling at Isange One Stop Centres and health facilities can help you heal, at your own pace.",
    "If the person who hurt you is a family member or someone you live with, a trusted adult, local leader, Isange One Stop Centre or the police can help keep you safe.",
  ],

  // ---------- Puberty & adolescence ----------
  "The stages of adolescence": [
    "Adolescence is also a time of big changes in the brain. The part that controls emotions develops before the part that plans and judges risks, which is one reason teenagers can feel things strongly and act on impulse. Taking time before big decisions helps.",
    "Healthy habits help you through these years: eat a balanced diet, drink water, sleep 8 to 10 hours, stay active and avoid alcohol, tobacco and drugs.",
    "It is normal to want more independence and to spend more time with friends. Staying close to your family and a trusted adult still matters; they can help when things feel confusing.",
  ],
  "Body changes in girls and boys": [
    "Looking after your changing body:\n• Wash every day and wear clean underwear.\n• Use deodorant or wash under your arms if you sweat more.\n• Wash your face twice a day and avoid squeezing spots.\n• Girls: be ready for your period with a pad in your bag.\n• Boys: wet dreams are normal; simply wash and change in the morning.",
    "Everyone's body is different. Breast size, penis size, height and the age when changes start all vary a lot and are usually normal. Comparing yourself with others often causes worry for no reason.",
    "Talk to a parent, teacher or health worker if: puberty hasn't started by about 14, you have pain in your breasts or testicles, your periods haven't started by 16, or a change worries you.",
  ],

  // ---------- Know your body ----------
  "The male reproductive system": [
    "How sperm leave the body: sperm made in the testicles are stored in the epididymis. During ejaculation, they travel through the vas deferens, mix with fluid from the seminal vesicles and prostate to form semen, and leave through the urethra.",
    "Caring for your genitals: wash daily with water, including under the foreskin if you are not circumcised, wear clean underwear and protect your testicles during sport. Check your testicles once a month for lumps or swelling.",
    "See a health worker if you notice pain, swelling or a lump in a testicle, discharge from the penis, pain when urinating, or sores on the genitals.",
  ],
  "The female reproductive system": [
    "How the parts work together: each month an ovary releases an egg, which travels down a fallopian tube. If it meets sperm there, the fertilised egg moves to the uterus and can grow into a pregnancy. If not, the uterine lining is shed as a period.",
    "Normal vaginal discharge is clear or white, can change during the month and keeps the vagina clean and healthy. Discharge that is yellow, green, grey, frothy or bad-smelling, or comes with itching or pain, should be checked by a health worker.",
    "Caring for your genitals: wash the outside daily with water, wipe from front to back, wear clean cotton underwear and avoid putting soap or other products inside the vagina.",
  ],
  "When reproductive organs develop differently": [
    "Many of these conditions are found at birth or in early childhood during health checks, and some are treated with simple surgery. The earlier they are checked, the better the results usually are.",
    "Feeling different can be worrying. Remember that bodies vary a lot, and doctors are used to seeing all kinds of differences. Asking for help is the right step, and your health information is private.",
  ],

  // ---------- Periods ----------
  "How the menstrual cycle works": [
    "The days of a 28-day cycle, as an example:\n• Days 1 to 5: period (bleeding).\n• Days 6 to 13: a new egg grows and the uterine lining thickens.\n• Around day 14: ovulation.\n• Days 15 to 28: if there is no pregnancy, hormone levels fall and the next period starts.\nIn longer or shorter cycles, it is the days before ovulation that change.",
    "Signs before a period (premenstrual symptoms) can include sore breasts, bloating, tiredness, spots and mood changes. They are common and usually ease once bleeding starts.",
    "Being prepared helps: track your periods in a notebook or calendar, and keep a pad or cloth with you around the time your next period is due.",
  ],
  "Counting your cycle and fertile days": [
    "How to track: mark the first day of each period on a calendar. Count the days from one first day to the next; that is your cycle length. After six months, note your shortest and longest cycles.",
    "Tracking is useful for more than counting fertile days: it helps you prepare for your period, notice when it is late, and give a health worker clear information if something seems wrong.",
  ],
  "Menstrual hygiene": [
    "Making and caring for reusable cloth pads: use soft cotton cloth that absorbs well. After use, rinse in cold water, wash with soap, and dry completely in the sun, which helps kill germs. Store them in a clean, dry place and replace them when worn.",
    "Periods are normal and nothing to be ashamed of. Girls can go to school, play sport, bathe and do all their usual activities during their period. Teasing someone about periods is unkind; boys can help by being respectful.",
    "If you can't afford pads, ask at your school, health centre or youth centre, as many offer support.",
  ],
  "Period pain and when bleeding is not normal": [
    "Other things that can help: drinking water, eating regular meals, gentle stretching or walking, and a warm bath. Note how strong your pain is each month so you can tell a health worker if it changes.",
    "Get help straight away if period pain comes with fever, fainting, very heavy bleeding, or pain on one side of the belly, especially if your period is late. These can be signs of a problem that needs urgent care.",
  ],

  // ---------- Pregnancy ----------
  "How pregnancy happens": [
    "Early signs of pregnancy: a missed period, nausea or vomiting, sore breasts, tiredness and needing to urinate more often. Some people have no signs at first.",
    "A pregnancy test checks for a pregnancy hormone in urine. Tests are available at health centres and pharmacies and are most accurate from the day your period is late.",
    "If you think you might be pregnant, go to a health facility. Health workers can confirm it, talk through your options confidentially and help you stay healthy.",
  ],
  "Pregnancy myths and facts": [
    "Myth: You can't get pregnant if a boy hasn't reached puberty or a girl hasn't had her first period.\nFact: A girl can release her first egg before her first period, so pregnancy is possible even before periods start.",
    "Myth: Washing with soda, salt or herbs after sex prevents pregnancy.\nFact: These do not stop sperm and can irritate or harm the vagina.",
    "When you hear a pregnancy myth, check it with a health worker, a parent, a teacher or trusted information like this app.",
  ],
  "Staying healthy during pregnancy": [
    "The WHO recommends at least eight antenatal contacts during pregnancy, starting in the first 12 weeks. At these visits, health workers check the baby's growth, test for anaemia, HIV, syphilis and high blood pressure, and give vitamins and vaccines that protect mother and baby.",
    "Avoid alcohol, tobacco and drugs, and don't take medicines without asking a health worker.",
    "Plan for the birth: decide which health facility you will go to, how you will get there and who will come with you. Giving birth with a skilled health worker is the safest choice for mother and baby.",
  ],
  "Risks of pregnancy in the teenage years": [
    "Pregnant teenagers need extra support: from family, from the baby's father, from school and from health workers. Stigma and rejection make things harder and can push girls towards unsafe choices.",
    "Teenage boys who become fathers have responsibilities too, including supporting their child. Preventing pregnancy is the responsibility of both partners.",
  ],

  // ---------- Abortion & the law ----------
  "Abortion and the law in Rwanda": [
    "Self-induced abortion, or carrying out an abortion for someone outside these situations, is a crime in Rwanda. Herbs, pills from unknown sources or objects are dangerous and can kill.",
    "Health workers must keep what you tell them confidential. If you are unsure whether your situation is covered by the law, a health worker at a hospital can explain your options.",
  ],
  "Unsafe abortion and care after abortion": [
    "Miscarriage is common, especially early in pregnancy, and it is usually not caused by anything the woman did. Care after a miscarriage is the same as after an abortion: go to a health facility if you have heavy bleeding, fever or pain.",
    "Emotional support matters too. Sadness, relief, guilt or confusion are all normal after a pregnancy ends. Talking to a counsellor or someone you trust can help.",
  ],

  // ---------- Sexuality ----------
  "Understanding sexuality and intimacy": [
    "Sexuality is part of everyone's life, from birth to old age. It shows in how we dress, the friendships and relationships we form, and how we feel about our bodies, not only in sex.",
    "Signs of real intimacy: you can share your thoughts and feelings, you trust each other, you respect each other's limits, and you feel safe saying no.",
    "Asking \"How close do I want this person to be to me?\" is a better question than \"How far should I go?\". Emotional closeness should come first.",
  ],
  "Sexual feelings and how to handle them": [
    "Physical responses to arousal, such as an erection or vaginal wetness, are normal body reactions. They can happen without wanting sex, and they always pass on their own.",
    "Ways to redirect strong feelings: go for a walk or play sport, spend time with friends in group settings, focus on a hobby or your studies, and avoid being alone with a partner in private places if you have decided to wait.",
  ],
  "Myths about sex and sexuality": [
    "Myth: Having sex cures period pain.\nFact: Nothing cures period pain completely. Pain relievers, heat and exercise help.",
    "Myth: If a woman doesn't menstruate, she must be sick.\nFact: Missed periods can be caused by pregnancy, stress or hormonal changes, or simply not having reached the age of periods yet.",
  ],
  "Pornography and your wellbeing": [
    "If you have come across porn by accident, you have done nothing wrong. Close it, and talk to a trusted adult if it upset or confused you.",
    "If watching porn has become hard to stop: remove the content and apps from your phone, avoid being alone with your phone late at night, fill your time with activities you enjoy, and talk to a counsellor. Many people find it gets easier with support.",
    "Sharing sexual images of anyone under 18, including yourself, is illegal and can be used to blackmail you. Never send nude photos, and report anyone who asks you for them.",
  ],

  // ---------- Relationships ----------
  "Qualities of a good friend": [
    "Being a good friend yourself: check in on friends who seem down, celebrate their successes, keep your promises and say sorry when you are wrong.",
    "If a friendship is hurting you, it is okay to step back. You can talk honestly with your friend about what bothers you, spend more time with other friends, or ask a trusted adult for advice.",
    "Peer pressure is easier to resist with friends who share your values. Choose friends who respect your choices and help you reach your goals.",
  ],
  "Healthy love and relationships": [
    "Signs of a healthy relationship: you can talk openly, you respect each other's opinions and limits, you trust each other, you both have time for friends, family and school, and neither of you is afraid of the other.",
    "Ending a relationship is okay when it no longer feels right. Be honest and kind, choose a safe place, and talk to a trusted adult if you are afraid of how your partner will react.",
    "Relationships with a big age difference, or with someone who gives you gifts or money, carry extra risks of pressure and abuse. An adult who wants a sexual relationship with a child is committing a crime.",
  ],

  // ---------- Communication ----------
  "Communicating well": [
    "Practising an \"I\" statement: \"I feel ___ when ___ because ___. I would like ___.\" For example: \"I feel hurt when you share my secrets because I trusted you. I would like you to keep what I tell you private.\"",
    "Good communication also means choosing the right time and place. Difficult conversations go better when both people are calm and have time, rather than in the middle of an argument or in front of others.",
  ],
  "Being assertive and saying no": [
    "Ways to say no clearly:\n• Say it directly: \"No, I don't want to.\"\n• Repeat it calmly if pushed: \"I said no.\"\n• Give a reason if you want to: \"No, I've decided to wait.\"\n• Suggest something else: \"Let's go and watch the match instead.\"\n• Walk away if the person won't listen.",
    "Your body language should match your words: stand straight, look at the person and keep a steady voice. A real friend or partner will respect your answer.",
  ],

  // ---------- Contraception ----------
  "Why preventing teenage pregnancy matters": [
    "Prevention also works in other ways: staying in school, having clear goals, talking openly with parents, refusing gifts from people who expect sex in return, and knowing where to get contraception and advice.",
    "Communities can help too: parents who talk with their children, schools that teach comprehensive sexuality education, and youth-friendly health services where young people feel welcome.",
  ],
  "Contraceptive methods explained": [
    "Common side effects: hormonal methods can change periods (lighter, irregular or no periods), and some people get headaches or nausea at first. These usually settle. If a side effect bothers you, a health worker can help you switch to another method.",
    "Choosing a method: think about how often you want to think about it (daily pill, injection every 3 months, implant or IUD for years), whether you need protection from STIs, and any health conditions. A health worker can help you decide.",
  ],
  "How to use a condom": [
    "Store condoms in a cool, dry place, not in a wallet or a hot car for long periods, as heat and rubbing can damage them. Don't use a condom that is sticky, dry, torn or past its expiry date.",
    "Put the condom on before any genital contact, because pre-cum can contain sperm and infections can pass through skin contact.",
  ],
  "Emergency contraception": [
    "Common side effects of emergency pills include nausea, tiredness, headache and a change in the timing of your next period. If you vomit within 3 hours of taking the pill, take another dose.",
    "Your next period may come a few days early or late. If it is more than 7 days late, take a pregnancy test.",
  ],
  "Where to get contraception in Rwanda": [
    "What to expect at a health facility: a health worker will ask a few questions about your health, explain the methods and help you choose. You can ask any question; there are no silly questions.",
    "Many health centres have youth corners with staff trained to work with young people. Ask at your local health centre where yours is and when it is open.",
  ],

  // ---------- HIV & AIDS ----------
  "What are HIV and AIDS?": [
    "Early HIV infection can feel like flu: fever, sore throat, rash and tiredness, a few weeks after exposure. Many people have no symptoms at all, so testing is the only way to know.",
    "People living with HIV deserve respect. In Rwanda's 2009 youth survey, 75% of young people had accepting attitudes towards people living with HIV, up from earlier years. Stigma stops people from testing and getting care.",
  ],
  "How HIV is and isn't passed on": [
    "Things that increase the risk of HIV: having sex without a condom, having many partners, having another STI, sharing needles or razors, and alcohol or drug use that leads to risky choices.",
    "You can safely share food, plates, toilets, classrooms and sports with someone living with HIV, and care for them when they are sick.",
  ],
  "PrEP and PEP: medicines that prevent HIV": [
    "PrEP works best when taken every day as prescribed. It does not protect against other STIs or pregnancy, so condoms are still important.",
    "When you start PEP, the health worker will test you for HIV first, give you the medicine and plan follow-up tests. Finish all 28 days, even if you feel side effects; tell the health worker if they are hard to manage.",
  ],
  "HIV testing and treatment": [
    "What happens at an HIV test: a health worker explains the test, takes a small drop of blood from your finger, and gives you the result in about 20 minutes with counselling. If the result is positive, a confirmation test is done and you are linked to care.",
    "Couples can test together. Knowing each other's status helps you decide how to protect each other.",
    "Living well with HIV also means eating well, staying active, avoiding alcohol and tobacco, and treating other infections early.",
  ],

  // ---------- STIs ----------
  "Common STIs and their signs": [
    "Some STIs can be prevented with vaccines: the HPV vaccine (given free to girls in Rwanda) protects against the types of HPV that cause cervical cancer, and the hepatitis B vaccine protects against hepatitis B.",
    "Never treat an STI with medicine from a friend or an unknown seller. The wrong medicine may not work and can make infections harder to treat.",
  ],
  "Preventing STIs and getting tested": [
    "When to get tested: after unprotected sex, before starting a new relationship, if your partner has an STI, or if you notice any symptoms.",
    "STI tests are quick and confidential. Depending on the infection, they may use a urine sample, a swab or a small blood sample.",
  ],
  "STI myths and facts": [
    "Myth: Washing the genitals after sex prevents STIs.\nFact: Washing does not prevent STIs. Condoms and abstinence do.",
    "Myth: STIs always go away on their own.\nFact: Many STIs stay in the body and cause damage, such as infertility, if not treated.",
  ],

  // ---------- Talking with parents ----------
  "Talking with your parents about sexual health": [
    "Conversation starters:\n• \"At school we learned about puberty. Can I ask you something?\"\n• \"A friend told me something about periods. Is it true?\"\n• \"How did you learn about these things when you were my age?\"",
    "If your parent reacts with surprise or anger at first, give them time. Many parents were never taught how to have these conversations, and they may need a moment to respond calmly.",
  ],
  "A guide for parents": [
    "Start early and keep talking: short, regular conversations work better than one big talk. Use everyday moments, like a news story, a TV programme or a question your child asks.",
    "Listen more than you speak, stay calm, and thank your child for coming to you. If you don't know an answer, say so and find out together, for example at a health centre.",
  ],

  // ---------- Planning your future ----------
  "Setting goals for your future": [
    "Make goals SMART: Specific, Measurable, Achievable, Realistic and Time-bound. For example: \"I will study maths for 30 minutes every evening this term to raise my mark.\"",
    "Things that can take you off course include early pregnancy, alcohol and drugs, and friends who don't share your goals. Protecting your health protects your future.",
  ],
  "Becoming a parent too early": [
    "Things to think about before becoming a parent: Can I finish my education? Can I provide food, shelter, school fees and health care? Do I have a stable, supportive partner? Am I ready to put a child's needs before my own?",
    "If you are already a young parent, you are not alone. Health centres, schools and community organisations can help you care for your child and continue your education.",
  ],

  // ---------- Rights & the law ----------
  "Your sexual and reproductive health rights": [
    "Rights come with responsibilities: respecting other people's rights and bodies, protecting yourself and others from infections and unplanned pregnancy, and treating everyone without discrimination.",
    "If your rights are not respected, for example if you are refused information or services, or treated badly, you can speak to the head of the facility, a local leader or a trusted adult.",
  ],
  "Child defilement: what the law says": [
    "Signs a child may be being abused: fear of a certain person, unexplained gifts or money, changes in behaviour, pain or injuries in the genital area, or sexual knowledge unusual for their age.",
    "Reporting abuse protects the child and others. Families should never accept money to stay silent: the law treats child defilement as a serious crime, not a private matter.",
  ],
  "Comprehensive sexuality education at school": [
    "If you have a question you feel shy asking in class, you can write it down for your teacher, speak to the school nurse or counsellor, or ask at a youth corner.",
    "What you learn at school works best alongside conversations at home. Share what you learn with your parents and ask about your family's values.",
  ],
};

/** Questions added to existing quizzes (by quiz title). */
export const MORE_QUESTIONS = {
  "Quiz: consent and violence": [
    {
      q: "A friend tells you their partner hits them. What should you do?",
      options: ["Tell them it is their fault", "Keep it a secret no matter what", "Listen, believe them and help them reach a trusted adult or Isange One Stop Centre", "Tell everyone at school"],
      answer: "C",
      why: "Survivors need to be believed and supported, and helped to reach people who can keep them safe.",
    },
    {
      q: "Within how many hours should someone go to a health facility after sexual assault to get PEP?",
      options: ["72 hours", "1 week", "1 month", "There is no time limit"],
      answer: "A. 72 hours",
      why: "PEP must start within 72 hours to prevent HIV, and the sooner the better.",
    },
  ],
  "Quiz: puberty": [
    {
      q: "Which change happens in both boys and girls during puberty?",
      options: ["Breast development", "Voice deepening", "Hair growth under the arms and around the genitals", "First period"],
      answer: "C",
      why: "Hair growth, growth spurts, oily skin and stronger body odour happen in both.",
    },
  ],
  "Quiz: periods and fertile days": [
    {
      q: "How often should a disposable pad be changed?",
      options: ["Once a day", "At least every 6 hours, or sooner if full", "Every 2 days", "Only when it leaks"],
      answer: "B",
      why: "Changing regularly prevents infections and bad smells.",
    },
  ],
  "Quiz: pregnancy": [
    {
      q: "Which emotional complication can follow the physical and social problems of adolescent pregnancy?",
      options: ["Euphoria", "More self-confidence", "Depression and social isolation", "Better bonding with partners"],
      answer: "C",
      why: "Complications such as fistula, stigma and dropping out of school can lead to depression and isolation.",
    },
  ],
  "Quiz: abortion and the law": [
    {
      q: "Where should a pregnant person who is legally allowed an abortion go?",
      options: ["A traditional healer", "A licensed hospital or polyclinic with a doctor", "A friend with pills", "Anywhere, it doesn't matter"],
      answer: "B",
      why: "Abortion is only safe when done by a trained doctor in a properly equipped health facility.",
    },
  ],
  "Quiz: sexual health": [
    {
      q: "What is the most common cause of erectile dysfunction?",
      options: ["Poor blood flow", "Nerve damage", "Psychological factors such as depression or performance anxiety", "Medicines"],
      answer: "C",
      why: "It is most often psychological, although blood flow, nerve problems and some medicines can also cause it.",
    },
    {
      q: "What is the recommended first step in managing erectile dysfunction?",
      options: ["Quitting smoking and reducing alcohol", "Taking pills without seeing a health worker", "Surgery", "Going to hospital immediately"],
      answer: "A",
      why: "Lifestyle changes come first: stop smoking, cut down alcohol, eat well, exercise, sleep and reduce stress, and see a health worker.",
    },
    {
      q: "How can a couple increase their chances of conceiving?",
      options: ["Eating less and stopping exercise", "Avoiding medical check-ups", "Timing sex around ovulation and living healthily", "Buying medicines over the counter"],
      answer: "C",
      why: "Tracking the cycle and a healthy lifestyle help. A health worker can check both partners if pregnancy doesn't happen.",
    },
  ],
  "Quiz: preventing pregnancy": [
    {
      q: "Which is NOT a benefit of preventing teenage pregnancy?",
      options: [
        "Girls can continue their studies",
        "It prevents harmful health effects, including difficulties or death during delivery",
        "Boys avoid costs they shouldn't have at their age",
        "It stops adolescents from bearing costs and responsibilities they should have, such as caring for a newborn",
      ],
      answer: "D",
      why: "Adolescents should be supported to reach their goals, not take on child-rearing before they are ready.",
    },
  ],
  "Quiz: HIV": [
    {
      q: "What are possible side effects of PrEP?",
      options: ["Muscle pain and stiffness", "Memory loss", "Diarrhoea, nausea, headache, tiredness and stomach upset", "Sleep problems and thirst"],
      answer: "C",
      why: "These usually go away over time.",
    },
  ],
  "Quiz: STIs": [
    {
      q: "Can you catch an STI from a toilet seat?",
      options: ["Yes", "No"],
      answer: "B. No",
      why: "STIs pass through sexual contact, blood and from mother to baby. The germs can't survive on a toilet seat.",
    },
  ],
  "Quiz: talking about sexuality": [
    {
      q: "What is a good first response when a child asks a parent about sex?",
      options: ["\"You're too young\"", "\"That's a good question\"", "\"Ask your teacher\"", "Change the subject"],
      answer: "B",
      why: "Being \"askable\" keeps children coming back to their parents for honest information.",
    },
  ],
};
