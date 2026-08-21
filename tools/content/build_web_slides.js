const fs = require("fs");
const path = require("path");

// Same verified, book-only content as the pptx deck, restructured as
// {headline, body} slide pairs for the influenceacademy teleprompter format.
// Every video opens on a direct question/experience hook to the viewer,
// not a book reference — the source citation lives quietly in the footer
// "kw" tag instead of being announced mid-script.

const VIDEOS = [
  {
    slug: "sf_01_the_ache_underneath",
    title: "The Ache That Survives Every Fix (Even When Life Is Actually Good) — Seek First",
    kw: "PIETY · DAY 7",
    slides: [
      { headline: "Ever feel a low ache under your ribs on a day when everything is actually going right?", body: "Ever feel a low ache under your ribs on a day when everything is actually going right?" },
      { headline: "It hit one man on a lawn chair, mid-Sunday, with nothing actually wrong.", body: "Kids in the sprinkler. A business that finally didn’t keep him up at night. Good marriage, healthy kids — by every measure that mattered to him at twenty-five, he’d made it. And that same low ache under his ribs showed up anyway." },
      { headline: "He almost felt guilty for feeling it.", body: "What right did he have to feel unsettled with a life that good? But the ache wasn’t asking his permission — it had been there through the hard years and the good years alike, no matter how things were going." },
      { headline: "The psalmist felt this exact thing, and he wasn’t writing from a collapsed life.", body: "Psalm 42 reaches for thirst, a bodily need: “As a hart longs for flowing streams, so longs my soul for thee, O God. My soul thirsts for God, for the living God.” Scholars place it in a season of real distance, real longing — not a life falling apart. The ache shows up whether or not anything around you is wrong." },
      { headline: "You can fix your whole life and it stays exactly where it was.", body: "Marriage, finances, health — solve them one at a time, completely, and the ache doesn’t move. It’s the God-shaped space every man carries, rich or broke, thriving or barely holding on. Good circumstances quiet the noise around it. They were never built to fill it." },
      { headline: "The ache is doing its job.", body: "That Sunday afternoon was an invitation, arriving in the one moment he had nothing left to distract himself with — pointing him somewhere the sprinkler and the lawn chair were never going to be able to reach." },
      { headline: "Here’s what to do with it.", body: "The next time you feel that ache in a good moment, not just a hard one — don’t reach for a distraction. Sit with it for sixty seconds and say out loud, “God, I know this is You.”" },
      { headline: "Then read something called a List of Truths.", body: "It’s specific, provable things about your own life — what you’ve overcome, what you’ve stayed faithful to, what God has done for you. David built his courage the same way before Goliath, remembering the lion and the bear before he faced the giant. Write fifteen lines like it, and keep them where you’ll see them." },
      { headline: "The ache was never really about what’s missing.", body: "Read your list slowly the next time it shows up. It won’t fix what’s wrong — it’ll remind you what’s already true." },
    ],
  },
  {
    slug: "sf_02_what_are_you_seeking",
    title: "The First Reach of the Day Is a Confession — Seek First",
    kw: "PIETY · DAY 2 + DAILY PRAYER",
    slides: [
      { headline: "What’s the first thing you reach for every morning?", body: "What’s the very first thing you reach for every morning, before you’ve even said good morning to your own family?" },
      { headline: "Your hand knows where the phone is before your feet hit the floor.", body: "For most guys it’s the phone — your hand already knows where it is before your feet hit the floor." },
      { headline: "The psalmist puts God first, literally first.", body: "The psalmist says it differently: “O God, thou art my God, I seek thee, my soul thirsts for thee.” Not “I’ll get to you once I’ve handled the inbox.” First." },
      { headline: "Whatever goes first sets the tone for everything after.", body: "Whatever goes first sets the tone for everything after it. Every morning before I touch my phone, I say the same prayer, word for word: “Lord God Almighty, Father in Heaven, I give You thanks and praise... send Your Holy Spirit down upon me today... let everything I do please and glorify You.”" },
      { headline: "Try this tonight.", body: "Tonight, put your phone in another room, charging somewhere you can’t reach from bed." },
      { headline: "Say this the moment you wake up.", body: "Tomorrow morning, before you touch it, say one sentence out loud that names what you actually want first: God, I want You before I want anything my phone can give me." },
    ],
  },
  {
    slug: "sf_03_god_of_your_own_life",
    title: "He Closed the Deal and Felt Nothing — Seek First",
    kw: "PIETY · DAY 1 · ST. AUGUSTINE",
    slides: [
      { headline: "Have you ever hit the goal that was supposed to fix everything — and felt nothing?", body: "Have you ever hit the goal you were sure would finally make you feel like you’d arrived — and felt nothing?" },
      { headline: "One man closed the deal and waited to feel something.", body: "One man closed the deal he’d told himself would finally be enough, sat in his truck in the driveway, and waited to feel something. Nothing came." },
      { headline: "Jesus names the actual order that matters.", body: "Jesus names the alternative in Matthew 6:33: “But seek first his kingdom and his righteousness, and all these things shall be yours as well.”" },
      { headline: "Augustine chased everything you’re chasing right now.", body: "Before Augustine was a saint, he chased status, pleasure, and approval with real intelligence and real hunger, certain each one would finally be enough. It never was." },
      { headline: "He wrote the line every man in that driveway half-knows.", body: "He wrote what every man in that driveway already half-knows: “Our heart is restless until it rests in You.”" },
      { headline: "Name what you’re actually chasing.", body: "Write down, in one sentence, what you’re actually chasing right now — the thing you believe will finally make you feel like you’ve arrived." },
      { headline: "Then write the belief that’s actually true.", body: "Underneath it, write the belief that’s actually true: I already belong to God. Nothing else has to make me arrive." },
    ],
  },
  {
    slug: "sf_04_repentance_isnt_just_for_sinners",
    title: "Eleven Years Since His Last Confession — Seek First",
    kw: "PIETY · DAY 9",
    slides: [
      { headline: "How long has it been since your last confession?", body: "How long has it been since your last confession?" },
      { headline: "One man hadn’t gone in eleven years.", body: "One man hadn’t gone in eleven years. He’d built a quiet case for himself — he wasn’t robbing banks, he went to Mass most Sundays, by any reasonable measure, a decent man." },
      { headline: "John doesn’t attach a qualifier.", body: "John writes it plainly: “If we confess our sins, he is faithful and just, and will forgive our sins and cleanse us from all unrighteousness.”" },
      { headline: "There’s no threshold you have to cross first.", body: "Read that again for the qualifier you’ve been adding on your own. There isn’t one. Not “if we’ve hit bottom.” If we confess." },
      { headline: "Nothing dramatic happened. That was the point.", body: "He went on a Thursday, at a parish where nobody knew his name. Nothing dramatic happened. Just a quiet man saying “I absolve you” — and walking out lighter than he had in years." },
      { headline: "Write this sentence and mean it.", body: "I don’t have to be bad enough. I only have to be honest." },
      { headline: "Go this week.", body: "Find the confession times at a parish near you, even one you’ve never been to, and go this week." },
    ],
  },
  {
    slug: "sf_05_the_comfort_trap",
    title: "“It’s Just Ten Minutes” Is How Marriages Actually Erode — Seek First",
    kw: "PIETY · DAY 5",
    slides: [
      { headline: "Have you ever said “it’s just ten minutes” while someone who needed you waited?", body: "Have you ever told yourself “it’s just ten minutes” while the person who actually needed you was two rooms away?" },
      { headline: "One man told himself that about the couch and the score.", body: "One man told himself that about the couch and the score, while his wife folded laundry two rooms away, waiting for five minutes of actual conversation." },
      { headline: "Marriages don’t collapse. They erode.", body: "Nothing about that night is a crisis. That’s what makes it dangerous. A marriage doesn’t collapse over one night on the couch — it erodes over a thousand nights like it." },
      { headline: "Paul names where the mind defaults to.", body: "St. Paul writes: “Set your minds on things that are above, not on things that are on earth.”" },
      { headline: "Your body doesn’t get an exemption.", body: "He goes further: “Present your bodies as a living sacrifice, holy and acceptable to God, which is your spiritual worship.” Choosing the hard thing with your body is an offering, not a hobby." },
      { headline: "Decide on purpose, before you sit down.", body: "Tonight, before you sit down, decide on purpose where the next hour goes. Say out loud: Comfort doesn’t get the vote tonight." },
    ],
  },
  {
    slug: "sf_06_peter_and_john",
    title: "Even Peter Didn’t Walk In Alone — Seek First",
    kw: "PROTECTION · DAY 8, JUNE",
    slides: [
      { headline: "Do you actually have a man who’d ask you the hard question?", body: "Do you actually have a man who’d ask you the hard question — not “let’s grab coffee sometime,” but a standing time, every week?" },
      { headline: "One line from Acts changes how you see accountability.", body: "There’s one line in Acts that changes how you see this: “Now Peter and John were going up to the temple at the hour of prayer, the ninth hour.” It was already their regular pattern." },
      { headline: "The man who’d earned the right to go alone didn’t.", body: "If any man in the early Church had earned the right to operate alone, it was Peter. Instead, he shows up to pray with a companion as a matter of course." },
      { headline: "Their friendship wasn’t built on being alike.", body: "Their friendship wasn’t built on being alike. It was built on showing up to the same hour of prayer, the same tomb, the same council room, again and again." },
      { headline: "Name your ninth-hour companion.", body: "Name your own version of a ninth-hour companion, and ask him today to join you for something concrete — a weekly holy hour, a morning walk, a standing call." },
      { headline: "Tell him plainly why.", body: "I wasn’t made to go up to the temple by myself, and I’d rather walk up with you." },
    ],
  },
  {
    slug: "sf_07_pauls_traveling_companions",
    title: "Chained in a Roman Prison, He Still Asked for Help — Seek First",
    kw: "PROTECTION · DAY 10, JUNE",
    slides: [
      { headline: "Have you ever kept running something alone, long after you needed help?", body: "Have you ever kept running something alone — a project, a program, a business — long after you actually needed help?" },
      { headline: "He built the whole program himself. Then never let anyone else in.", body: "One man ran his ministry’s whole outreach program alone. He started it that way, and alone became the only way he knew how to run it." },
      { headline: "Paul asked for his companions by name, from a cell awaiting execution.", body: "St. Paul, chained in a Roman prison awaiting execution, still wrote asking for his companions by name: “Luke alone is with me. Get Mark and bring him with you; for he is very useful in serving me.”" },
      { headline: "He never treated it as a confession of weakness.", body: "Even in his final letter, Paul was still asking for a companion. He never treated that as a confession of weakness." },
      { headline: "Name the person you’ve been carrying it alone from.", body: "Write down the name of one person you’ve been doing a hard thing alone that you could actually ask to help." },
      { headline: "Send the message.", body: "Say it plainly: needing someone here is how this kind of work has always gotten done. Then send the message." },
    ],
  },
  {
    slug: "sf_08_discipline_of_staying_calm",
    title: "Ninety Seconds to Steady Himself Before Walking Into That Room — Seek First",
    kw: "PROTECTION · DAY 20, MAY",
    slides: [
      { headline: "What do you do in the ninety seconds before you have to face something you’re dreading?", body: "What do you actually do in the ninety seconds before you have to walk into a room and handle something you’re dreading?" },
      { headline: "A stinging email, ninety seconds before he had to walk in.", body: "One man got a stinging complaint email forwarded by his boss ninety seconds before he had to walk in and present bad numbers to eight people." },
      { headline: "A year of training paid off in that moment.", body: "He drew on a year of training himself to do uncomfortable things on purpose — hard mornings, intervals he didn’t feel like running." },
      { headline: "Scripture describes the man he’s building toward.", body: "Scripture describes the kind of man he’s building toward: “master of himself, upright, holy, and self-controlled.” The body can be trained before the mind is ready." },
      { headline: "Try this the next time anger rises.", body: "The next time anger rises before you’ve had a chance to think it through: four counts in, six counts out, four rounds. Say it while you do it — my body can be trained, and so can this." },
    ],
  },
  {
    slug: "sf_09_before_the_fall_there_was_work",
    title: "He Called It “Doing Time” — Then Learned About the Man Who Never Needed a Countdown — Seek First",
    kw: "PROVISION · DAY 2, JULY · ST. JOSEPH THE WORKER",
    slides: [
      { headline: "Do you ever think of your job as a sentence you’re serving until real life starts?", body: "Do you ever catch yourself thinking of your job as a sentence you’re serving until real life starts?" },
      { headline: "Nine years counting down to his pension.", body: "One man had spent nine years mentally counting down to his pension, telling a younger coworker they were all just “doing time.”" },
      { headline: "Work existed before the fall.", body: "Genesis says God put the first man in the garden “to till it and keep it” — work was there before the fall. It was never the punishment." },
      { headline: "The Church remembers Joseph for a workshop.", body: "The Church didn’t set aside a feast for St. Joseph because he preached or performed miracles. He’s remembered for a workshop — wood, tools, ordinary labor. He never needed a countdown; the workshop was already holy ground." },
      { headline: "Catch the thought, and replace it.", body: "Notice the next thought that frames your work as a sentence to survive. Replace it out loud: Work is part of the good world God made, not my punishment to escape it. I’m meant to tend it, not flee it." },
    ],
  },
  {
    slug: "sf_10_anxious_about_money",
    title: "1:47 A.M., Staring at the Same Three Numbers Again — Seek First",
    kw: "PROVISION · DAY 12, AUGUST",
    slides: [
      { headline: "Ever open your banking app at 2am, even though nothing’s changed since yesterday?", body: "Ever wake up at 2am and immediately open your banking app, even though nothing about the number has changed since you looked at it yesterday?" },
      { headline: "1:47am, the same three numbers, again.", body: "One man did that at 1:47 in the morning — the same three numbers he already knew by heart. He wasn’t really praying about it. He was rehearsing it." },
      { headline: "Paul made a promise on God’s behalf.", body: "St. Paul wrote to a church that had actually kept him fed during hardship, and made a promise on God’s behalf: “My God will supply every need of yours according to his riches in glory in Christ Jesus.”" },
      { headline: "This doesn’t cancel the daylight work.", body: "That doesn’t excuse the work of the ledger in daylight. It just means he can do the honest work tomorrow with a clear head instead of the anxious work tonight with a tired one." },
      { headline: "Say the verse instead of opening the app.", body: "The next time money-worry wakes you up at night, don’t reach for the banking app. Say Philippians 4:19 out loud instead." },
      { headline: "Then let it wait for daylight.", body: "Write down the one concrete step you’ll take tomorrow to address the real problem. Then let it wait for daylight." },
    ],
  },
  {
    slug: "sf_11_the_rich_fool",
    title: "The Number on the Sticky Note That Was Supposed to Fix Everything — Seek First",
    kw: "PROVISION · DAY 6, AUGUST · ST. JOHN VIANNEY",
    slides: [
      { headline: "Is there a number in your head that would finally make you feel secure?", body: "Is there a number in your head that you’ve quietly decided will finally make you feel secure?" },
      { headline: "A number tracked on a sticky note for years.", body: "One man hit that number in his retirement account — tracked on a sticky note for years. His father’s only response, when he expected praise: “Just don’t let the number become the thing you’re actually trusting.”" },
      { headline: "Jesus doesn’t soften the parable.", body: "Jesus tells it straight in the parable of the rich fool: “Fool! This night your soul is required of you; and the things you have prepared, whose will they be?”" },
      { headline: "A saint who kept almost none of what he built.", body: "St. John Vianney built real financial security through his parish — and kept almost none of it. He slept on a bare frame and gave the money away as it arrived." },
      { headline: "Name your number, out loud.", body: "Name the number, real or imagined, you’ve been treating as the point where you’d finally feel secure. Say it out loud: my security is God, not this number." },
      { headline: "Then prove it with your hands.", body: "Give something away this week that the old version of that sentence would never have allowed." },
    ],
  },
  {
    slug: "sf_12_the_anxious_search",
    title: "Eleven Minutes He Could Account for Every Second Of — Seek First",
    kw: "POSTERITY · DAY 6, NOVEMBER · ST. JOSEPH",
    slides: [
      { headline: "Has fear for your kid ever come out of your mouth as anger instead?", body: "Has fear for your kid ever come out of your mouth as anger instead?" },
      { headline: "Eleven minutes at a county fair.", body: "One man lost track of his seven-year-old son for eleven minutes at a county fair — and could account for every single one of them afterward." },
      { headline: "Relief came out as anger first.", body: "He found him fine, by the animal pens, absorbed in a goat. The first thing out of his mouth was anger — before any relief had a chance to surface first." },
      { headline: "The fear itself is what fatherhood costs.", body: "He’d always assumed a good father was mostly calm. Eleven minutes at a fairground showed him something else: the fear itself is what fatherhood costs." },
      { headline: "Joseph searched three days with no angel, no dream.", body: "Mary’s words to the boy Jesus carry the strain of every parent who’s ever lost sight of a child: “Your father and I have been looking for you anxiously.” Joseph searched three days, with no angel and no dream to shorten the wait." },
      { headline: "He wasn’t spared the fear. He carried it anyway.", body: "Joseph wasn’t spared the fear. He carried it, searched anyway, and kept moving toward his son until he found Him." },
      { headline: "Name it as love, not a loss of control.", body: "Think of the last time real fear for your child caught you off guard. Name it to yourself honestly as love, not as a loss of control — and tell your child today, plainly, how much finding them matters to you." },
    ],
  },
  {
    slug: "sf_13_sts_louis_and_zelie_martin",
    title: "The Boring, Beautiful Marriage That Raised a Saint — Seek First",
    kw: "POSTERITY · DAY 21, OCTOBER",
    slides: [
      { headline: "What do you actually think a great marriage looks like from the outside?", body: "What do you actually think a truly great marriage looks like from the outside?" },
      { headline: "Probably not this.", body: "Probably not this: decades of unglamorous, daily faithfulness. No drama. No headline." },
      { headline: "That ordinary marriage raised a saint.", body: "That’s the marriage of Sts. Louis and Zélie Martin — and out of it came a daughter the whole Church now calls a saint." },
      { headline: "Pick the one area with the most ground to cover.", body: "Fidelity, honest conversation, shared hardship, prayer — go back through your own marriage and pick the one area where you have the most ground left to cover. Take one specific action on it today, however small." },
    ],
  },
  {
    slug: "sf_14_the_glory_of_sons",
    title: "The Fifth Lap Across the Same Bathtub — Seek First",
    kw: "POSTERITY · DAY 27, NOVEMBER",
    slides: [
      { headline: "How many nights have you half-watched your kid, phone in hand, waiting for “real life” later?", body: "How many nights have you half-watched your kid do the same thing for the fifth time, phone in hand, waiting for “real life” to start later?" },
      { headline: "Phone in hand, waiting for “real life” to start later.", body: "One man did exactly that — his three-year-old daughter, the same lap across the bathtub, five times — and told himself the relationship really starts once she’s older." },
      { headline: "Scripture calls fathers the glory of their sons.", body: "Scripture says: “Grandchildren are the crown of the aged, and the glory of sons is their fathers.”" },
      { headline: "There’s no later version waiting.", body: "There’s no later version of the relationship waiting on the other side of the maintenance phase. This is the relationship." },
      { headline: "The unremarkable nights are the material.", body: "The five laps across the tub, watched or half-watched, are the material his daughter’s future sense of him gets made out of, one unremarkable night at a time." },
      { headline: "Put the phone in the other room tonight.", body: "Put your phone in another room tonight — not on silent on the counter, actually in another room. Watch every single lap, and tell her specifically what you saw, not just that you saw it." },
    ],
  },
  {
    slug: "sf_15_a_covenant_with_his_eyes",
    title: "It Started as Work. By Month Four It Was Something Else — Seek First",
    kw: "POSTERITY · DAY 16, OCTOBER",
    slides: [
      { headline: "Has a conversation ever drifted somewhere you told yourself was harmless?", body: "Has a conversation ever drifted somewhere you told yourself was harmless — right up until it wasn’t?" },
      { headline: "Months of texting before he noticed what it had become.", body: "One man texted with someone on a client’s team for months before he noticed what it had turned into. He told himself: nothing’s actually happened, so nothing’s actually wrong." },
      { headline: "Job made the decision before temptation ever arrived.", body: "Job made a different kind of decision, one he named out loud in advance: “I have made a covenant with my eyes; how then could I look upon a virgin?”" },
      { headline: "A covenant is made on the boring Tuesday, not the test.", body: "The decision gets made before temptation arrives, not after. A covenant gets made on a boring Tuesday afternoon, precisely so it’s already decided by the time the real test shows up." },
      { headline: "He flew home and told her everything.", body: "He flew home and told his wife everything. She was hurt at first — and grateful, once it settled, that he’d told her before she found out some other way." },
      { headline: "Draw your line today, before the next test.", body: "Name one relationship, app, or habit that’s drifted somewhere it shouldn’t have, and make a covenant about it today — before the next test, not during it." },
      { headline: "Tell her what the covenant is.", body: "Tell your wife what the covenant is and why you’re making it." },
    ],
  },
  {
    slug: "sf_16_why_i_wrote_this_book",
    title: "I Would Have Laughed in Your Face Twenty Years Ago — Seek First",
    kw: "EVERGREEN · THE INTRODUCTION",
    slides: [
      { headline: "Would you have believed twenty years ago you’d write a devotional?", body: "Would you have believed twenty years ago that you’d end up writing a faith-based devotional?" },
      { headline: "I would have laughed in your face.", body: "“If you’d asked me, I would have laughed in your face. I was cynical about religion for most of my life, and I was drawn instead to living on the edge.”" },
      { headline: "Here’s the rest of it, in my own words.", body: "YOUR STORY — pick up the introduction here, in your own words: prison, the years of searching, what finally cracked the cynicism open.", prompt: true },
      { headline: "I wrote the book I wish had existed for me.", body: "I wrote the book I wish had existed for me — 365 days, four pursuits: Piety, Protection, Provision, and Posterity." },
      { headline: "It’s linked below.", body: "If any of this sounds like you, it’s linked below." },
    ],
  },
  {
    slug: "sf_17_a_note_on_these_stories",
    title: "What’s Real and What’s Not in This Book — Seek First",
    kw: "EVERGREEN · FRONT MATTER, READ VERBATIM",
    slides: [
      { headline: "Ever wonder how much of a devotional like this actually happened?", body: "Ever wonder how much of a devotional like this actually happened, and how much is illustration?" },
      { headline: "There’s a page early in the book I want to read to you directly.", body: "There’s a page early in the book I want to read to you directly, because it matters." },
      { headline: "The introduction is my own story.", body: "“The introduction you just read is my own story, told as accurately as I can tell it.”" },
      { headline: "The daily entries are composites, built from real pressure.", body: "“The daily entries that follow are different. Most of the scenarios that open each day are illustrative — composites, built from the kinds of pressure I’ve faced, watched other men face, or can easily imagine a husband, father, and businessman facing. I don’t want you trusting a scenario as something that actually happened to me when it didn’t.”" },
      { headline: "That’s the standard behind every video in this series.", body: "That’s the same standard every video in this series holds to — every quote and every story you’ve heard is real." },
    ],
  },
];

