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
          "The real moment: praying daily, still feels like nothing’s landing",
          "Name the belief: “if it’s not producing a feeling, it’s not working”",
          "Reframe: disciplines are the track, not the engine",
          "Anchor: Psalm 42 — the ache itself is proof of life, not failure",
          "Close: pick one discipline to keep anyway, feeling or not",
        ],
      },
      {
        title: "The 5-minute morning prayer that actually sticks",
        bullets: [
          "Read the book’s own morning prayer on camera, word for word",
          "Why it’s the same words every day, on purpose — habit over novelty",
          "The trap: waiting to “feel like praying” before you pray",
          "The fix: say it before you open your phone, no exceptions",
          "Invite viewers to say it out loud with you",
        ],
      },
      {
        title: "St. Augustine was worse than you before he became a saint",
        bullets: [
          "Open with the mess — status, pleasure, years of chasing it",
          "The line that breaks it open: “our heart is restless until it rests in You”",
          "The turn: not less ambitious, just re-centered",
          "Land it on the viewer — what you’re chasing isn’t the enemy, it’s misplaced",
        ],
      },
      {
        title: "What it actually feels like walking back into confession after years away",
        bullets: [
          "Be specific about the dread — rehearsing what to say, almost turning around",
          "Name the belief that keeps men away: “I’ve been gone too long”",
          "Anchor: 1 John 1:9 — “he is faithful and just to forgive”",
          "The actual experience once inside: shorter, more ordinary than the dread",
          "Close with a direct challenge: go this week, not “someday”",
        ],
      },
      {
        title: "The real reason you numb out on your phone every night",
        bullets: [
          "Paint the scene: everyone asleep, still scrolling with nothing left to give",
          "Name it: not relaxation — numbing",
          "The belief underneath: “I’ve earned this, I need to shut my brain off”",
          "Reframe: rest restores you, numbing just delays the reckoning",
          "One concrete swap to try tonight instead of the scroll",
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
          "Open with the myth: “real men handle it alone”",
          "Sts. Peter and John went to the temple together as a matter of course",
          "Anchor: Ecclesiastes 4:9–10 — “woe to him who is alone when he falls”",
          "What this looks like in practice: a standing weekly time, not “let’s grab coffee sometime”",
          "Direct challenge: name one man to ask this week",
        ],
      },
      {
        title: "The struggle nobody brings up at church",
        bullets: [
          "Name it directly in the first ten seconds — no euphemisms, no shame",
          "Why silence makes it worse, not safer",
          "What actually breaks the cycle: prayer, fasting, a fraternity you’re answerable to",
          "Be clear: a battle, not a permanent identity",
          "One real first step: one honest conversation with one man, this week",
        ],
      },
      {
        title: "Why asking for help feels like weakness (and isn’t)",
        bullets: [
          "Open with the pattern: this is one of the most common blind spots for Catholic men",
          "The cost: “handling it alone” is usually just hiding it",
          "Reframe: the men who lead best knew they weren’t meant to carry it solo",
          "Make it practical — what asking for help actually sounds like out loud",
        ],
      },
      {
        title: "Doing one hard thing a day changed how I lead my family",
        bullets: [
          "Start with one small, concrete hard thing you actually did",
          "Connect it to Romans 12:1 — the body offered as spiritual worship",
          "The payoff isn’t the discomfort — it’s what discomfort trains in you",
          "Challenge: name one hard, physical thing to do today, no exceptions",
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
          "Open with a real decision — a purchase, a risk, a number that didn’t add up",
          "Name it: “if I don’t personally solve this, nothing gets solved”",
          "Anchor: Philippians 4:19 — “my God will supply every need of yours”",
          "Distinguish: doesn’t cancel the daily work — changes where the weight sits",
          "Close on the reframe they can say out loud",
        ],
      },
      {
        title: "St. Joseph the Worker and the dignity of an ordinary job",
        bullets: [
          "Open with the assumption most men carry: my job only matters if it’s impressive",
          "Turn to Joseph — a carpenter, not a king, chosen to raise Christ",
          "The point: unnoticed labor done well isn’t a consolation prize, it’s the assignment",
          "Bring it home: reframe one “unglamorous” part of your work as vocation",
        ],
      },
      {
        title: "How I stopped tying my worth to my bank account",
        bullets: [
          "Be specific — a number that used to define a good or bad day",
          "Name the trap: net worth quietly became self-worth",
          "What actually changed it — not a bigger number, a different center",
          "Marker of the shift: a recent decision that would’ve wrecked you a year ago, and doesn’t now",
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
          "Open with the honest gap — what you expected vs. what actually happened",
          "The myth to bust: that you’re supposed to already know how to do this",
          "One specific practice or piece of advice you’d give your former self",
          "Land on one sentence you’d want your kids to say about you someday",
        ],
      },
      {
        title: "Sts. Louis and Zélie Martin: the boring, beautiful marriage that raised a saint",
        bullets: [
          "Name what their marriage wasn’t — dramatic, easy, headline-worthy",
          "What it actually was: decades of unglamorous, daily faithfulness",
          "The payoff: their daughter became St. Thérèse of Lisieux",
          "Challenge: name one unglamorous, daily thing in your own marriage worth recommitting to",
        ],
      },
      {
        title: "What your kids will actually remember about you",
        bullets: [
          "Name the wrong assumption: the big trip, the big gift, the big moment",
          "What it’s actually made of: the ordinary, repeated moments — how you talk, whether you show up",
          "Make it concrete: ask viewers what they remember most about their own father",
          "Close with one small, doable action for this week",
        ],
      },
      {
        title: "Waiting on God when nothing is resolving — St. Joseph in the dark",
        bullets: [
          "Open with a real, current situation that isn’t resolving on schedule",
          "Turn to Joseph: no angel, no dream, three days of a father’s real terror",
          "Name the belief under most impatience: “if I can’t see it, nothing is happening”",
          "Reframe: faithfulness during the wait is the point, not a placeholder",
          "Close with what to actually do while you wait",
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
        "Tell the real origin story — briefly, honestly, in your own words",
        "Name the specific gap you didn’t find filled anywhere else",
        "What the book is actually built to do, day by day",
        "Invite people directly into it — the natural place for a clear call to action",
      ],
    },
    {
      title: "Rating my own excuses for skipping prayer this week",
      bullets: [
        "List your actual excuses from the past week, out loud, on camera",
        "Rate each one honestly — real obstacle, or avoidance dressed up",
        "Land on the pattern underneath most of them",
        "End with what you’re doing differently tomorrow morning",
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
  s.addText("CONTENT PLAN", {
    x: 0.9, y: 2.55, w: 8, h: 0.4,
    fontFace: BODY_FONT, fontSize: 13, color: GOLD_BRIGHT,
    charSpacing: 3, bold: true, margin: 0,
  });
  s.addText("Seek First — Video Outlines", {
    x: 0.85, y: 2.9, w: 11.5, h: 1.3,
    fontFace: TITLE_FONT, fontSize: 44, bold: true, color: CREAM,
    margin: 0,
  });
  s.addText("18 videos, four pursuits, one book — bullet points to elaborate from on camera, not a finished script.", {
    x: 0.9, y: 4.25, w: 9.5, h: 0.7,
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
    x: 0.7, y: 1.15, w: 11.9, h: 1.5,
    fontFace: TITLE_FONT, fontSize: 27, bold: true, color: PAPER_TEXT,
    valign: "top", margin: 0, lineSpacingMultiple: 1.08,
  });

  // bullets
  const bulletY = video.title.length > 62 ? 2.85 : 2.55;
  const items = video.bullets.map((b, i) => ({
    text: b,
    options: {
      bullet: { code: "2022", indent: 18 },
      color: PAPER_TEXT,
      fontSize: 16,
      fontFace: BODY_FONT,
      breakLine: i !== video.bullets.length - 1,
      paraSpaceAfter: 14,
    },
  }));
  s.addText(items, {
    x: 0.75, y: bulletY, w: 11.6, h: 7.5 - bulletY - 0.5,
    valign: "top", margin: 0,
  });

  s.addText("SEEK FIRST · CONTENT OUTLINE", {
    x: 0.7, y: 7.05, w: 6, h: 0.3,
    fontFace: BODY_FONT, fontSize: 8.5, color: PAPER_MUTE, charSpacing: 1.5, margin: 0,
  });
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
  s.addText("Every outline follows the book’s own shape: real moment, the belief underneath it, scripture as the reframe, one concrete close. Elaborate in your own voice — the bullets are a floor, not a script.", {
    x: 0.9, y: 4.05, w: 9.7, h: 1.1,
    fontFace: BODY_FONT, fontSize: 15, color: CREAM_MUTE, italic: true, margin: 0,
  });
}

pres.writeFile({ fileName: "seek-first-video-outlines.pptx" }).then(() => {
  console.log("done");
});
