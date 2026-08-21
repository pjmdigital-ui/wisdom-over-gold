const pptxgen = require("pptxgenjs");

const INK = "0F0E0C";
const GOLD = "D9B25F";
const GOLD_DIM = "9C7A34";
const CREAM = "ECE5D5";
const CREAM_MUTE = "9A9284";

const TITLE_FONT = "Cambria";
const BODY_FONT = "Calibri";

// Every script line below is quoted or accurately drawn from a specific,
// verified day in the manuscript. "YOUR STORY —" lines are the only
// exception: beats only Paul can supply, flagged rather than invented.

const SECTIONS = [
  {
    numeral: "I",
    label: "The Pursuit of Piety",
    sub: "Q1 — January",
    videos: [
      {
        title: "The Ache Underneath",
        source: "Day 7, January + Your List of Truths (front matter)",
        bullets: [
          "Ever feel a low ache under your ribs on a day when everything is actually going right?",
          "It hit one man on a lawn chair, mid-Sunday, with nothing actually wrong — kids in the sprinkler, a business that finally didn’t keep him up at night, good marriage, healthy kids. By every measure that mattered to him at twenty-five, he’d made it. And that same ache under his ribs showed up anyway. He almost felt guilty for it — but the ache wasn’t asking his permission.",
          "Psalm 42 names this exact thing, and it wasn’t written from a collapsed life: “As a hart longs for flowing streams, so longs my soul for thee, O God. My soul thirsts for God, for the living God.” Scholars place it in a season of real longing, not a life falling apart — the ache shows up whether or not anything around you is wrong.",
          "You can solve your marriage, your finances, your health, one at a time, completely — and the ache stays exactly where it was. It’s the God-shaped space every man carries. Good circumstances quiet the noise around it. They were never built to fill it. Only God fits there. It’s doing its job, pointing you somewhere the lawn chair was never going to reach.",
          "The next time you feel that ache in a good moment, not just a hard one — don’t reach for a distraction. Sit with it for sixty seconds and say, “God, I know this is You.”",
          "Then read something called a List of Truths: specific, provable things about your own life — what you’ve overcome, what you’ve stayed faithful to, what God has done for you. David built his courage the same way before Goliath, remembering the lion and the bear before he faced the giant. Write fifteen lines like it, and keep them where you’ll see them.",
        ],
      },
      {
        title: "What Are You Actually Seeking?",
        source: "Day 2, January + the book’s Daily Prayer",
        bullets: [
          "What’s the very first thing you reach for every morning, before you’ve even said good morning to your own family?",
          "For most guys it’s the phone — your hand already knows where it is before your feet hit the floor.",
          "The psalmist says it differently: “O God, thou art my God, I seek thee, my soul thirsts for thee.” Not “I’ll get to you once I’ve handled the inbox.” First.",
          "Whatever goes first sets the tone for everything after it. Every morning before I touch my phone, I say the same prayer, word for word: “Lord God Almighty, Father in Heaven, I give You thanks and praise... send Your Holy Spirit down upon me today... let everything I do please and glorify You.”",
          "Tonight, put your phone in another room, charging somewhere you can’t reach from bed. Tomorrow morning, before you touch it, say one sentence out loud that names what you actually want first: God, I want You before I want anything my phone can give me.",
        ],
      },
      {
        title: "The God of Your Own Life",
        source: "Day 1, January — St. Augustine",
        bullets: [
          "Have you ever hit the goal you were sure would finally make you feel like you’d arrived — and felt nothing?",
          "One man closed the deal he’d told himself would finally be enough, sat in his truck in the driveway, and waited to feel something. Nothing came.",
          "Jesus names the alternative in Matthew 6:33: “But seek first his kingdom and his righteousness, and all these things shall be yours as well.”",
          "Before Augustine was a saint, he chased status, pleasure, and approval with real intelligence and real hunger, certain each one would finally be enough. It never was. He wrote the line every man in that driveway half-knows: “Our heart is restless until it rests in You.”",
          "Write down, in one sentence, what you’re actually chasing right now — the thing you believe will finally make you feel like you’ve arrived. Underneath it, write the belief that’s actually true: I already belong to God. Nothing else has to make me arrive.",
        ],
      },
      {
        title: "Repentance Isn’t Just for Sinners",
        source: "Day 9, January",
        bullets: [
          "How long has it been since your last confession?",
          "One man hadn’t gone in eleven years. He’d built a quiet case for himself — he wasn’t robbing banks, he went to Mass most Sundays, by any reasonable measure, a decent man.",
          "John writes it plainly: “If we confess our sins, he is faithful and just, and will forgive our sins and cleanse us from all unrighteousness.” Read that again for the qualifier you’ve been adding on your own. There isn’t one.",
          "He went on a Thursday, at a parish where nobody knew his name. Nothing dramatic happened. Just a quiet man saying “I absolve you” — and walking out lighter than he had in years.",
          "Write one sentence and mean it: I don’t have to be bad enough. I only have to be honest. Then find the confession times at a parish near you, even one you’ve never been to, and go this week.",
        ],
      },
      {
        title: "The Comfort Trap",
        source: "Day 5, January",
        bullets: [
          "Have you ever told yourself “it’s just ten minutes” while the person who actually needed you was two rooms away?",
          "One man told himself that about the couch and the score, while his wife folded laundry two rooms away, waiting for five minutes of actual conversation.",
          "Nothing about that night is a crisis. That’s what makes it dangerous. A marriage doesn’t collapse over one night on the couch — it erodes over a thousand nights like it.",
          "St. Paul writes: “Set your minds on things that are above, not on things that are on earth.” He goes further: “Present your bodies as a living sacrifice, holy and acceptable to God, which is your spiritual worship.”",
          "Tonight, before you sit down, decide on purpose where the next hour goes. Say out loud: Comfort doesn’t get the vote tonight.",
        ],
      },
    ],
  },
  {
    numeral: "II",
    label: "The Pursuit of Protection",
    sub: "Q2 — May & June",
    videos: [
      {
        title: "Peter and John",
        source: "Day 8, June",
        bullets: [
          "Do you actually have a man who’d ask you the hard question — not “let’s grab coffee sometime,” but a standing time, every week?",
          "There’s one line in Acts that changes how you see this: “Now Peter and John were going up to the temple at the hour of prayer, the ninth hour.” Not Peter, alone, with John catching up separately. It was already their regular pattern.",
          "If any man in the early Church had earned the right to operate alone, it was Peter. Instead, he shows up to pray with a companion as a matter of course.",
          "Their friendship wasn’t built on being alike. It was built on showing up to the same hour of prayer, the same tomb, the same council room, again and again.",
          "Name your own version of a ninth-hour companion, and ask him today to join you for something concrete. Tell him plainly why: I wasn’t made to go up to the temple by myself, and I’d rather walk up with you.",
        ],
      },
      {
        title: "Paul’s Traveling Companions",
        source: "Day 10, June",
        bullets: [
          "Have you ever kept running something alone — a project, a program, a business — long after you actually needed help?",
          "One man ran his ministry’s whole outreach program alone. He started it that way, and alone became the only way he knew how to run it.",
          "St. Paul, chained in a Roman prison awaiting execution, still wrote asking for his companions by name: “Luke alone is with me. Get Mark and bring him with you; for he is very useful in serving me.”",
          "Even in his final letter, Paul was still asking for a companion. He never treated that as a confession of weakness.",
          "Write down the name of one person you’ve been doing a hard thing alone that you could actually ask to help. Say it plainly: needing someone here is how this kind of work has always gotten done. Then send the message.",
        ],
      },
      {
        title: "The Discipline of Staying Calm",
        source: "Day 20, May",
        bullets: [
          "What do you actually do in the ninety seconds before you have to walk into a room and handle something you’re dreading?",
          "One man got a stinging complaint email forwarded by his boss ninety seconds before he had to walk in and present bad numbers to eight people.",
          "He drew on a year of training himself to do uncomfortable things on purpose — hard mornings, intervals he didn’t feel like running.",
          "Scripture describes the kind of man he’s building toward: “master of himself, upright, holy, and self-controlled.” The body can be trained to do the hard, right thing before the mind feels ready to.",
          "The next time anger rises before you’ve had a chance to think it through: four counts in, six counts out, four rounds. Say it while you do it — my body can be trained, and so can this.",
        ],
      },
    ],
  },
  {
    numeral: "III",
    label: "The Pursuit of Provision",
    sub: "Q3 — July & August",
    videos: [
      {
        title: "Before the Fall, There Was Work",
        source: "Day 2, July — St. Joseph the Worker",
        bullets: [
          "Do you ever catch yourself thinking of your job as a sentence you’re serving until real life starts?",
          "One man had spent nine years mentally counting down to his pension, telling a younger coworker they were all just “doing time.”",
          "Genesis says God put the first man in the garden “to till it and keep it” — work was there before the fall. It was never the punishment.",
          "The Church didn’t set aside a feast for St. Joseph because he preached or performed miracles. He’s remembered for a workshop — wood, tools, ordinary labor. He never needed a countdown; the workshop was already holy ground.",
          "Notice the next thought that frames your work as a sentence to survive. Replace it out loud: Work is part of the good world God made, not my punishment to escape it. I’m meant to tend it, not flee it.",
        ],
      },
      {
        title: "Anxious About Money",
        source: "Day 12, August",
        bullets: [
          "Ever wake up at 2am and immediately open your banking app, even though nothing about the number has changed since yesterday?",
          "One man did that at 1:47 in the morning — the same three numbers he already knew by heart. He wasn’t really praying about it. He was rehearsing it.",
          "St. Paul wrote to a church that had actually kept him fed during hardship, and made a promise on God’s behalf: “My God will supply every need of yours according to his riches in glory in Christ Jesus.”",
          "That doesn’t excuse the work of the ledger in daylight. It just means he can do the honest work tomorrow with a clear head instead of the anxious work tonight with a tired one.",
          "The next time money-worry wakes you up at night, don’t reach for the banking app. Say Philippians 4:19 out loud instead — then write down the one concrete step you’ll take tomorrow, and let it wait for daylight.",
        ],
      },
      {
        title: "The Rich Fool",
        source: "Day 6, August",
        bullets: [
          "Is there a number in your head that you’ve quietly decided will finally make you feel secure?",
          "One man hit that number in his retirement account — tracked on a sticky note for years. His father’s only response, when he expected praise: “Just don’t let the number become the thing you’re actually trusting.”",
          "Jesus tells it straight in the parable of the rich fool: “Fool! This night your soul is required of you; and the things you have prepared, whose will they be?”",
          "St. John Vianney built real financial security through his parish — and kept almost none of it. He slept on a bare frame and gave the money away as it arrived.",
          "Name the number, real or imagined, you’ve been treating as the point where you’d finally feel secure. Say it out loud: my security is God, not this number. Then give something away this week that the old version of that sentence would never have allowed.",
        ],
      },
    ],
  },
  {
    numeral: "IV",
    label: "The Pursuit of Posterity",
    sub: "Q4 — October & November",
    videos: [
      {
        title: "The Anxious Search",
        source: "Day 6, November — St. Joseph",
        bullets: [
          "Has fear for your kid ever come out of your mouth as anger instead?",
          "One man lost track of his seven-year-old son for eleven minutes at a county fair — and could account for every single one of them. He found him fine, by the animal pens, absorbed in a goat. The first thing out of his mouth was anger, before any relief had a chance to surface.",
          "He’d always assumed a good father was mostly calm. Eleven minutes at a fairground showed him something else: the fear itself is what fatherhood costs.",
          "Mary’s words to the boy Jesus carry the strain of every parent who’s ever lost sight of a child: “Your father and I have been looking for you anxiously.” Joseph searched three days, with no angel and no dream to shorten the wait — and wasn’t spared the fear. He carried it, searched anyway, and kept moving toward his son until he found Him.",
          "Think of the last time real fear for your child caught you off guard. Name it to yourself honestly as love, not as a loss of control — and tell your child today, plainly, how much finding them matters to you.",
        ],
      },
      {
        title: "Sts. Louis and Zélie Martin",
        source: "Day 21, October",
        bullets: [
          "What do you actually think a truly great marriage looks like from the outside?",
          "Probably not this: decades of unglamorous, daily faithfulness. No drama. No headline.",
          "That’s the marriage of Sts. Louis and Zélie Martin — and out of it came a daughter the whole Church now calls a saint.",
          "Go back through your own marriage and pick the one area — fidelity, honest conversation, shared hardship, prayer — where you have the most ground left to cover. Take one specific action on it today, however small.",
        ],
      },
      {
        title: "The Glory of Sons",
        source: "Day 27, November",
        bullets: [
          "How many nights have you half-watched your kid do the same thing for the fifth time, phone in hand, waiting for “real life” to start later?",
          "One man did exactly that — his three-year-old daughter, the same lap across the bathtub, five times — and told himself the relationship really starts once she’s older.",
          "Scripture says: “Grandchildren are the crown of the aged, and the glory of sons is their fathers.” There’s no later version of the relationship waiting on the other side of the maintenance phase. This is the relationship.",
          "The five laps across the tub, watched or half-watched, are the material his daughter’s future sense of him gets made out of, one unremarkable night at a time.",
          "Put your phone in another room tonight — not on silent on the counter, actually in another room. Watch every single lap, and tell her specifically what you saw, not just that you saw it.",
        ],
      },
      {
        title: "A Covenant With His Eyes",
        source: "Day 16, October",
        bullets: [
          "Has a conversation ever drifted somewhere you told yourself was harmless — right up until it wasn’t?",
          "One man texted with someone on a client’s team for months before he noticed what it had turned into. He told himself: nothing’s actually happened, so nothing’s actually wrong.",
          "Job made a different kind of decision, one he named out loud in advance: “I have made a covenant with my eyes; how then could I look upon a virgin?” The decision gets made before temptation arrives, not after.",
          "He flew home and told his wife everything. She was hurt at first — and grateful, once it settled, that he’d told her before she found out some other way.",
          "Name one relationship, app, or habit that’s drifted somewhere it shouldn’t have, and make a covenant about it today — before the next test, not during it. Tell your wife what the covenant is and why you’re making it.",
        ],
      },
    ],
  },
];

