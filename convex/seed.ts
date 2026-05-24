import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";

const MARKETING_RUBRIC = `Marketing 101 — Midterm Essay Rubric (100 points total)

THESIS & ARGUMENT (30 points)
- Is the central claim specific, debatable, and clearly stated in the introduction?
- Does every paragraph advance the thesis?
- Is the argument original or merely descriptive?

EVIDENCE & ANALYSIS (25 points)
- Are claims supported with specific data, examples, or scholarship?
- Does the writer analyze the evidence — not just cite it?
- Are counterexamples acknowledged?

STRUCTURE & ORGANIZATION (20 points)
- Logical flow from intro → body → conclusion
- Clear topic sentences and effective transitions
- Conclusion synthesizes rather than restates

WRITING QUALITY (15 points)
- Grammar, syntax, varied sentence structure
- Precise word choice; appropriate academic register
- Free of filler, hedging, and clichés

CRITICAL THINKING (10 points)
- Demonstrates independent reasoning
- Engages with complexity rather than oversimplifying
- Identifies trade-offs, second-order effects, and limits of the analysis

GRADING SCALE
A  (90–100) — exceptional; publishable undergraduate work
B  (80–89)  — solid argument with minor weaknesses
C  (70–79)  — meets basic expectations but lacks depth
D  (60–69)  — significant deficiencies in argument or evidence
F  (<60)    — does not engage with the prompt or fails minimum standards`;

const ETHICS_RUBRIC = `Business Ethics — Case Study Analysis Rubric (100 points total)

ETHICAL FRAMEWORK APPLICATION (25 points)
- Correctly identifies and applies at least two ethical frameworks (e.g., utilitarian, deontological, virtue ethics, stakeholder theory)
- Frameworks are used to illuminate the case, not as window dressing

STAKEHOLDER ANALYSIS (20 points)
- Identifies all affected stakeholders, including non-obvious ones (regulators, future customers, employees' families)
- Weighs competing interests honestly

CASE FACTS & EVIDENCE (20 points)
- Accurate recounting of the facts; cites primary sources where possible
- Distinguishes facts from speculation

ARGUMENTATION (20 points)
- Logically structured argument
- Anticipates and responds to the strongest counterarguments

RECOMMENDATION (15 points)
- Concrete, actionable, and tied to the analysis
- Acknowledges trade-offs of the recommended course

GRADING SCALE: A (90+), B (80–89), C (70–79), D (60–69), F (<60)`;

type SeedEssay = {
  title: string;
  content: string;
  type: "reference" | "ungraded";
  status: "pending" | "complete";
  professorGrade?: string;
  professorFeedback?: string;
  aiGrade?: string;
  aiFeedback?: string;
  aiReasoning?: string;
  aiConfidence?: number;
  aiCriteriaBreakdown?: Array<{
    criterion: string;
    score: string;
    comment: string;
  }>;
};

