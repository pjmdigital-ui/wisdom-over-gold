const pptxgen = require("pptxgenjs");

const INK = "0F0E0C";
const PAPER = "F4EFE3";
const PAPER_TEXT = "241F19";
const PAPER_MUTE = "6B6154";
const GOLD = "8A6A2B";
const GOLD_BRIGHT = "D9B25F";
const CREAM = "ECE5D5";
const CREAM_MUTE = "B9AE93";

const TITLE_FONT = "Cambria";
const BODY_FONT = "Calibri";

const SECTIONS = [
  {
    numeral: "I",
    label: "The Pursuit of Piety",
    sub: "Q1 — January–March",
    videos: [
      {
        title: "Why your prayer life feels dead even when you haven’t stopped praying",
        bullets: [
          "I still pray every day. I still go to Mass. And some weeks it feels like none of it is landing.",
          "For a long time I believed: if it’s not producing a feeling, it’s not working. That’s a lie.",
          "The discipline isn’t the engine of your spiritual life. It’s the track that keeps you moving toward God whether you feel anything or not.",
          "Psalm 42 says it plainly: “As a deer longs for flowing streams, so my soul longs for you, O God.” That ache isn’t proof it’s broken. It’s proof it’s still alive.",
          "So if it feels dead this week — don’t stop. Keep showing up anyway.",
        ],
      },
      {
        title: "The 5-minute morning prayer that actually sticks",
        bullets: [
          "Every morning, before I touch my phone, I say the same prayer, word for word.",
          "“Lord God Almighty, Father in Heaven, I give You thanks and praise. Thank You for opening my eyes to another day in this beautiful world You have created for me. I pray You send Your Holy Spirit down upon me today... let everything I do please and glorify You.”",
          "I say the same words on purpose. The habit is the point, not the novelty.",
          "Most guys wait to feel like praying before they pray. That’s backwards — pray first, and let the feeling catch up or not.",
          "Say it with me right now, out loud, wherever you’re watching this.",
        ],
      },
      {
        title: "St. Augustine was worse than you before he became a saint",
        bullets: [
          "Before Augustine was a saint, he spent years chasing status, chasing pleasure, chasing approval — and he was smart enough to actually get some of it.",
          "It was never enough. He said it himself: “Our heart is restless until it rests in You.”",
          "He didn’t get less ambitious when he converted. He got re-centered. Same fire, different target.",
          "So whatever you’re chasing right now — that’s not the problem. It’s just pointed at the wrong thing.",
        ],
      },
      {
        title: "What it actually feels like walking back into confession after years away",
        bullets: [
          "I rehearsed what I was going to say in the car. I almost turned around in the parking lot.",
          "The belief that kept me away for years was simple: I’ve been gone too long, this doesn’t apply to me anymore.",
          "1 John 1:9 says: “If we confess our sins, he is faithful and just to forgive us our sins.” Faithful. Not reluctant.",
          "Once I was actually inside, it was shorter and more ordinary than every version I’d dreaded in my head.",
          "If it’s been years for you — go this week. Not someday.",
        ],
      },
      {
        title: "The real reason you numb out on your phone every night",
        bullets: [
          "Kids are asleep, wife’s asleep, and I’m still scrolling an hour later with nothing left to give anybody.",
          "That’s not relaxation. That’s numbing.",
          "The belief underneath it: I’ve earned this, I need to shut my brain off.",
          "Rest actually restores you. Numbing just delays the bill to tomorrow.",
          "Tonight, swap the scroll for five minutes of actual silence and see what’s underneath the tiredness.",
        ],
      },
    ],
  },
  {
    numeral: "II",
    label: "The Pursuit of Protection",
    sub: "Q2 — April–June",
    videos: [
      {
        title: "Why every man needs a 6am accountability group",
        bullets: [
          "“Real men handle it alone” — that’s the line we all grew up on. It’s wrong.",
          "Peter and John went up to the temple to pray together as a matter of course. Not a crisis measure. Just their pattern.",
          "Ecclesiastes says it straight: “Woe to him who is alone when he falls, and has not another to lift him up.”",
          "This isn’t “let’s grab coffee sometime.” It’s a standing time, every week, with a man who’ll actually ask you the hard question.",
          "Name one man right now you could ask this week.",
        ],
      },
      {
        title: "The struggle nobody brings up at church",
        bullets: [
          "Let’s just say it — pornography, and the isolation that keeps a man stuck in it.",
          "Silence doesn’t make this safer. It makes it worse.",
          "What actually breaks the cycle isn’t willpower alone. It’s prayer, fasting, and a fraternity you’re actually answerable to.",
          "This is a battle you’re fighting, not who you are.",
          "Pick one man. Have one honest conversation this week.",
        ],
      },
      {
        title: "Why asking for help feels like weakness (and isn’t)",
        bullets: [
          "This is one of the most common blind spots I see in Catholic men — we’ll do almost anything before we ask for help.",
          "The version of you that “handles it alone” is usually just hiding it, not solving it.",
          "The men who actually lead well are the ones who figured out early they weren’t built to carry it solo.",
          "Here’s what asking for help actually sounds like: “I’m not okay, and I need you to know that.” That’s the whole move.",
        ],
      },
      {
        title: "Doing one hard thing a day changed how I lead my family",
        bullets: [
          "YOUR STORY — the specific hard, physical thing you did today",
          "Romans 12:1 calls this presenting your body as a living sacrifice — spiritual worship, not punishment.",
          "The point was never the discomfort itself. It’s what the discomfort trains in you for the day it actually matters.",
          "Pick one hard, physical thing to do today. No exceptions.",
        ],
      },
    ],
  },
  {
    numeral: "III",
    label: "The Pursuit of Provision",
    sub: "Q3 — July–September",
    videos: [
      {
        title: "The belief that’s quietly running your money decisions",
        bullets: [
          "YOUR STORY — the specific decision or number that didn’t add up",
          "Here’s the sentence running underneath most money stress: if I don’t personally solve this, nothing gets solved.",
          "Philippians 4:19 says: “My God will supply every need of yours according to his riches in glory in Christ Jesus.”",
          "That doesn’t cancel the daily work — the budget, the plan, all of it still matters. It just changes where the ultimate weight sits.",
          "Say it with me: my God will supply what I need. Not me alone.",
        ],
      },
      {
        title: "St. Joseph the Worker and the dignity of an ordinary job",
        bullets: [
          "Most of us think our job only matters if it’s impressive.",
          "Joseph was a carpenter. Not a king, not a priest — a tradesman. And God chose him to raise His own Son.",
          "Ordinary, unnoticed work done well isn’t a consolation prize. It’s the actual assignment.",
          "Name one unglamorous part of your job, and start calling it what it is — a vocation, not just a paycheck.",
        ],
      },
      {
        title: "How I stopped tying my worth to my bank account",
        bullets: [
          "YOUR STORY — the number that used to decide if you had a good day or a bad one",
          "My net worth had quietly become my self-worth.",
          "What changed wasn’t a bigger number. It was a different center.",
          "YOUR STORY — a recent decision that would’ve wrecked you a year ago, and doesn’t now",
        ],
      },
    ],
  },
  {
    numeral: "IV",
    label: "The Pursuit of Posterity",
    sub: "Q4 — October–December",
    videos: [
      {
        title: "What I wish someone told me before I became a father",
        bullets: [
          "Nobody tells you how big the gap is between what you expect fatherhood to feel like and what it actually is.",
          "The biggest myth I believed: that I was supposed to already know how to do this.",
          "YOUR STORY — one specific practice or piece of advice you’d give your former self",
          "If my kids only remember one sentence about me, I want it to be this one — [say it]",
        ],
      },
      {
        title: "Sts. Louis and Zélie Martin: the boring, beautiful marriage that raised a saint",
        bullets: [
          "Their marriage wasn’t dramatic. It wasn’t a headline. It was decades of unglamorous, daily faithfulness.",
          "And out of that ordinary marriage came St. Thérèse of Lisieux.",
          "Name one unglamorous, daily thing in your own marriage that’s actually worth recommitting to today.",
        ],
      },
      {
        title: "What your kids will actually remember about you",
        bullets: [
          "We assume it’s the big trip, the big gift, the one great vacation.",
          "It’s not. It’s how you talked to their mother. Whether you showed up. How you handled being wrong in front of them.",
          "Think about your own father right now — is your strongest memory of him the big moment, or a small one?",
          "Pick one small thing to do differently this week.",
        ],
      },
      {
        title: "Waiting on God when nothing is resolving — St. Joseph in the dark",
        bullets: [
          "YOUR STORY — the real, current situation that isn’t resolving on schedule",
          "Joseph didn’t get an angel or a dream for three straight days while he searched for his lost son. Just real fear, and he kept moving.",
          "The belief under most impatience is: if I can’t see the resolution, nothing is happening.",
          "But the waiting itself, the faithfulness during it — that’s not a placeholder before the real moment. That is the real moment.",
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
      title: "Why I wrote a 365-day devotional for men like me",
      bullets: [
        "I was cynical about religion for most of my life.",
        "I wrote the book I wish had existed for me — 365 days, four pursuits: Piety, Protection, Provision, and Posterity.",
        "It’s built the same way every single day: a real scenario, the belief driving it, scripture as the reframe, and one concrete thing to actually do.",
        "If any of this sounds like you, it’s linked below.",
      ],
    },
    {
      title: "Rating my own excuses for skipping prayer this week",
      bullets: [
        "YOUR STORY — list your actual excuses from this past week, out loud",
        "Rate each one honestly: real obstacle, or just avoidance wearing a costume?",
        "YOUR STORY — the pattern you noticed underneath most of them",
        "Tomorrow morning, here’s what I’m doing differently — [say it]",
      ],
    },
  ],
};

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.3 x 7.5
const PAGE_W = 13.33;

function addNumeralBadge(slide, x, y, numeral, dark) {
  slide.addShape("ellipse", {
    x, y, w: 0.62, h: 0.62,
    fill: { color: dark ? GOLD_BRIGHT : GOLD },
    line: { type: "none" },
  });
  slide.addText(numeral, {
    x, y, w: 0.62, h: 0.62,
    align: "center", valign: "middle",
    fontFace: TITLE_FONT, bold: true, fontSize: 20,
    color: dark ? INK : PAPER,
    margin: 0,
  });
}

// ---------- Title slide ----------
{
  const s = pres.addSlide();
  s.background = { color: INK };
  s.addText("ON-CAMERA SCRIPT", {
    x: 0.9, y: 2.55, w: 8, h: 0.4,
    fontFace: BODY_FONT, fontSize: 13, color: GOLD_BRIGHT,
    charSpacing: 3, bold: true, margin: 0,
  });
  s.addText("Seek First — Video Scripts", {
    x: 0.85, y: 2.9, w: 11.5, h: 1.3,
    fontFace: TITLE_FONT, fontSize: 44, bold: true, color: CREAM,
    margin: 0,
  });
  s.addText("18 videos, four pursuits, one book. Every line is written to be read out loud, exactly as it appears — except the gold italic lines, which are yours to tell.", {
    x: 0.9, y: 4.25, w: 9.7, h: 0.9,
    fontFace: BODY_FONT, fontSize: 15, color: CREAM_MUTE, italic: true,
    margin: 0,
  });
  s.addText("SEEK FIRST · THE FOUR PURSUITS OF THE MODERN CATHOLIC MAN", {
    x: 0.9, y: 6.85, w: 11, h: 0.35,
    fontFace: BODY_FONT, fontSize: 9.5, color: PAPER_MUTE === PAPER_MUTE ? "8A806E" : "8A806E",
    charSpacing: 2, margin: 0,
  });
}

// ---------- Section divider + content slides ----------
function addDivider(section) {
  const s = pres.addSlide();
  s.background = { color: INK };
  addNumeralBadge(s, 0.9, 2.7, section.numeral, true);
  s.addText(section.label, {
    x: 0.85, y: 3.5, w: 11.5, h: 1,
    fontFace: TITLE_FONT, fontSize: 38, bold: true, color: CREAM,
    margin: 0,
  });
  s.addText(section.sub.toUpperCase(), {
    x: 0.9, y: 4.45, w: 9, h: 0.4,
    fontFace: BODY_FONT, fontSize: 12, color: GOLD_BRIGHT, charSpacing: 2,
    margin: 0,
  });
}

function addEvergreenDivider(section) {
  const s = pres.addSlide();
  s.background = { color: INK };
  s.addShape("ellipse", {
    x: 0.9, y: 2.7, w: 0.62, h: 0.62,
    fill: { color: GOLD_BRIGHT }, line: { type: "none" },
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
    fontFace: BODY_FONT, fontSize: 12, color: GOLD_BRIGHT, charSpacing: 2, margin: 0,
  });
}

function addVideoSlide(section, video, idx, total) {
  const s = pres.addSlide();
  s.background = { color: PAPER };

  // pursuit tag row
  s.addShape("ellipse", {
    x: 0.7, y: 0.62, w: 0.34, h: 0.34,
    fill: { color: GOLD }, line: { type: "none" },
  });
  s.addText(section.numeral || "+", {
    x: 0.7, y: 0.6, w: 0.34, h: 0.34,
    align: "center", valign: "middle",
    fontFace: TITLE_FONT, bold: true, fontSize: 12, color: PAPER, margin: 0,
  });
  s.addText(section.label.toUpperCase() + `   ·   VIDEO ${idx} OF ${total}`, {
    x: 1.18, y: 0.6, w: 10.5, h: 0.4,
    fontFace: BODY_FONT, fontSize: 11, bold: true, color: GOLD, charSpacing: 1.2,
    valign: "middle", margin: 0,
  });

  // title
  s.addText(video.title, {
    x: 0.7, y: 1.1, w: 11.9, h: 1.2,
    fontFace: TITLE_FONT, fontSize: 24, bold: true, color: PAPER_TEXT,
    valign: "top", margin: 0, lineSpacingMultiple: 1.06,
  });

  // script lines — read verbatim, except "YOUR STORY —" lines, which are cues to fill in live
  const bulletY = video.title.length > 70 ? 2.55 : 2.25;
  const items = video.bullets.map((b, i) => {
    const isPrompt = b.startsWith("YOUR STORY");
    const text = isPrompt ? b.replace(/^YOUR STORY\s*—\s*/, "") : b;
    return {
      text,
      options: {
        bullet: { code: isPrompt ? "25CF" : "2022", indent: 18 },
        color: isPrompt ? GOLD : PAPER_TEXT,
        italic: isPrompt,
        fontSize: 15,
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
      ? "SEEK FIRST · READ VERBATIM, EXCEPT THE GOLD LINE — THAT ONE'S YOURS TO TELL"
      : "SEEK FIRST · READ VERBATIM",
    {
      x: 0.7, y: 7.05, w: 11, h: 0.3,
      fontFace: BODY_FONT, fontSize: 8.5, color: PAPER_MUTE, charSpacing: 1.2, margin: 0,
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
  s.addText("18 / 18", {
    x: 0.9, y: 2.5, w: 8, h: 0.4,
    fontFace: BODY_FONT, fontSize: 13, color: GOLD_BRIGHT, charSpacing: 3, bold: true, margin: 0,
  });
  s.addText("Pick one. Film it this week.", {
    x: 0.85, y: 2.85, w: 11.5, h: 1.2,
    fontFace: TITLE_FONT, fontSize: 40, bold: true, color: CREAM, margin: 0,
  });
  s.addText("Read the dark lines straight off the slide. The gold italic lines are the only ones that need your own words in the moment.", {
    x: 0.9, y: 4.05, w: 9.7, h: 1.1,
    fontFace: BODY_FONT, fontSize: 15, color: CREAM_MUTE, italic: true, margin: 0,
  });
}

pres.writeFile({ fileName: "seek-first-video-outlines.pptx" }).then(() => {
  console.log("done");
});