const EVERGREEN = {
  label: "Evergreen · Founder Story",
  sub: "Any time, any platform",
  videos: [
    {
      title: "Why I Wrote This Book",
      source: "The book’s Introduction",
      bullets: [
        "Would you have believed twenty years ago that you’d end up writing a faith-based devotional?",
        "“If you’d asked me, I would have laughed in your face. I was cynical about religion for most of my life, and I was drawn instead to living on the edge.”",
        "YOUR STORY — pick up the introduction here, in your own words: prison, the years of searching, what finally cracked the cynicism open",
        "I wrote the book I wish had existed for me — 365 days, four pursuits: Piety, Protection, Provision, and Posterity.",
        "If any of this sounds like you, it’s linked below.",
      ],
    },
    {
      title: "A Note on These Stories",
      source: "The book’s front matter, read verbatim",
      bullets: [
        "Ever wonder how much of a devotional like this actually happened, and how much is illustration?",
        "There’s a page early in the book I want to read to you directly, because it matters.",
        "“The introduction you just read is my own story, told as accurately as I can tell it.”",
        "“The daily entries that follow are different. Most of the scenarios that open each day are illustrative — composites, built from the kinds of pressure I’ve faced, watched other men face, or can easily imagine a husband, father, and businessman facing. I don’t want you trusting a scenario as something that actually happened to me when it didn’t.”",
        "That’s the same standard every video in this series holds to — every quote and every story you’ve heard is real.",
      ],
    },
  ],
};

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.3 x 7.5