const MARKETING_ESSAYS: SeedEssay[] = [
  {
    title: "Reference — Netflix's Pivot to Streaming (A, 92)",
    type: "reference",
    status: "complete",
    professorGrade: "92/100 (A)",
    professorFeedback:
      "Outstanding work. The thesis frames Netflix's pivot as a deliberate option-value play rather than a reactive move, and the analysis of the 2007–2011 DVD-to-streaming transition is grounded in concrete subscriber and content-spend data. Counterargument about Blockbuster is handled gracefully. Push further on the long-term content-cost spiral in your next paper.",
    content: `Netflix's 2007 launch of streaming alongside its DVD-by-mail business is often described as a pivot, but the better framing is that Reed Hastings purchased an option. The DVD business was throwing off cash, customer counts were still growing, and broadband penetration in the U.S. had only just crossed 50%. The decision to invest in streaming was not a bet that streaming would dominate in 2007 — it was a bet that owning the streaming distribution channel would be valuable if and when it dominated, and that no one else was positioned to build the option at Netflix's cost basis.

The evidence supports this reading. Between 2007 and 2011, Netflix's streaming subscriber count grew from roughly half a million to over 21 million, while DVD subscribers peaked in 2010 and began their long decline. Crucially, Netflix did not abandon DVDs during this transition. The 2011 Qwikster debacle is usually framed as a strategic failure, but the underlying logic — separate the declining business so the growing business can be capitalized independently — was sound. The execution was poor; the strategy was correct.

The Blockbuster counterexample is instructive but limited. Blockbuster had higher revenue than Netflix in 2007 and even launched a competitive mail-DVD service, but its cost structure (10,000+ stores) and capital structure (heavy debt from the Viacom spinoff) made the option to pivot prohibitively expensive. Netflix's pivot was cheap because its starting point was already capital-light. This is a general lesson for strategic optionality: the value of an option depends on the cost of exercising it.

What this analysis does not resolve is whether Netflix's post-2013 move into original content is the same kind of option, or a different bet entirely. Spending $17 billion annually on content looks less like buying optionality and more like vertical integration to neutralize bargaining power from studios. That is a different argument, with different evidence, and worth a separate paper.`,
  },
  {
    title: "Reference — Tesla's Market Position (B+, 87)",
    type: "reference",
    status: "complete",
    professorGrade: "87/100 (B+)",
    professorFeedback:
      "Strong argument with clear structure, but the evidence leans heavily on anecdote and analyst commentary rather than financial data. The 'cult brand' framing is interesting but undertheorized. Bring more numbers next time — gross margin, ASP, regional mix.",
    aiGrade: "85/100 (B)",
    aiFeedback:
      "This essay makes a compelling argument that Tesla's competitive moat is brand and software rather than hardware, but the support is uneven. The introduction frames the thesis crisply, and the comparison to Apple is provocative. However, the body relies on quotations and broad claims ('analysts say', 'many investors believe') where specific numbers would be stronger. The conclusion acknowledges the risk of EV commoditization but does not weigh it against the brand-moat argument. Recommend: tighten with one or two concrete data points per claim, and explicitly resolve the tension between the moat argument and the commoditization risk.",
    aiReasoning:
      "Thesis is clear and original (B+/A- range). Structure is solid (A- range). Evidence is the weakness — heavy reliance on anecdote and qualitative claims, light on data (B-/B range). Writing quality is good, no major issues (B+ range). Critical thinking is present but the counterargument handling is rushed (B range). Weighted: ~85. The instructor gave 87 — slightly more credit for the originality of the framing, which is reasonable.",
    aiConfidence: 0.78,
    aiCriteriaBreakdown: [
      {
        criterion: "Thesis & Argument",
        score: "26/30",
        comment: "Clear and original. The Apple analogy is provocative but undertheorized.",
      },
      {
        criterion: "Evidence & Analysis",
        score: "18/25",
        comment: "Anecdotal — needs specific financial data (gross margin, ASP, regional mix).",
      },
      {
        criterion: "Structure & Organization",
        score: "17/20",
        comment: "Solid flow, good topic sentences.",
      },
      {
        criterion: "Writing Quality",
        score: "13/15",
        comment: "Clean prose, varied sentences.",
      },
      {
        criterion: "Critical Thinking",
        score: "8/10",
        comment: "Counterargument acknowledged but not resolved.",
      },
    ],
    content: `Tesla's market position is misunderstood. Most analysts treat it as a car company that happens to make electric vehicles, and on that basis call it overvalued. The better lens is that Tesla is a software and brand company that uses cars as a distribution mechanism, similar to how Apple uses the iPhone as a distribution mechanism for its services ecosystem.

Three observations support this. First, Tesla's customers behave like cult-brand customers, not commodity customers. Repurchase rates are extraordinarily high, and customers actively defend the brand on social media in ways no Ford or GM owner does. This is a defensible moat that scales with ownership base.

Second, Tesla's software differentiation — over-the-air updates, the Supercharger network, and the FSD (Full Self-Driving) program — creates lock-in that traditional automakers cannot easily replicate. Legacy OEMs have spent billions trying and have produced underwhelming results. The reason is organizational, not financial: car companies are not software companies, and converting one into the other is harder than starting from a software-first foundation.

Third, the Supercharger network, now opening to other manufacturers, is the kind of standards-setting platform play that historically produces durable competitive advantage. Owning the dominant charging standard in North America is analogous to owning the dominant payment rails or the dominant ad platform.

The counterargument is that EVs will become commoditized, and that Chinese manufacturers will compress margins industry-wide. This is a real risk and Tesla is not immune. However, even in a commoditized EV market, the company that owns the charging network and the autonomy software stack is in a fundamentally different position than the company that makes the cheapest battery pack.

Tesla's stock price will continue to be volatile because the market keeps trying to value it as a car company. The thesis here is that the better comparison is to a vertically integrated technology platform — and that the brand, software, and standards moats are real even if the car business itself becomes less attractive.`,
  },
  {
    title: "Reference — Nike's Branding Strategy (B, 83)",
    type: "reference",
    status: "complete",
    professorGrade: "83/100 (B)",
    professorFeedback:
      "Decent structure and clear writing, but the analysis stays at the surface. You describe what Nike does (sponsor athletes, use emotional ads) without explaining why it works. The next iteration should engage with theory — brand equity models, signaling, identity economics — to give the description analytical weight.",
    aiGrade: "81/100 (B-)",
    aiFeedback:
      "The essay is competently written and covers Nike's branding strategy at a descriptive level: athlete endorsements, 'Just Do It' campaign, emotional storytelling. The weakness is that it stops at description. Why do athlete endorsements work? What is the mechanism — social proof, aspirational identification, signaling? The essay never engages with theory, which limits the analytical depth. Strengthen the next version by introducing a framework (e.g., Keller's brand equity model) and using it to interpret Nike's choices.",
    aiReasoning:
      "Thesis is clear but not particularly original — Nike's branding is 'emotional and athlete-driven', which is widely known (B-/B). Evidence is plentiful but undertheorized (B-). Structure is fine (B+). Writing is clean (B+). Critical thinking is the main weakness — descriptive rather than analytical (C+/B-). Weighted: ~81. Instructor gave 83, which is a reasonable slightly-higher mark for solid execution.",
    aiConfidence: 0.82,
    aiCriteriaBreakdown: [
      {
        criterion: "Thesis & Argument",
        score: "23/30",
        comment: "Clear but well-trodden territory; lacks originality.",
      },
      {
        criterion: "Evidence & Analysis",
        score: "19/25",
        comment: "Lots of examples; little analysis of mechanism.",
      },
      {
        criterion: "Structure & Organization",
        score: "17/20",
        comment: "Logical flow, clean transitions.",
      },
      {
        criterion: "Writing Quality",
        score: "13/15",
        comment: "Clean and readable.",
      },
      {
        criterion: "Critical Thinking",
        score: "6/10",
        comment: "Descriptive rather than analytical. Bring in theory.",
      },
    ],
    content: `Nike has built one of the most valuable brands in the world by linking its products to identity, aspiration, and athletic performance. The "Just Do It" campaign, launched in 1988, did not focus on shoe specifications. It focused on the mindset of overcoming obstacles, and the result was a campaign that became cultural shorthand for personal motivation. Nike has since pursued the same playbook for over three decades, and the consistency is part of why the brand has held value where competitors have struggled.

A central pillar of Nike's strategy is athlete endorsement. The Michael Jordan partnership, beginning in 1984, transformed both Jordan's career and Nike's basketball business. Air Jordan generates billions of dollars in revenue annually even today, decades after Jordan's retirement. Nike has repeated this pattern with Tiger Woods, Cristiano Ronaldo, Serena Williams, and most recently with WNBA stars and women's soccer players. Each partnership extends the brand into a new audience while reinforcing the core association: Nike is for serious athletes, and by extension, for people who see themselves as serious about whatever they pursue.

Emotional storytelling is the second pillar. Nike's advertisements rarely focus on product features. They tell stories about athletes overcoming injury, immigrants chasing dreams, or kids in underprivileged communities discovering sport. The 2018 Colin Kaepernick campaign is the clearest recent example: Nike took a political risk and tied its brand to a polarizing figure, and the result was a measurable sales increase among its target demographic and a deepening of brand loyalty.

A third element is the integration of digital and physical experience. Nike's apps (Nike Run Club, Nike Training Club, SNKRS) keep customers engaged between purchases and generate data that informs product development and marketing. The direct-to-consumer push, accelerated during the pandemic, has shifted Nike's relationship with customers away from intermediated retail.

Together, these three pillars — athlete endorsements, emotional storytelling, and digital engagement — explain why Nike commands premium pricing in a category that is otherwise highly competitive. The branding is the moat.`,
  },
  {
    title: "Reference — Starbucks International Expansion (C+, 76)",
    type: "reference",
    status: "complete",
    professorGrade: "76/100 (C+)",
    professorFeedback:
      "The essay has interesting raw material but the thesis is fuzzy. Are you arguing that Starbucks has succeeded internationally, that it has struggled, or that the answer depends on the country? Pick one and defend it. Evidence is also disconnected — facts are stated but rarely tied back to the central claim.",
    content: `Starbucks has expanded into more than 80 countries since opening its first international store in Tokyo in 1996. This expansion has been a major part of the company's growth story, and it is interesting to look at how Starbucks has approached different markets.

In China, Starbucks has been very successful. The company has over 6,000 stores in China and continues to open hundreds more per year. Chinese consumers have embraced the Starbucks brand as a status symbol, and the company has localized its menu to include items like green tea frappuccinos and mooncakes during the Mid-Autumn Festival. Starbucks also invested in a flagship Reserve Roastery in Shanghai which has become a tourist destination.

In Australia, Starbucks struggled. The Australian coffee market was already well-developed when Starbucks entered, with strong independent cafe culture and high standards for espresso. Starbucks closed many of its Australian stores in 2008 and has only recently begun to expand again in select cities.

In the Middle East, Starbucks has done well in countries like the UAE and Saudi Arabia, where the brand fits into the mall-based retail culture. The company partners with local franchisees in these markets, which helps with regulatory navigation and cultural adaptation.

Localization is a theme across these markets. Starbucks adjusts its menu, store design, and marketing for each country. In Italy, where Starbucks opened its first store only in 2018, the company designed the Milan Roastery to respect Italian coffee traditions while still being recognizably Starbucks.

However, there are also challenges. Competition from local chains like Luckin Coffee in China is intensifying. Currency fluctuations affect profitability. And in some markets, the Starbucks price point is too high for mass adoption.

Overall, Starbucks's international expansion shows that a strong global brand combined with thoughtful localization can succeed in many markets, even if results vary by country. The company will likely continue to grow internationally, especially in Asia.`,
  },
  {
    title: "Reference — What Makes a Brand Good (D, 64)",
    type: "reference",
    status: "complete",
    professorGrade: "64/100 (D)",
    professorFeedback:
      "This essay does not engage with the prompt. There is no clear thesis, no specific evidence, and no analysis. Most of the paper consists of general statements about branding that could apply to any company. Please come to office hours before the next assignment so we can talk through how to approach an analytical essay.",
    content: `Branding is a very important part of marketing. Companies need to have good brands to succeed in today's market. A brand is what people think when they hear a company's name, and it can affect whether they buy from that company or not.

There are many things that make a brand good. One thing is consistency. A brand needs to be consistent across all of its products and advertising. If a brand is not consistent, customers will get confused. Another thing is quality. A brand has to have good quality products or services, otherwise customers will not come back. Customer service is also important because if customers have a bad experience, they will tell other people.

Logos and colors are part of branding. A logo should be memorable and easy to recognize. Colors should match the brand's personality. For example, a fun brand might use bright colors while a serious brand might use more neutral colors. Many companies spend a lot of money on designing their logos.

Social media has changed branding a lot in recent years. Companies now use Instagram and TikTok to reach younger customers. They post content that fits with their brand image. Some brands have gone viral on social media which has helped them grow.

In conclusion, branding is very important and companies should focus on building strong brands. They should be consistent, have good quality, and use social media well. If they do these things, they can build a successful brand that customers love. There are many examples of successful brands in the world today and they all have these qualities in common.`,
  },
  {
    title: "Student #4421 — Apple's Ecosystem Strategy",
    type: "ungraded",
    status: "pending",
    content: `Apple has created one of the most successful product ecosystems in the world. By making sure all of their products work well together, Apple has built a system that keeps customers loyal and makes it hard for them to switch to other brands. This is one of the main reasons Apple has been so successful as a company.

When you buy an iPhone, you also have access to iMessage, FaceTime, the App Store, iCloud, and many other services. If you also have a MacBook or an iPad, all of these things sync together seamlessly. You can start writing an email on your phone and finish it on your laptop. Your photos automatically appear on all your devices. This kind of integration is hard for other companies to copy because they don't make all the hardware themselves.

Apple's ecosystem also includes services like Apple Music, Apple TV+, and Apple Fitness+. These services give Apple a steady stream of subscription revenue. As of recent years, Apple's services business has grown to be a major part of the company's overall revenue. This is good for Apple because services have higher margins than hardware.

Another key part of the ecosystem is the App Store. Developers want to make apps for Apple devices because Apple users tend to spend more money on apps. This creates a positive feedback loop: more apps make Apple devices more attractive, which leads to more users, which attracts more developers.

However, there are also challenges. The European Union has passed laws that force Apple to allow alternative app stores, which could weaken the ecosystem. Some people also criticize Apple for being a "walled garden" that doesn't play well with other brands. But despite these challenges, Apple's ecosystem strategy continues to work well.

In conclusion, Apple's ecosystem is a powerful competitive advantage. By integrating hardware, software, and services, Apple has created a system that customers find valuable and that competitors find difficult to match. This will likely continue to be a key part of Apple's strategy going forward.`,
  },
  {
    title: "Student #4422 — Coca-Cola's 'Share a Coke' Campaign",
    type: "ungraded",
    status: "pending",
    content: `Coca-Cola launched the "Share a Coke" campaign in Australia in 2011, and it later expanded to over 80 countries. The basic idea of the campaign was to print common first names on Coke bottles instead of the regular Coca-Cola logo. This was a creative and personalized marketing approach that ended up being very successful for the company.

The campaign worked because it tapped into something basic about human nature, which is that people like to see their own names. When customers saw a Coke bottle with their name on it, they wanted to buy it and often took pictures to share on social media. This created a lot of free advertising for Coca-Cola because the campaign basically went viral. People who would not normally buy Coke were now buying it to find their name or their friend's name.

In Australia where the campaign started, Coke sales went up by around 7% during the campaign. In the US, the campaign was credited with reversing more than a decade of declining sales. These are real results that show the campaign worked from a business standpoint.

There were also some criticisms. Some people pointed out that the campaign didn't include enough diverse names, especially names common in minority communities. Coca-Cola later expanded the list of names to address this. The campaign also relied on people being willing to spend more time looking at Coke bottles than they usually would, which might not work in all markets.

Another interesting thing about the campaign is that it was relatively simple. Coca-Cola didn't invent any new product or change their formula. They just changed the label. This shows that good marketing doesn't always require a big change to the product itself, sometimes just a creative twist on something familiar.

Overall, "Share a Coke" was a smart campaign that took advantage of personalization and social media trends. It also shows how a big established brand can still find new ways to connect with customers and drive sales.`,
  },
  {
    title: "Student #4423 — Amazon Prime as a Loyalty Tool",
    type: "ungraded",
    status: "pending",
    content: `Amazon Prime is a subscription service from Amazon that gives members free shipping, video streaming, music streaming, and other benefits. Since it was launched in 2005, Prime has become one of the most successful loyalty programs in the world, with over 200 million subscribers globally.

The main reason Prime works as a loyalty tool is that it changes how customers think about shopping. Once you pay for Prime, you want to use the free shipping benefit, so you shop more on Amazon. This is a psychological effect that economists call "sunk cost". You already paid for the membership, so using it makes you feel like you're getting value. Amazon takes advantage of this to increase customer purchase frequency.

Prime also includes other benefits beyond shipping. Prime Video competes with Netflix and offers original shows like "The Boys" and "The Marvelous Mrs. Maisel". Prime Music has a library of millions of songs. There's also Prime Reading, Prime Gaming, and Whole Foods discounts for Prime members. All of these benefits together make Prime feel like a really good deal even though it costs $139 per year in the US.

The bundling strategy is important. By bundling so many services together, Amazon makes it hard for customers to compare Prime to any single competitor. Prime Video is cheaper than Netflix per month if you only consider the video benefit, but you also get all the other things. This makes Prime sticky and hard to cancel.

Critics say that Prime is essentially Amazon paying customers to be locked in. The shipping is not really "free" because Amazon includes the cost in product prices and in the membership fee. But customers seem to perceive Prime as valuable, so it works.

In recent years, Amazon has continued to add benefits to Prime to maintain its appeal. They've also raised the price, which suggests Amazon believes Prime is so valuable to customers that they won't cancel even with a higher price. So far this seems to be true. Prime is a great example of how a loyalty program can be a major source of competitive advantage in e-commerce.`,
  },
];