function sizeClassFor(body) {
  if (body.length < 130) return "size-lg";
  if (body.length < 240) return "size-md";
  return "size-sm";
}

function esc(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderVideo(video) {
  const slidesHtml = video.slides
    .map((s, idx) => {
      const active = idx === 0 ? " active" : "";
      const size = sizeClassFor(s.body);
      const bodyColor = s.prompt ? "color:#f2f2f2;font-style:italic;" : "";
      const guidance = s.prompt
        ? `<div class="guidance">This line is yours — tell it in your own words, not read verbatim.</div>`
        : "";
      return `  <section class="slide${active} ${size}" data-section="${idx + 1}">
    <div class="text-pane">
      <div class="gold-line"></div>
      <div class="headline">${esc(s.headline)}</div>
      <div class="body" style="${bodyColor}">${esc(s.body)}</div>
      ${guidance}
    </div>
  </section>`;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${esc(video.title)}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body {
    width: 100%; height: 100%;
    background: #0a0a0a;
    color: #f2f2f2;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Helvetica, sans-serif;
    overflow: hidden;
  }
  .stage { width: 100vw; height: 100vh; position: relative; }
  section.slide {
    position: absolute; inset: 0;
    display: none;
  }
  section.slide.active { display: flex; }
  section.slide {
    flex-direction: column;
    justify-content: center;
  }
  .text-pane {
    padding: 8vh 12vw 10vh 12vw;
    display: flex; flex-direction: column; justify-content: center;
    background: #0a0a0a;
    overflow: hidden;
    width: 100%;
    flex: 1;
  }
  .gold-line { width: 5vw; height: 4px; background: #daa520; margin-bottom: 2.4vh; }
  .headline {
    font-weight: 800;
    color: #ffffff;
    max-width: 24em;
    letter-spacing: -0.015em;
    overflow-wrap: break-word;
    word-break: break-word;
    hyphens: auto;
  }
  .body {
    color: #c8c8c8;
    max-width: 38em;
    font-weight: 400;
    overflow-wrap: break-word;
    word-break: break-word;
  }
  .body strong { color: #fff; font-weight: 600; }
  .slide.size-lg .headline { font-size: 4.2vw; line-height: 1.08; margin-bottom: 3.0vh; }
  .slide.size-lg .body     { font-size: 1.85vw; line-height: 1.50; }
  .slide.size-md .headline { font-size: 3.4vw; line-height: 1.10; margin-bottom: 2.4vh; }
  .slide.size-md .body     { font-size: 1.55vw; line-height: 1.50; }
  .slide.size-sm .headline { font-size: 2.6vw; line-height: 1.12; margin-bottom: 1.8vh; }
  .slide.size-sm .body     { font-size: 1.30vw; line-height: 1.45; }
  .guidance {
    margin-top: 2.2vh;
    padding-top: 1.6vh;
    border-top: 1px solid rgba(218,165,32,0.25);
    color: #8a8a8a;
    font-size: 0.95vw;
    font-style: italic;
    line-height: 1.45;
  }
  .guidance::before {
    content: "DELIVERY ↘  ";
    color: #daa520;
    font-style: normal;
    font-weight: 700;
    letter-spacing: 0.12em;
  }
  .footer-bar {
    position: absolute; left: 0; right: 0; bottom: 0;
    padding: 1.6vh 6vw;
    display: flex; justify-content: space-between; align-items: center;
    color: #555; font-size: 0.95vw;
    border-top: 1px solid #1a1a1a;
    background: #050505;
    z-index: 10;
  }
  .footer-bar .kw { color: #daa520; letter-spacing: 0.18em; font-weight: 700; }
  .footer-bar .duration { color: #888; font-variant-numeric: tabular-nums; }
  .nav {
    position: fixed; top: 20px; right: 20px;
    z-index: 50;
    background: rgba(0,0,0,0.65);
    padding: 8px 14px;
    border-radius: 999px;
    color: #daa520;
    font-size: 13px;
    letter-spacing: 0.1em;
    font-weight: 600;
  }
  .nav .hint { color: #888; font-weight: 400; margin-left: 10px; }
  </style>
</head>
<body>
  <div class="nav"><span id="counter">1 / ${video.slides.length}</span><span class="hint">← → keys</span></div>
  <div class="stage">
${slidesHtml}
    <div class="footer-bar">
      <div class="kw">${esc(video.kw)}</div>
      <div class="duration">${video.slides.length} sections</div>
    </div>
  </div>
  <script>
    const slides = document.querySelectorAll("section.slide");
    let i = 0;
    function show(n) {
      slides.forEach((s, idx) => s.classList.toggle("active", idx === n));
      document.getElementById("counter").textContent = (n + 1) + " / " + slides.length;
    }
    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        i = Math.min(slides.length - 1, i + 1); show(i);
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        i = Math.max(0, i - 1); show(i);
      } else if (e.key === "Home") { i = 0; show(i); }
      else if (e.key === "End") { i = slides.length - 1; show(i); }
    });
    document.addEventListener("click", () => { i = Math.min(slides.length - 1, i + 1); show(i); });
    show(0);
  </script>
</body>
</html>
`;
}

const outDir = path.join(__dirname, "web-slides");
fs.mkdirSync(outDir, { recursive: true });
VIDEOS.forEach((v) => {
  const outPath = path.join(outDir, v.slug + ".html");
  fs.writeFileSync(outPath, renderVideo(v), "utf8");
  console.log("wrote", outPath);
});
console.log("Total:", VIDEOS.length, "files");