function addNumeralBadge(slide, x, y, numeral) {
  slide.addShape("ellipse", {
    x, y, w: 0.62, h: 0.62,
    fill: { color: GOLD },
    line: { type: "none" },
  });
  slide.addText(numeral, {
    x, y, w: 0.62, h: 0.62,
    align: "center", valign: "middle",
    fontFace: TITLE_FONT, bold: true, fontSize: 20,
    color: INK,
    margin: 0,
  });
}

// ---------- Title slide ----------
{
  const s = pres.addSlide();
  s.background = { color: INK };
  s.addText("ON-CAMERA SCRIPT", {
    x: 0.9, y: 2.55, w: 8, h: 0.4,
    fontFace: BODY_FONT, fontSize: 13, color: GOLD,
    charSpacing: 3, bold: true, margin: 0,
  });
  s.addText("Seek First — Video Scripts", {
    x: 0.85, y: 2.9, w: 11.5, h: 1.3,
    fontFace: TITLE_FONT, fontSize: 44, bold: true, color: CREAM,
    margin: 0,
  });
  s.addText("17 videos, four pursuits, one book. Every line is quoted or drawn straight from a specific, cited day in the manuscript — nothing invented. Gold italic lines are the few beats only you can tell.", {
    x: 0.9, y: 4.25, w: 10, h: 0.95,
    fontFace: BODY_FONT, fontSize: 15, color: CREAM_MUTE, italic: true,
    margin: 0,
  });
  s.addText("SEEK FIRST · THE FOUR PURSUITS OF THE MODERN CATHOLIC MAN", {
    x: 0.9, y: 6.85, w: 11, h: 0.35,
    fontFace: BODY_FONT, fontSize: 9.5, color: GOLD_DIM,
    charSpacing: 2, margin: 0,
  });
}