const ETHICS_ESSAYS: SeedEssay[] = [
  {
    title: "Reference — Wells Fargo Fake Accounts (A, 91)",
    type: "reference",
    status: "complete",
    professorGrade: "91/100 (A)",
    professorFeedback:
      "Excellent application of stakeholder theory and a sharp distinction between individual misconduct and systemic incentive failure. The analysis of cross-sell quotas as an institutional driver is exactly the level of structural thinking I want to see. Recommendation section is appropriately humble about implementation difficulty.",
    content: `The Wells Fargo cross-selling scandal is usually framed as a story about unethical employees opening fake accounts to hit quotas. That framing is incomplete. The deeper ethical failure was an institutional one: senior leadership designed an incentive system that made misconduct rational at the employee level, and then disclaimed responsibility when the predictable outcome occurred.

Between 2002 and 2016, Wells Fargo employees opened roughly 3.5 million unauthorized accounts. Employees who failed to hit aggressive cross-sell quotas faced termination; employees who hit them received bonuses. When you set up that gradient and apply it to roughly 100,000 retail bank employees, the question is not whether some will commit fraud — it is what fraction will. Applying utilitarian analysis, the policy produced clear harms (customers charged fees, credit scores damaged, trust eroded) and no offsetting benefits proportionate to those harms. Applying deontological analysis, the policy treated customers as means to a sales target rather than as ends.

Stakeholder analysis sharpens the critique. Customers were harmed directly. Employees were harmed by being placed in a system that punished honesty. Shareholders were harmed by the eventual $3 billion in fines and lasting reputational damage. The only beneficiaries during the misconduct window were senior executives whose compensation was tied to cross-sell metrics — a group that Carrie Tolstedt, head of community banking, exemplifies. She retired with a $124 million payout shortly before the scandal broke publicly.

The defense that "rogue employees" caused the harm fails on the facts. Internal complaints flagged the practice as early as 2005. The company's ethics hotline received thousands of reports. Employees who reported misconduct were sometimes fired in retaliation. This is not a few bad actors — it is institutional knowledge that the misconduct was systemic, paired with institutional unwillingness to change the incentive system producing it.

The recommendation has to be structural, not individual. Clawback provisions, regulatory oversight of incentive design, and protection for internal whistleblowers are necessary but not sufficient. The harder change is cultural: a board willing to accept slower growth in exchange for not building a sales machine that destroys customer trust. That is a real trade-off, and Wells Fargo's leadership at the time was unwilling to make it.`,
  },
  {
    title: "Reference — Volkswagen Emissions Scandal (B, 82)",
    type: "reference",
    status: "complete",
    professorGrade: "82/100 (B)",
    professorFeedback:
      "Solid analysis and good use of deontological framing. Two weaknesses: (1) the consequentialist analysis is shallow — quantify the public-health harm rather than gesture at it; (2) the recommendation is general where it could be specific.",
    content: `Volkswagen's deliberate use of defeat devices to circumvent diesel emissions testing between 2009 and 2015 is one of the clearest cases of corporate fraud in recent memory. Roughly 11 million vehicles worldwide were equipped with software that detected when the car was being tested and altered engine behavior to pass emissions limits. During normal driving, the vehicles emitted nitrogen oxides at up to 40 times the legal limit.

From a deontological perspective, the misconduct is straightforward. Volkswagen deliberately deceived regulators, customers, and the public. The Kantian categorical imperative — act only on maxims you could will to be universal law — clearly forbids the practice. If every automaker installed defeat devices, the entire emissions regulation system would collapse, which is exactly the outcome Volkswagen's behavior was designed to free-ride on.

The consequentialist analysis is also negative, though it requires more nuance. The excess emissions over the multi-year period contributed to premature deaths from respiratory illness; one MIT study estimated the U.S. excess emissions caused roughly 60 premature deaths. The financial penalties have exceeded $30 billion globally, dwarfing any savings from skipping emissions compliance. So both the moral and the practical analyses point the same direction.

The stakeholder analysis is interesting. The most affected stakeholders were not Volkswagen's customers (who got the cars they wanted, even if at higher pollution levels) but third parties who breathed the air. This is a classic externality problem: the harm fell on people who had no contractual relationship with Volkswagen. This is exactly why emissions regulations exist, and why circumventing them is a more serious ethical failure than, say, lying to your own customers.

The recommendation: stronger criminal liability for executives who direct or knowingly tolerate regulatory fraud. Civil penalties on the corporation are necessary but insufficient because they are paid by shareholders, not by the decision-makers. Volkswagen's outcome — a handful of mid-level engineers prosecuted, senior leadership largely intact — suggests the current deterrent structure is inadequate.`,
  },
  {
    title: "Reference — Theranos Fraud (C+, 77)",
    type: "reference",
    status: "complete",
    professorGrade: "77/100 (C+)",
    professorFeedback:
      "You retell the Theranos story well but spend too much time on narrative and not enough on ethical analysis. Pick one or two ethical frameworks and apply them deeply rather than gesturing at several. The Holmes verdict deserves more careful treatment.",
    content: `Theranos was founded by Elizabeth Holmes in 2003 with the promise of revolutionary blood-testing technology that could run hundreds of tests from a single finger-prick sample. The company was valued at $9 billion at its peak. By 2018, the technology had been exposed as essentially nonfunctional, the company had dissolved, and Holmes was eventually convicted of fraud and sentenced to over 11 years in prison.

The Theranos story is interesting from an ethics standpoint because it combines several different kinds of wrongdoing. There was deception of investors, who were told the technology worked when it did not. There was deception of patients, whose blood tests using Theranos devices produced unreliable results that could have led to incorrect medical decisions. And there was deception of regulators and partners, particularly Walgreens, which deployed Theranos devices in its stores.

The patient harm is the most ethically serious dimension. Investors who lose money in a failed startup is a normal part of business risk. But patients who received inaccurate test results for conditions like cancer, pregnancy, or hormone levels were exposed to real medical harm that they had not consented to. Some patients had to redo tests at conventional labs and got different results.

Elizabeth Holmes's defense in her trial argued that she was a true believer who genuinely thought the technology would eventually work. There is something to this — many founders raise money on promises they cannot yet deliver, and the line between optimism and fraud is sometimes blurry. But the jury found that she crossed the line, and the evidence (fabricated demonstrations, hidden lab results, retaliation against whistleblowers) supports that finding.

The broader lesson is about the limits of "fake it till you make it" culture in startups. In software, where the cost of failure is usually just money, this approach has some defenders. In medical devices, where the cost of failure can be patient harm, the same approach is ethically unacceptable. Different industries should have different norms, and the regulatory framework should reflect that.`,
  },
  {
    title: "Student #2104 — Facebook & Cambridge Analytica",
    type: "ungraded",
    status: "pending",
    content: `The Cambridge Analytica scandal that came to light in 2018 was one of the biggest data privacy controversies in recent history. Cambridge Analytica, a political consulting firm, obtained personal data from approximately 87 million Facebook users without their knowledge or consent. This data was then used to build psychological profiles and target political advertising during the 2016 US presidential election and the Brexit referendum.

The data was originally collected through a personality quiz app developed by a researcher named Aleksandr Kogan. Users who took the quiz consented to share their data, but Facebook's platform rules at the time also allowed the app to harvest data from those users' friends, who did not consent. This loophole was the key technical issue, and it was a known feature of the Facebook platform rather than a hack.

Facebook's role in the scandal is ethically complex. The company did not directly sell the data to Cambridge Analytica. But Facebook's platform design enabled the data harvesting, and the company was slow to inform affected users once it learned of the situation. Mark Zuckerberg eventually testified before Congress about the scandal, and Facebook was fined $5 billion by the FTC.

From an ethics perspective, several frameworks apply. A consent-based framework says clearly that users whose data was harvested without their knowledge were wronged, regardless of any downstream consequences. The 70 million or so friends-of-quiz-takers never agreed to share their data with Cambridge Analytica.

A consequentialist framework is harder because the actual political impact of Cambridge Analytica's targeting is disputed. Some researchers argue that the psychological profiling was overhyped marketing by Cambridge Analytica itself, and that the actual effect on voters was minimal. If true, this would change the moral calculation somewhat, though it would not eliminate the wrong of unauthorized data collection.

The recommendation would be to mandate explicit, granular consent for data sharing, especially when third-party apps are involved. The GDPR in Europe has moved in this direction since 2018, and even Facebook has tightened its platform rules. But the broader question of how social media platforms should be regulated remains contested. Cambridge Analytica is a cautionary tale, but the underlying business model of targeted advertising based on user data has not fundamentally changed.`,
  },
];

