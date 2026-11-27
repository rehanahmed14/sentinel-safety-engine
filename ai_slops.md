55 
Here are 55 real, famous, and widely recognized design, copy, and code patterns documented across web 
design communities (Twitter/X, Reddit r/webdev, Hacker News, and design blogs) that make a website instantly 
recognizable as "vibe coded" or "AI slop". 
I. The Hero Section Clichés (Above-the-Fold) 
1. The Floating Pill Badge with Sparkle Emoji: A small pill centered at the very top with 
✨
 Introducing 
AI 2.0 → or New Feature Announcement, often with a glowing 1px border and a pulsing dot. 
2. The 3-Word Vague Mega-Headline: Generic headlines like "Supercharge Your Workflow", "Scale 
Effortlessly with AI", or "The Future of [Industry], Today". 
3. The Two-Word Gradient Text: Exactly two words in the headline wrapped in a purple-to-blue or 
orange-to-pink gradient (bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text 
text-transparent). 
4. The Centered "AI Stack" Formula: The exact same vertical hierarchy on 90% of AI sites: Pill Badge → 
Huge Title → 2-line Subtitle starting with "Empower your team..." → Dual CTA buttons → Trust 
badge/avatar stack. 
5. The Angled 3D Isometric Dashboard Preview: A faux SaaS dashboard tilted back in 3D perspective 
using CSS transforms (rotateX(12deg) scale(0.95)), surrounded by a blurred shadow. 
6. The Radial "Glow Orb" / Mesh Gradient: A massive blurry circular spotlight (blur-[120px]) sitting 
directly behind the center hero text. 
7. The Faux Prompt / Search Bar: An interactive-looking input in the hero with a blinking cursor and 
placeholder like "Type what you want to build...", but it either triggers a canned animation or leads nowhere. 
8. The Infinite Greyscale Logo Marquee: A continuous scrolling carousel of Fortune 500 company logos 
(Stripe, Netflix, Meta, Google) labeled "Trusted by innovative teams worldwide", even for a product 
launched yesterday. 
9. The Stacked Avatar Pill with Fake Rating: 4 to 5 overlapping circular headshots next to ★★★★★ 
4.9/5 from 10,000+ happy users. 
II. Visual Effects & Theme Tells (The "Aceternity / Shadcn" Uniform) 
10. The Default "Linear / Raycast" Dark Mode: Dark backgrounds that are never true black (#000000), but 
always Tailwind’s bg-neutral-950, bg-zinc-900, or bg-slate-950. 
11. The Border Beam / Glowing Border Light: A moving gradient dot that traces the 1px perimeter of cards in 
a continuous loop (a hallmark of libraries like Aceternity and Magic UI). 
12. The SVG Dot / Grid Background Mask: A subtle grey grid or dotted matrix masked with a radial fade so it 
only appears in the center of the viewport. 
13. Overdone Glassmorphism: backdrop-blur-md bg-white/5 border border-white/10 applied 
to every single card, navbar, modal, and footer. 
14. Cursor-Following Spotlight Cards: Cards where hovering reveals a radial gradient following the mouse 
coordinates. 
15. The "Biege / Editorial Linen" Alternative: The light-mode variant of AI slop: #FBFAF6 cream background, 
serif headings (Playfair/Editorial), tracked-out monospace tags, and burnt orange accents. 
16. Dark Mode Toggle with Broken Light Mode: A sun/moon toggle in the navbar that, when toggled to light 
mode, displays unstyled white backgrounds with unreadable grey or white text. 
17. Float / Drift Animations: Floating icons (cubes, cylinders, or logos) bobbing up and down in the 
background using CSS keyframes float. 
18. The "Glow Button": Primary action buttons with an intense drop-shadow matching their background color 
(shadow-[0_0_25px_rgba(124,58,237,0.5)]). 
III. Typography & Text Formatting Tells 
19. Default Inter / Geist Monoculture: Zero typographical personality—almost always defaulting to Inter, 
Geist Sans, or system sans-serif. 
20. Aggressive Monospace Labeling: Putting non-code elements (categories, dates, pricing tiers, badges) in 
font-mono to force a "developer / cyber" aesthetic. 
21. Tracked-Out Uppercase Micro-Labels: Tiny text-[10px] sm:text-xs uppercase 
tracking-widest font-semibold placed above every single section. 
22. Inconsistent Vertical Rhythm: A jump from a massive text-6xl headline down to text-xs with no 
middle typographic hierarchy. 
23. The Strikethrough Copy Gimmick: Headings structured as: "Stop wasting hours on manual reports. Start 
automating." 
24. Unstyled Multilingual Fallbacks: AI-generated foreign language text (e.g., Kannada, Japanese) falling 
back to generic system fonts that don't match the English weight or baseline. 
IV. Copywriting & Linguistic "ChatGPT Tells" 
25. The ChatGPT "Vocabulary Bingo": Prominent appearance of words like "Delve", "Robust", "Seamless", 
"Leverage", "Tapestry", "Game-changer", and "Supercharge". 
26. The Em-Dash (—) Addiction: Frequent use of em-dashes for dramatic marketing pauses: "Not just 
another CRM—a whole new paradigm." 
27. The "It's Not X, It's Y" Template: Contrastive phrasing: "This isn't just a database. It's your unfair 
advantage." 
28. The Rule-of-Three Triplet: Subheadings and bullets structured in groups of three: "Built for speed, crafted 
for precision, designed for scale." 
29. Platitudes Without Product Specifics: High-level corporate copy that leaves visitors confused about what 
the software actually does (e.g., "Unleash exponential synergy across your workflows"). 
30. Uniform Sentence Lengths: Monotonous cadence where every paragraph is precisely two sentences and 
~32 words long. 
31. Robotic FAQ Openers: FAQ accordions starting with "Certainly!", "Absolutely!", or "We understand how 
important...". 
32. Fake Feature Names Ending in "AI": "SmartFlow AI", "InsightEngine AI", "OmniSync AI". 
V. Layout & Structural Repetition 
33. The Bento Box Grid: A 3x2 or 4-box asymmetric grid where one card has a fake mini-chart, one has a 
toggle switch, and one has an animated icon. 
34. The "Rule-of-Three" Feature Cards: Exactly three identical cards side-by-side with an icon in a rounded 
square at the top, a bold heading, and a two-sentence explanation. 
35. The 3-Step "How It Works" Timeline: 1) Connect your tools → 2) Let AI do the magic → 3) See 10x 
results, connected with faint dashed lines. 
36. The Standardized SaaS Pricing Matrix: Exactly three tiers (Free / Pro / Enterprise), with the middle "Pro" 
tier highlighted with a glowing border and a "Most Popular" badge. 
37. The Monthly/Annual 20% Discount Toggle: A pill toggle above the pricing table with an animated green 
or purple "Save 20%" badge. 
38. The Vanity Metric Bar: 4-column stat block with unverified round numbers: 99.9% Uptime, 10x 
Faster, 50M+ API Requests, 24/7 Support. 
39. The "Ready to Get Started?" Callout: A centered banner near the footer with an email input, a button, 
and a small caption: "No credit card required • 14-day free trial". 
40. The Sprawling 4-Column Footer on a One-Page App: Columns for "Product", "Company", "Resources", 
and "Legal", where 90% of the links route to # or reload the home page. 
41. Unmodified Shadcn/UI Component Fingerprints: Stock Shadcn primitives dropped into the page without 
custom styling (the default Accordion chevron, Dialog sheet, or Tabs pill slider). 
VI. Social Proof & Credibility Indicators 
42. AI-Generated Testimonial Avatars: Perfectly centered Midjourney/ThisPersonDoesNotExist face portraits 
with smooth skin and blurry, incoherent backgrounds. 
43. Generic Testimonial Job Titles: Testimonials from "Alex M., Head of Growth at TechCorp" or "Sarah T., 
Lead Engineer at Stealth Startup". 
44. The Fake Twitter/X "Wall of Love": A masonry layout of faux tweets praising the product, all using 
identical enthusiastic phrasing. 
45. "As Featured On" Logos of Outlets That Never Mentioned Them: Logos of Forbes, TechCrunch, 
Bloomberg, and Product Hunt #1 without any clickable links to real articles. 
46. Unmodified Boilerplate Legal Policies: Privacy policy or Terms pages containing placeholder text like 
[Company Name, LLC] or referring to Delaware jurisdiction for an offshore project. 
VII. Interactivity, Animations & Gimmicks 
47. Stacking Too Many Aceternity Gimmicks: Having background meteor showers, animated grid beams, 
floating 3D pins, and text sparkles all firing on the same viewport. 
48. The Mock Terminal Typing Script: A fake terminal window in the hero running $ npx 
create-vibe-app... [Done in 12ms]. 
49. Scroll-Jacking / Forced Zooming: Scroll triggers that hijack native scrolling to tilt or expand a card, 
causing lag on mobile devices. 
50. Sticky Hover States on Touchscreens: Desktop hover effects (like hover:scale-105 or opacity shifts) 
that stay active on mobile screens after tapping. 
51. Dead UI Controls: Toggles, search boxes, filter chips, or tab buttons that have smooth animations but do 
not filter or change any underlying data. 
52. Non-Functional Mobile Drawers: Hamburger menus that animate into an 'X', but fail to close when an 
anchor link is tapped. 
VIII. Code-Level "Vibe Coding" Indicators 
53. Tailwind "Class Soup": 50-class long strings on a single div (className="relative flex h-full 
w-full items-center justify-center rounded-2xl border border-neutral-800 
bg-neutral-900/50 p-6 backdrop-blur-xl shadow-[0_0_20px_rgba(255,255,255,0.05)] 
hover:border-neutral-700...") generated by AI prompting. 
54. Single-File Monolithic Page Files: 2,000+ line components containing inline SVGs, layout sections, and 
hardcoded mock data in one file. 
55. Inline SVG Icons: Pages with dozens of 20-line hardcoded <svg><path ... /></svg> blocks instead 
of using a unified icon package like lucide-react. 
56. Unused Dependencies in package.json: Bundling packages like framer-motion, three, 
canvas-confetti, and multiple UI libraries when only one icon is used. 
57. No Error Boundaries: Complete lack of error boundaries or loading states—any API timeout or network 
failure causes the entire page to crash to white. 
58. Hardcoded Mock Arrays: Arrays of dummy data with hardcoded dates like "2024-01-15T08:00:00Z" 
with zero real dynamic data fetching. 
50 
50 more honest, hyper-specific, and unforgiving tells that scream "vibe-coded AI slop" to developers, 
designers, and discerning users. 
These are grouped into the deeper layers of a website: accessibility failures, fake state management, 
responsive design breakdowns, code rot, security hazards, and product hollow-ness. 
I. Accessibility (a11y) & Interaction Crimes 
AI visual models optimize for how a screenshot looks, completely blind to how a human or screen reader actually 
interacts with the DOM. 
1. The <div> Button Epidemic: Interactive clickable elements built entirely out of <div onClick={...}> 
with no role="button", no tabIndex={0}, and no keyboard Enter/Space listeners. Keyboard users 
cannot navigate the site at all. 
2. Invisible Keyboard Focus Rings: Slapping focus:outline-none across inputs and buttons without 
replacing it with an accessible focus-visible:ring-2 focus ring. Tabbing through the site turns the 
user into a ghost. 
3. Zero ARIA Labels on Icon-Only Buttons: Social media icons, theme toggles, close buttons (X), and 
mobile hamburger menus rendered as <button><svg .../></button> with zero aria-label or 
<title>, rendering them completely silent to screen readers. 
4. Low-Contrast "Aesthetic" Grey Text: Subheadings and descriptions set to text-neutral-400 or 
text-zinc-500 against dark backgrounds (#09090b), failing WCAG AA 4.5:1 contrast ratios because 
the AI prioritizes a "sleek, muted" look over actual readability. 
5. No aria-expanded on Accordions and Drawers: Dropdowns, mobile menus, and FAQ accordions 
animate smoothly with CSS, but screen readers are never notified whether the element is collapsed or 
expanded. 
6. Missing Image alt Tags or AI Hallucinated alt: Images either have alt="", alt="hero image", or 
AI-generated descriptions that read like computer-vision labels: "A group of multicultural business 
professionals sitting around a modern conference table with laptops." 
7. Trapped Modal Focus: Modals and sheets open over the screen, but keyboard focus stays on the 
elements behind the backdrop, allowing users to accidentally tab and click buttons under the dimmed 
overlay. 
8. The Broken Sticky Navbar Jump: Sticky headers (sticky top-0) that don't account for anchor offset 
scroll margins, so clicking any internal #section link scrolls the heading directly under the fixed navbar, 
hiding the title completely. 
II. Fake State Management & The "Empty Backend" Illusion 
Vibe-coded prototypes excel at simulating high-tech software, but the moment you poke behind the curtain, it's 
cardboard. 
9. The console.log("Submitted!") Form: Contact forms, waitlist inputs, and lead-gen bars that have no 
backend, no database, and no email service—they just run e.preventDefault(), show a fake green 
toast notification "Thanks for reaching out!", and log the object to the browser console. 
10. Hardcoded Random Delay Promises: Mock loaders simulating "complex AI processing" using 
setTimeout(() => setLoading(false), 2000) to make simple static UI transitions feel like "deep 
algorithmic computing." 
11. Local State That Clears on Refresh: Dashboards where you can add tasks, toggle settings, or switch 
tabs, but pressing F5 instantly purges everything back to the hardcoded initial array because no persistent 
database or cache exists. 
12. The Fake Search Filter: A search input that looks like a live vector query bar, but the JavaScript is literally 
items.filter(i => i.title.toLowerCase().includes(query.toLowerCase())) matching 
against an array of 4 hardcoded objects. 
13. Phantom Dashboard Pagination: A pagination footer showing < 1 2 3 4 5 > or "Showing 1-10 of 
1,420 entries", but clicking Page 2 does nothing or keeps displaying the exact same 5 hardcoded dummy 
rows. 
14. Dead Notification Bells: A notification bell icon in the top right with a persistent red unread badge (3) that 
either does nothing on click or opens a static dropdown with notifications dated "2 hours ago" that never 
change. 
15. The Unclosable Toast Cascade: Notification toasts that stack endlessly in the bottom-right corner with no 
timeout auto-dismissal, overlapping the footer until you manually refresh. 
III. Responsive Design & Mobile Breakdowns 
AI tools generate code inside high-resolution desktop viewports. On odd-sized mobile screens, the geometry falls 
apart. 
16. The Unintentional Horizontal Scrollbar (The overflow-x Sin): Viewing the page on mobile reveals a 
side-to-side wobble because an unconstrained element (usually a decorative background glow, marquee, 
or absolute-positioned 3D element) has a fixed width of w-[600px]. 
17. The "Everything Stacked Vertically" Mobile Collapse: A complex 4-column Bento grid that clumsily 
degrades on mobile into a boring, endless single-column scroll of 18 identical grey boxes that takes 30 
seconds of thumb scrolling to pass. 
18. Unreadable Fixed Font Sizes on Mobile: Giant hero headlines set to fixed pixel sizes (text-[72px]) 
without responsive fluid clamps (clamp()) or breakpoints (sm:text-5xl), resulting in a single word 
breaking across three hyphenated lines on iPhone screens. 
19. Broken Mobile Tap Targets: Buttons, pills, and navigation links styled at px-2 py-1 text-[10px] that 
are nearly impossible to accurately press with a human thumb, causing accidental mis-clicks. 
20. Mobile Menu Scroll Lock Leaks: Opening the mobile navigation drawer prevents background scrolling, 
but closing it fails to remove overflow: hidden from document.body, leaving the entire website 
permanently frozen. 
21. The Sticky Mobile CTA Covering Content: A fixed bottom banner ("Download the App" or "Get Started") 
that covers up form submit buttons, footer links, or essential content on smaller mobile screens. 
IV. Code Rot & Developer "Vibe Coding" Fingerprints 
Open the Chrome DevTools or inspect the repo, and the AI authorship is stamped on every line. 
22. The Single-File 3,000-Line Component (MegaPage.tsx): The AI was never prompted to refactor, so the 
entire page—navbar, hero, 5 bento grids, 12 SVG icons, modals, and footer—is crammed into one gigantic, 
unmaintainable source file. 
23. The any Type Hall of Fame: In TypeScript projects, every function parameter, event handler, and API 
response is typed as (e: any) or : Promise<any> to silence compiler errors instead of defining real 
interfaces. 
24. Copy-Pasted 40-Line Inline SVGs: Instead of importing a standard, optimized icon library 
(lucide-react, heroicons), the file contains dozens of sprawling, raw SVG code blocks with 
unoptimized path coordinates. 
25. The "Tailwind Utility Avalanche": Elements with 45 utility classes strung together 
(className="relative flex h-12 w-full items-center justify-between rounded-xl 
border border-white/10 bg-gradient-to-br from-neutral-900 via-neutral-900 
to-neutral-950 px-4 py-2 text-xs font-semibold text-white 
shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-all duration-300 
hover:border-violet-500/50 hover:shadow-[0_0_30px_rgba(139,92,246,0.3)] 
focus:outline-none focus:ring-2 focus:ring-violet-500 ..."). 
26. Conflicting CSS Declarations: Utility strings containing blatant internal contradictions that the AI didn't 
catch, like flex block, text-left text-center, or p-4 px-2. 
27. Z-Index Arms Race: Arbitrary, desperate z-index values (z-[999], z-[9999], z-[99999]) pasted on 
modals and toolbars to solve stacking context bugs created by random relative and transform 
wrappers. 
28. Dependency Bloat in package.json: Installing framer-motion, gsap, three.js, lucide-react, 
radix-ui, and tailwind-merge just to render a landing page with a static button and a marquee. 
V. SEO, Metadata & Branding Laziness 
The absolute quickest way to spot an AI site is to look at the browser tab and social share card. 
29. The Default Framework Favicon: Leaving the default Vite, Next.js, or Vercel triangle icon in 
favicon.ico. 
30. The Placeholder Browser Tab Title: Browser title left as "Vite + React + TS", "Create Next App", or "Home 
| My Project". 
31. Missing OpenGraph (OG) Social Cards: Sharing the URL on Twitter/X, iMessage, or WhatsApp shows a 
blank grey box with no title, no preview image, and no description. 
32. Hallucinated Canonical Tags: <link rel="canonical" href="https://example.com" /> or 
<meta property="og:url" content="http://localhost:3000" /> left verbatim from 
boilerplates. 
33. Single <h1> Tag Violations: Either zero <h1> tags on the page, or every section title wrapped in an <h1> 
because the prompt told the AI to "make each section title big and bold." 
34. Broken robots.txt and sitemap.xml: Completely missing sitemaps, or robots files that inadvertently 
block web crawlers with Disallow: /. 
VI. Form Handling & Input Flaws 
Real production forms require validation, input masks, and sanitization. AI forms are paper-thin. 
35. Accepting Garbage Data: Form inputs with no validation beyond HTML5 required. Submitting "asdf" 
into an address field, "12345" into a name field, or a phone number with 3 digits goes through without 
warning. 
36. Date Pickers That Allow Year 1800 or 2099: Date of birth inputs that let users select tomorrow's date or 
pick the year 1824 because no min or max constraints were coded. 
37. Zero File Upload Feedback: Clicking an image upload button doesn't show upload progress, file size 
validation, or error handling if a user attempts to upload a 50MB video or executable file. 
38. Uncontrolled vs. Controlled React Form Warnings: Opening the developer console reveals dozens of 
yellow React warnings: "A component is changing an uncontrolled input to be controlled." 
39. The Double-Click Duplicate Submission: Submit buttons that aren't disabled during network transit, 
allowing users to spam-click the button and trigger multiple concurrent API requests. 
VII. Security & Network Incompetence 
The dangerous side of vibe coding—shipping prototypes directly to production without understanding security. 
40. Leaked API Keys in Client Bundles: Storing third-party secret keys (OpenAI, Supabase Service Role, 
Stripe Secret) inside client-facing environment variables (VITE_OPENAI_KEY or 
NEXT_PUBLIC_SECRET_KEY) that anyone can extract from browser DevTools network tabs. 
41. Exposed Direct Database Queries on Client: Calling database updates directly from frontend 
components without an authenticated backend API gateway or Postgres Row-Level Security (RLS). 
42. Unsanitized HTML Rendering (dangerouslySetInnerHTML): Rendering raw strings directly into the 
DOM to support markdown or formatting, opening the door wide to cross-site scripting (XSS). 
43. Zero Rate Limiting: Public APIs and contact endpoints with no IP rate limiting or captcha, allowing bot 
scrapers to drain the owner's email or database quotas in minutes. 
44. Permissive CORS Wildcards: Backend servers configured with Access-Control-Allow-Origin: * 
across administrative and sensitive endpoints. 
VIII. Product & Business Hollow-Ness (The Fake SaaS Trope) 
The overall uncanny feeling that the product was thought up by an algorithm rather than someone solving a real 
human problem. 
45. The "Waitlist to Nowhere": The entire website is a massive marketing funnel for a product that doesn't 
exist, where every single CTA button—"Start Free Trial", "View Demo", "Log In", "Pricing"—leads to the 
exact same generic waitlist email modal. 
46. Stock Uncanny 3D Glass Icons: The exact same set of glossy 3D clay-render icons (a floating purple 
calendar, a glowing credit card, a 3D isometric lock) seen on hundreds of other AI generator templates. 
47. Unrealistic "Before and After" Visuals: A toggle showing "Before [Tool]: Messy, red, chaotic 
spreadsheet" versus "After [Tool]: Glowing, clean, perfectly organized purple charts". 
48. The "Integrates With Everything" Wall: A grid of 24 logos (Slack, Jira, Salesforce, Notion, GitHub, Figma) 
claiming "Seamless integrations with your existing stack", when in reality, the product doesn't even have an 
API. 
49. The Cookie-Cutter Comparison Table: A table comparing "Our App" vs "Competitor X", where Our App 
has green checkmarks across all 15 arbitrary categories (including "Has AI", "Modern Architecture"), while 
Competitors have red X marks on everything. 
50. The Dead "Changelog / Blog": A blog or changelog section with three posts: "Hello World", "Why AI is the 
Future", and "Introducing Version 1.0", all published on the same day with no updates since. 