// ---------- Section divider ----------
function addDivider(section) {
  const s = pres.addSlide();
  s.background = { color: INK };
  addNumeralBadge(s, 0.9, 2.7, section.numeral);
  s.addText(section.label, {
    x: 0.85, y: 3.5, w: 11.5, h: 1,
    fontFace: TITLE_FONT, fontSize: 38, bold: true, color: CREAM,
    margin: 0,
  });
  s.addText(section.sub.toUpperCase(), {
    x: 0.9, y: 4.45, w: 9, h: 0.4,
    fontFace: BODY_FONT, fontSize: 12, color: GOLD, charSpacing: 2,
    margin: 0,
  });
}

function addEvergreenDivider(section) {
  const s = pres.addSlide();
  s.background = { color: INK };
  s.addShape("ellipse", {
    x: 0.9, y: 2.7, w: 0.62, h: 0.62,
    fill: { color: GOLD }, line: { type: "none" },
  });
  s.addText("+", {
    x: 0.9, y: 2.68, w: 0.62, h: 0.62,
    align: "center", valign: "middle",
    fontFace: TITLE_FONT, bold: true, fontSize: 24, color: INK, margin: 0,
  });
  s.addText(section.label, {
    x: 0.85, y: 3.5, w: 11.5, h: 1,
    fontFace: TITLE_FONT, fontSize: 38, bold: true, color: CREAM, margin: 0,
  });
  s.addText(section.sub.toUpperCase(), {
    x: 0.9, y: 4.45, w: 9, h: 0.4,
    fontFace: BODY_FONT, fontSize: 12, color: GOLD, charSpacing: 2, margin: 0,
  });
}