async function insertSession(
  ctx: MutationCtx,
  args: {
    name: string;
    description?: string;
    rubric?: { content: string; maxScore: number; gradeScale?: string };
    essays?: SeedEssay[];
    createdAt: number;
  }
): Promise<Id<"sessions">> {
  const sessionId = await ctx.db.insert("sessions", {
    name: args.name,
    description: args.description,
    createdAt: args.createdAt,
    isSeed: true,
  });

  if (args.rubric) {
    await ctx.db.insert("rubrics", {
      sessionId,
      content: args.rubric.content,
      maxScore: args.rubric.maxScore,
      gradeScale: args.rubric.gradeScale,
      updatedAt: Date.now(),
    });
  }

  if (args.essays) {
    for (const e of args.essays) {
      await ctx.db.insert("essays", {
        sessionId,
        title: e.title,
        content: e.content,
        type: e.type,
        status: e.status,
        professorGrade: e.professorGrade,
        professorFeedback: e.professorFeedback,
        aiGrade: e.aiGrade,
        aiFeedback: e.aiFeedback,
        aiReasoning: e.aiReasoning,
        aiConfidence: e.aiConfidence,
        aiCriteriaBreakdown: e.aiCriteriaBreakdown,
        gradedAt:
          e.status === "complete" && e.aiGrade ? Date.now() : undefined,
        createdAt: Date.now(),
      });
    }
  }

  return sessionId;
}