// ---------- Video (content) slide ----------
function addVideoSlide(section, video, idx, total) {
  const s = pres.addSlide();
  s.background = { color: INK };

  // pursuit tag row
  s.addShape("ellipse", {
    x: 0.7, y: 0.62, w: 0.34, h: 0.34,
    fill: { color: GOLD }, line: { type: "none" },
  });
  s.addText(section.numeral || "+", {
    x: 0.7, y: 0.6, w: 0.34, h: 0.34,
    align: "center", valign: "middle",
    fontFace: TITLE_FONT, bold: true, fontSize: 12, color: INK, margin: 0,
  });
  s.addText(section.label.toUpperCase() + `   ·   VIDEO ${idx} OF ${total}`, {
    x: 1.18, y: 0.6, w: 10.5, h: 0.4,
    fontFace: BODY_FONT, fontSize: 11, bold: true, color: GOLD, charSpacing: 1.2,
    valign: "middle", margin: 0,
  });

  // title + source citation
  s.addText(video.title, {
    x: 0.7, y: 1.1, w: 11.9, h: 0.75,
    fontFace: TITLE_FONT, fontSize: 24, bold: true, color: CREAM,
    valign: "top", margin: 0, lineSpacingMultiple: 1.06,
  });
  s.addText(video.source.toUpperCase(), {
    x: 0.7, y: 1.78, w: 11.9, h: 0.35,
    fontFace: BODY_FONT, fontSize: 10.5, color: GOLD_DIM, charSpacing: 1.5, italic: true,
    margin: 0,
  });

  // script lines — read verbatim, except "YOUR STORY —" lines
  const bulletY = 2.35;
  const items = video.bullets.map((b, i) => {
    const isPrompt = b.startsWith("YOUR STORY");
    const text = isPrompt ? b.replace(/^YOUR STORY\s*—\s*/, "") : b;
    return {
      text,
      options: {
        bullet: { code: isPrompt ? "25CF" : "2022", indent: 18 },
        color: isPrompt ? CREAM : GOLD,
        italic: isPrompt,
        fontSize: 14.5,
        fontFace: BODY_FONT,
        breakLine: i !== video.bullets.length - 1,
        paraSpaceAfter: 11,
      },
    };
  });
  s.addText(items, {
    x: 0.75, y: bulletY, w: 11.6, h: 7.5 - bulletY - 0.5,
    valign: "top", margin: 0,
  });

  const hasPrompt = video.bullets.some((b) => b.startsWith("YOUR STORY"));
  s.addText(
    hasPrompt
      ? "SEEK FIRST · READ VERBATIM, EXCEPT THE CREAM LINE — THAT ONE'S YOURS TO TELL"
      : "SEEK FIRST · READ VERBATIM — QUOTED DIRECTLY FROM THE BOOK",
    {
      x: 0.7, y: 7.05, w: 11.5, h: 0.3,
      fontFace: BODY_FONT, fontSize: 8.5, color: GOLD_DIM, charSpacing: 1.2, margin: 0,
    }
  );
}

SECTIONS.forEach((section) => {
  addDivider(section);
  section.videos.forEach((v, i) => addVideoSlide(section, v, i + 1, section.videos.length));
});

addEvergreenDivider(EVERGREEN);
EVERGREEN.videos.forEach((v, i) =>
  addVideoSlide({ numeral: "+", label: EVERGREEN.label }, v, i + 1, EVERGREEN.videos.length)
);

// ---------- Closing slide ----------
{
  const s = pres.addSlide();
  s.background = { color: INK };
  const totalVideos = SECTIONS.reduce((n, sec) => n + sec.videos.length, 0) + EVERGREEN.videos.length;
  s.addText(`${totalVideos} / ${totalVideos}`, {
    x: 0.9, y: 2.5, w: 8, h: 0.4,
    fontFace: BODY_FONT, fontSize: 13, color: GOLD, charSpacing: 3, bold: true, margin: 0,
  });
  s.addText("Pick one. Film it this week.", {
    x: 0.85, y: 2.85, w: 11.5, h: 1.2,
    fontFace: TITLE_FONT, fontSize: 40, bold: true, color: CREAM, margin: 0,
  });
  s.addText("Every quote, every story, every citation in this deck is pulled straight from Seek First — nothing paraphrased from memory, nothing invented. Read the gold lines as written. The cream lines are the only ones that need your own words.", {
    x: 0.9, y: 4.05, w: 10, h: 1.2,
    fontFace: BODY_FONT, fontSize: 15, color: CREAM_MUTE, italic: true, margin: 0,
  });
}

pres.writeFile({ fileName: "seek-first-video-scripts.pptx" }).then(() => {
  console.log("done");
});