export const status = query({
  args: {},
  handler: async (
    ctx
  ): Promise<{ seeded: boolean; sessionCount: number }> => {
    const rows = await ctx.db.query("sessions").collect();
    const seedRows = rows.filter((r) => r.isSeed === true);
    return { seeded: seedRows.length > 0, sessionCount: seedRows.length };
  },
});

export const loadSampleData = mutation({
  args: {},
  handler: async (
    ctx
  ): Promise<{
    created: boolean;
    message: string;
    sessionCount: number;
  }> => {
    const existing = await ctx.db.query("sessions").collect();
    const existingSeed = existing.filter((r) => r.isSeed === true);
    if (existingSeed.length > 0) {
      return {
        created: false,
        message:
          "Sample data already loaded. Click 'Remove Sample Data' first to reset.",
        sessionCount: existingSeed.length,
      };
    }

    const now = Date.now();

    await insertSession(ctx, {
      name: "Marketing 101 — Midterm Essay",
      description:
        "Undergraduate marketing midterm. Argumentative essays on contemporary brand strategy.",
      rubric: {
        content: MARKETING_RUBRIC,
        maxScore: 100,
        gradeScale: "A/B/C/D/F + 0-100",
      },
      essays: MARKETING_ESSAYS,
      createdAt: now,
    });

    await insertSession(ctx, {
      name: "Business Ethics — Case Study Analysis",
      description:
        "MBA-level case study analysis. Applies multiple ethical frameworks to real-world corporate misconduct.",
      rubric: {
        content: ETHICS_RUBRIC,
        maxScore: 100,
        gradeScale: "A/B/C/D/F + 0-100",
      },
      essays: ETHICS_ESSAYS,
      createdAt: now - 1000,
    });

    await insertSession(ctx, {
      name: "Entrepreneurship — Startup Pitch Evaluation",
      description:
        "Fresh session. Add a rubric and reference essays in Setup to start grading.",
      createdAt: now - 2000,
    });

    return {
      created: true,
      message: "Loaded 3 sample sessions with rubrics and essays.",
      sessionCount: 3,
    };
  },
});

export const clearSampleData = mutation({
  args: {},
  handler: async (
    ctx
  ): Promise<{ removed: number; message: string }> => {
    const sessions = await ctx.db.query("sessions").collect();
    const seedSessions = sessions.filter((r) => r.isSeed === true);

    for (const session of seedSessions) {
      const essays = await ctx.db
        .query("essays")
        .withIndex("by_session", (q) => q.eq("sessionId", session._id))
        .collect();
      for (const e of essays) await ctx.db.delete(e._id);

      const rubrics = await ctx.db
        .query("rubrics")
        .withIndex("by_session", (q) => q.eq("sessionId", session._id))
        .collect();
      for (const r of rubrics) await ctx.db.delete(r._id);

      const evals = await ctx.db
        .query("evaluations")
        .withIndex("by_session", (q) => q.eq("sessionId", session._id))
        .collect();
      for (const e of evals) await ctx.db.delete(e._id);

      await ctx.db.delete(session._id);
    }

    return {
      removed: seedSessions.length,
      message:
        seedSessions.length === 0
          ? "No sample data found to remove."
          : `Removed ${seedSessions.length} sample session${seedSessions.length === 1 ? "" : "s"} and their essays.`,
    };
  },
});
