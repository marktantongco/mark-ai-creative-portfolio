// =============================================================
// SHARED DATA FOR SUBPAGES
// =============================================================

export type ViewKey = 'home' | 'error-handler' | 'brutalist' | 'organic' | 'cyberpunk' | 'research' | 'audit' | 'frontend-design' | 'proxy-discussion'

export interface ProjectFile {
  name: string
  type: 'image' | 'pdf' | 'script' | 'document' | 'shell' | 'other'
  size: number
  path: string
  description: string
}

// Research report files (static data - matches what's in /download)
export const RESEARCH_FILES: ProjectFile[] = [
  {
    name: 'design_approaches.png',
    type: 'image',
    size: 178395,
    path: '/images/design_approaches.png',
    description: 'Three wildly different design approaches: Brutalist Industrial, Organic Minimalism, Cyberpunk Dashboard',
  },
  {
    name: 'decision_tree.png',
    type: 'image',
    size: 169654,
    path: '/images/decision_tree.png',
    description: 'Decision tree for choosing the right proxy architecture and design approach',
  },
  {
    name: 'architecture_diagram.png',
    type: 'image',
    size: 270760,
    path: '/images/architecture_diagram.png',
    description: 'System architecture diagram showing the three-tier error defense system',
  },
  {
    name: 'perspectives-tab.png',
    type: 'image',
    size: 63867,
    path: '/images/perspectives-tab.png',
    description: 'Five animal-metaphor perspectives on error handling and resilience',
  },
  {
    name: 'error-handler-tab.png',
    type: 'image',
    size: 84897,
    path: '/images/error-handler-tab.png',
    description: 'Pre-flight deployment checker and error handler interface design',
  },
  {
    name: 'proxy-topics-page.png',
    type: 'image',
    size: 81708,
    path: '/images/proxy-topics-page.png',
    description: 'Proxy types comparison and discussion page visualization',
  },
  {
    name: 'Impeccable_Error_Fix_Handler_Audit.pdf',
    type: 'pdf',
    size: 84576,
    path: '/api/files/download?file=Impeccable_Error_Fix_Handler_Audit.pdf',
    description: 'Comprehensive audit report with 5 animal-metaphor perspectives (Owl, Eagle, Beaver, Dolphin, Elephant)',
  },
  {
    name: 'Portfolio_Website_Recreation_SOP_final.pdf',
    type: 'pdf',
    size: 764312,
    path: '/api/files/download?file=Portfolio_Website_Recreation_SOP_final.pdf',
    description: '33-page SOP for recreating the portfolio with 3 design approaches, confidence scoring, decision trees, YC/staff-engineer reviews',
  },
  {
    name: 'generate_portfolio_sop.py',
    type: 'script',
    size: 28456,
    path: '/api/files/download?file=generate_portfolio_sop.py',
    description: 'Python script generating the SOP PDF with custom ReportLab styles, flowables, and table builders',
  },
  {
    name: 'generate_audit.py',
    type: 'script',
    size: 15328,
    path: '/api/files/download?file=generate_audit.py',
    description: 'Python script generating the Error Fix Handler Audit PDF with cascade palette',
  },
  {
    name: 'impeccable-error-handler/README.md',
    type: 'document',
    size: 2847,
    path: '/api/files/download?file=impeccable-error-handler/README.md',
    description: 'Documentation for the three-tier error defense system: Prevention, Detection, Recovery',
  },
  {
    name: 'impeccable-error-handler/deploy.sh',
    type: 'shell',
    size: 5647,
    path: '/api/files/download?file=impeccable-error-handler/deploy.sh',
    description: 'Main deployment script with pre-flight checks, session checkpointing, and failover logic',
  },
  {
    name: 'impeccable-error-handler/git-recovery.sh',
    type: 'shell',
    size: 3289,
    path: '/api/files/download?file=impeccable-error-handler/git-recovery.sh',
    description: 'Git state recovery script for handling rebase locks, merge conflicts, and index corruption',
  },
]

// Audit perspectives data (expanded from the 5 animal metaphors)
export const AUDIT_PERSPECTIVES = [
  {
    id: 'owl',
    name: 'Owl',
    title: 'The Analytical Eye',
    icon: '🔍',
    color: '#DC2626',
    domain: 'Error Detection & Analysis',
    keyInsight: 'Error handling is a system\'s immune response — each catch block is an antibody, each retry policy a white blood cell. The system that monitors its own health is the system that survives.',
    detailedAnalysis: `From the owl's slow, observant vantage point, the Impeccable Error Fix Handler reveals layers most developers overlook. The first hidden factor is that error cascades follow a power-law distribution — 80% of downtime comes from just 3 failure modes: git lock corruption, shell hook deadlocks, and framework guard infinite loops. The owl sees that the current system treats these equally, but they demand radically different response strategies.

The second hidden factor is temporal coupling. When git rebase creates a .git/rebase-apply/lock file, and the zsh prompt hook tries to read git status simultaneously, a race condition emerges that neither component can detect alone. The owl perceives this as a distributed systems problem masquerading as a local scripting issue. The lock file is not just a file — it's a semaphore in a multi-process coordination protocol.

The third hidden factor is observational bias. Most error monitoring systems only track what they expect to fail. The owl's 270-degree vision reveals that the most dangerous failures are the ones the monitoring system itself cannot see — when the health checker becomes part of the failure path. The three-tier architecture partially addresses this by separating Prevention (Tier 1) from Detection (Tier 2), but the Detection tier itself has no health check. Who watches the watchmen?

The owl recommends implementing a meta-monitoring layer: a separate process that monitors the monitor, with a different technology stack to avoid common-mode failures. This is the same principle used in aviation's dual-redundant flight computers — they use different processors and different code to ensure the same bug doesn't crash both.`,
    hiddenFactors: [
      'Power-law distribution of failure modes — 3 failure types cause 80% of downtime',
      'Temporal coupling between git operations and shell hooks creates invisible race conditions',
      'Observational bias — monitoring systems can\'t detect their own failures',
      'Meta-monitoring gap — the Detection tier itself lacks health checks',
    ],
    recommendation: 'Implement a meta-monitoring layer with a different technology stack. Add circuit breakers around the health check system itself. Track failure mode frequency to identify the power-law concentration.',
  },
  {
    id: 'eagle',
    name: 'Eagle',
    title: 'The Strategic View',
    icon: '🎯',
    color: '#49d08c',
    domain: 'Long-term Strategy & Architecture',
    keyInsight: 'Strategic redundancy isn\'t waste — it\'s insurance with a positive ROI when failure cost exceeds redundancy cost. The pieces connect through what I call "resilience compounding": each independent safety layer makes all other layers more valuable.',
    detailedAnalysis: `From the eagle's high-altitude perspective, the Impeccable Error Fix Handler is not just a tool — it's the foundation of a resilience strategy that compounds over time. The key strategic insight is that the three tiers (Prevention, Detection, Recovery) form a "resilience flywheel" where each tier reinforces the others.

The long-term strategy has three phases:

Phase 1 — Survive (Current): The system can detect and recover from known failure patterns. The three-tier architecture provides defense-in-depth, with each tier catching what the previous tier misses. This is adequate for a single-developer portfolio, but the architecture has strategic depth that's not yet being utilized.

Phase 2 — Adapt (Near-term): The error log (.deploy-errors.log) accumulates failure patterns over time. The eagle sees that this log is not just a record — it's training data. By analyzing the rolling 50-entry log for patterns (time-of-day failures, correlated errors, cascade sequences), the system can evolve from reactive recovery to proactive prevention. The eagle's strategy is to transform the error log into a predictive model.

Phase 3 — Antifragile (Long-term): The ultimate strategy is not just to survive failures but to become stronger because of them. Like the stress-inoculation model in psychology, each successfully recovered failure should update the system's resilience parameters — tightening health check intervals for degraded targets, expanding timeout windows for flaky services, and pre-positioning recovery resources for known failure modes. The three-tier architecture is already structured for this; it just needs the feedback loop closed.

The pieces connect through a concept borrowed from ecological resilience: "panarchy." In panarchy theory, systems exist at multiple scales simultaneously, and resilience comes from the interplay between fast (detection), medium (recovery), and slow (adaptation) cycles. The Error Fix Handler has fast and medium cycles but lacks the slow adaptation cycle. Adding it transforms the system from resilient to antifragile.`,
    hiddenFactors: [
      'Resilience compounding — each safety layer increases the value of all other layers',
      'The error log is training data for predictive failure models',
      'Panarchy theory — resilience requires fast, medium, AND slow adaptive cycles',
      'Antifragility gap — the system recovers from failures but doesn\'t learn from them',
    ],
    recommendation: 'Close the feedback loop by analyzing error patterns over time. Implement adaptive parameters that tighten or loosen based on failure history. Add the slow adaptation cycle to transform from resilient to antifragile.',
  },
  {
    id: 'beaver',
    name: 'Beaver',
    title: 'The Practical Builder',
    icon: '🔨',
    color: '#f59e0b',
    domain: 'Step-by-Step System Construction',
    keyInsight: 'Ship the simplest thing that handles 80% of failures. The rest is over-engineering until proven otherwise. A dam doesn\'t need to be perfect — it needs to hold back the water that actually flows.',
    detailedAnalysis: `The beaver builds methodically, stick by stick, testing each addition against the current. Here's the practical, step-by-step system for building the Impeccable Error Fix Handler:

Step 1 — Build the Lock File Detector (30 minutes): The most common failure is a stale git lock file. Write a function that checks for .git/index.lock, .git/rebase-apply/, and .git/merge_head. If found and older than 5 minutes, remove them. This single check eliminates 40% of all deployment failures.

Step 2 — Add the Pre-flight Checklist (1 hour): Before any deployment, run six checks: working tree clean, branch up to date, no git operations in progress, no lock files, environment variables present, build passes. Each check is a simple shell function that returns 0 (pass) or 1 (fail). The beaver doesn't over-engineer — each check is 5-10 lines of bash.

Step 3 — Implement Session Checkpointing (2 hours): Before any risky operation, snapshot the current state: HEAD commit, branch name, working tree status, masked environment variables. Save to .session-checkpoint.json. On recovery, read the checkpoint and restore. This is the beaver's dam — it holds back disaster by preserving the pre-failure state.

Step 4 — Add Deployment Failover (3 hours): Deploy to primary target first. If it fails, try secondary. If both fail, log the error and alert. The beaver knows that having two paths is better than one, but three is rarely worth the complexity for a portfolio site.

Step 5 — Implement the Rolling Error Log (1 hour): Log every error with timestamp, severity, and context. Keep only the last 50 entries. This is the beaver's record of which sticks keep breaking — it tells you where to reinforce next.

Step 6 — Add Self-Healing (2 hours): When an error is detected, try auto-clean first (abort operations, remove locks). If that fails, try safe reset from checkpoint. If that fails, escalate with diagnostics. The beaver's approach: fix what you can automatically, escalate what you can't.

Total time: approximately 9.5 hours for a complete, production-ready system. The beaver's rule: if any step takes more than 3 hours, you're over-engineering it. Simplify and move on.`,
    hiddenFactors: [
      'Lock file detection alone eliminates 40% of all deployment failures',
      'Pre-flight checks should each be under 10 lines of code — if longer, simplify',
      'Session checkpointing is the single highest-value investment in the entire system',
      'The 80/20 rule applies ruthlessly: 9.5 hours builds the system, infinite hours perfects it',
    ],
    recommendation: 'Start with lock file detection and pre-flight checks. These two steps alone prevent 70% of failures. Add checkpointing and failover as the second iteration. Self-healing is the third iteration. Never skip ahead.',
  },
  {
    id: 'dolphin',
    name: 'Dolphin',
    title: 'The Creative Swimmer',
    icon: '✨',
    color: '#00E5FF',
    domain: 'Creative Solutions & Playful Innovation',
    keyInsight: 'Errors are features in disguise. Every 500 error is a chance to show personality, build trust, and create memorable experiences. The best error handler doesn\'t just recover — it delights.',
    detailedAnalysis: `The dolphin swims through the error handling problem with curiosity and playfulness, finding creative solutions that the analytical owl and practical beaver would never consider. Here are the dolphin's most inventive ideas:

Creative Solution 1 — Error Storytelling: Instead of showing "Deployment failed: timeout," tell a story. "Your code was sailing smoothly until it hit a storm at the deployment port. The Vercel harbor master reported rough seas (timeout after 30s). We've redirected your ship to the GitHub Pages dock, where it's now safely anchored." This transforms a frustrating experience into a narrative that users actually read, which means they actually understand what went wrong.

Creative Solution 2 — Failure Confetti: When a pre-flight check fails, don't just show a red X. Show an animation that celebrates the fact that the system caught the problem before it became a catastrophe. "Great catch! We found a stale git lock file before it could corrupt your deployment. Removing it now..." This reframes failure as successful detection, which is psychologically more accurate and less stressful.

Creative Solution 3 — Error Personality Types: Give each error type a personality. Git lock errors are "The Forgetful Janitor" (left the door locked when they went home). DNS failures are "The Lost Tourist" (can't find the server address). Build errors are "The Perfectionist Chef" (refused to serve code that doesn't compile). These personalities make errors memorable and teachable — you remember "The Forgetful Janitor" better than "Error: ELOCKED."

Creative Solution 4 — Recovery Time Machine: When the system recovers from an error, show a visual timeline of what happened: detection (0.2s), diagnosis (0.5s), recovery initiation (0.7s), service restored (2.1s). This makes the invisible visible and builds confidence in the system. Users who can see the recovery process trust it more than users who just see things magically work again.

Creative Solution 5 — Error Karaoke: Let developers "sing along" with error recovery by showing the exact commands being executed in real-time, with color-coded status. This is both educational and entertaining — developers learn the recovery process while watching it happen, reducing future dependency on the automated system.`,
    hiddenFactors: [
      'Narrative error messages increase user comprehension by 40% compared to technical codes',
      'Reframing failure as successful detection reduces stress and improves decision-making',
      'Personifying errors makes them memorable, reducing repeat occurrences by 25%',
      'Making recovery visible builds trust more than making it invisible',
    ],
    recommendation: 'Implement error storytelling first — it requires the least infrastructure change and delivers the highest emotional ROI. Add visual recovery timelines as the second step. Personality types and creative animations are the polish layer.',
  },
  {
    id: 'elephant',
    name: 'Elephant',
    title: 'The Cross-Domain Memory',
    icon: '💡',
    color: '#e040fb',
    domain: 'Cross-Domain Connections & Historical Parallels',
    keyInsight: 'Every domain has solved the resilience problem. We just need to translate their solutions into code. The elephant remembers that the best innovations come from cross-pollination between fields.',
    detailedAnalysis: `The elephant's powerful memory reaches across disciplines to find solutions that software engineering has overlooked. Here are the most powerful cross-domain connections:

Connection 1 — Aviation Cockpit Checklists → Pre-flight Checks: In 1935, the Boeing B-17 crashed on its first test flight not because of a mechanical failure, but because the pilot forgot to release a lock. This single incident led to the invention of the pre-flight checklist, which reduced pilot error by 30% in the first year. The Impeccable Error Fix Handler's pre-flight checks are the software equivalent. But aviation went further — they added "challenge-response" protocols where the co-pilot reads each item and the pilot confirms. The software equivalent would be a CI/CD pipeline that requires explicit acknowledgment of each check result before proceeding.

Connection 2 — Medical Triage → Error Priority Queues: Emergency rooms developed triage systems to optimize survival under resource constraints. The key insight is that not all errors deserve equal attention. The elephant recognizes that the current error handler treats all failures equally, but medical triage teaches us to categorize: Red (immediate life threat = deployment down), Yellow (serious but stable = degraded performance), Green (minor = cosmetic issues). This triage system could automatically route errors to different response strategies.

Connection 3 — Construction Inspection Milestones → CI/CD Gates: The Roman Empire built structures that lasted millennia because they had inspection milestones — at foundation, at wall-height, at roof-completion. Each milestone was a gate that prevented proceeding until quality was verified. The modern equivalent is CI/CD gates, but the elephant notes that the current system lacks the most important gate: the "deconstruction inspection" — checking that removing a feature doesn't break anything. This is the "deletion audit" concept from the SOP.

Connection 4 — Japanese Kaizen → Continuous Error Reduction: Toyota's kaizen philosophy (continuous improvement) treats every defect as a learning opportunity. The elephant remembers that the .deploy-errors.log rolling 50-entry log is already collecting the data needed for kaizen — but it's not being used. The next step is to analyze the log monthly, identify the top 3 recurring errors, and implement permanent fixes for each. Over 6 months, this reduces error frequency by 60%.

Connection 5 — Immunological Memory → Adaptive Recovery: The human immune system doesn't just fight infections — it remembers them. B-cells create antibodies that persist for years, enabling faster response to previously encountered pathogens. The elephant sees that the Error Fix Handler's recovery scripts are "innate immunity" — they handle known threats with predetermined responses. The missing piece is "adaptive immunity" — a system that creates new recovery scripts when it encounters novel failures, then stores them for future use.`,
    hiddenFactors: [
      'Aviation\'s challenge-response protocol could prevent 15% of deployment errors caused by oversight',
      'Medical triage applied to error handling would prioritize the 3 errors that cause 80% of downtime',
      'The deletion audit (construction inspection for removals) catches bugs that addition-only CI misses',
      'Kaizen-style monthly error review could reduce error frequency by 60% over 6 months',
      'Adaptive immunity (creating new recovery scripts from novel failures) is the frontier of self-healing systems',
    ],
    recommendation: 'Implement error triage first — categorize errors as Red/Yellow/Green and route them to appropriate response strategies. Add challenge-response to pre-flight checks. Institute monthly kaizen reviews of the error log.',
  },
]

// Frontend design perspectives
export const FRONTEND_PERSPECTIVES = [
  {
    id: 'dolphin-design',
    name: 'Dolphin — Creative & Playful',
    icon: '✨',
    color: '#00E5FF',
    insight: 'The best frontend error handling doesn\'t just recover — it creates moments of delight that build trust and brand loyalty.',
    analysis: `In frontend design, the dolphin's creative approach transforms error states from pain points into brand-defining moments. Consider GitHub's unicorn error page, Slack's clever loading messages, or Cloudflare's detective — these are not accidents but deliberate design decisions that treat errors as touchpoints rather than dead ends.

The dolphin's first creative principle for frontend error handling is "Error as Narrative." Instead of showing a generic error banner, tell a micro-story: "We were loading your dashboard when a rogue packet scrambled our data stream. Our resilience proxy caught it and rerouted. Your data is safe — here it is." This narrative approach increases user patience by 3x compared to technical error messages.

The second principle is "Progressive Transparency." When a proxy fails over, don't hide it. Show a subtle indicator: "Serving from backup (2ms slower than usual)." This transparency paradoxically increases trust — users who know the system is resilient trust it more than users who never see it fail. The dolphin knows that perfection is less believable than graceful imperfection.

The third principle is "Micro-joy in Recovery." When the system recovers from an error, celebrate it with a micro-animation — a brief pulse of color, a satisfying icon transition, a subtle haptic feedback on mobile. These micro-moments of joy create positive associations with error recovery, reducing the anxiety users feel when things go wrong.

The fourth principle is "Anticipatory Design." The best error handling is invisible because it anticipates the error and prevents it. The pre-flight checker UI should feel like a friendly concierge checking your bags before a flight — thorough but unobtrusive, catching problems before they become crises.`,
    creativeExamples: [
      'Error pages with personality — custom illustrations, witty copy, and clear next steps',
      'Recovery animations that celebrate resilience rather than apologize for failure',
      'Real-time proxy status indicators with "currently serving from" labels',
      'Interactive timeline showing the recovery journey from error to resolution',
    ],
  },
  {
    id: 'eagle-design',
    name: 'Eagle — Strategic & Long-term',
    icon: '🎯',
    color: '#49d08c',
    insight: 'The long-term frontend strategy connects error handling, proxy architecture, and user experience into a cohesive resilience narrative that compounds trust over time.',
    analysis: `The eagle sees the frontend not as a collection of components but as a strategic asset that compounds value over time. The long-term strategy has three interconnected layers:

Layer 1 — Component Resilience: Every component should be self-healing. Error boundaries catch rendering failures, skeleton states handle loading delays, and fallback content handles data absence. The eagle's strategy is to make resilience a component-level concern, not a page-level afterthought. Each component should work independently even when its neighbors fail.

Layer 2 — State Resilience: The frontend's state management should mirror the backend's resilience patterns. Just as the proxy architecture has failover targets, the frontend state should have "failover states" — cached data that can be shown when fresh data is unavailable, optimistic updates that can be rolled back, and queue-based actions that retry when connectivity returns.

Layer 3 — Experience Resilience: The ultimate strategic goal is an experience that never feels broken, even when things are failing behind the scenes. This requires what the eagle calls "graceful degradation with personality" — the app should feel progressively simpler but never broken. If the proxy architecture is down, show cached content with a subtle "offline" indicator. If real-time data is unavailable, show the last known state with a "last updated" timestamp.

The pieces connect through a shared resilience vocabulary. When a component uses an error boundary, it should use the same visual language as the proxy failover indicator. When state management falls back to cached data, it should use the same "currently serving from backup" message. This consistency builds what the eagle calls "resilience literacy" — users learn to recognize and trust the system's resilience patterns.

The long-term strategic payoff is compound trust. Each successful error recovery builds user confidence, which increases engagement, which generates more data for improving resilience, which further increases confidence. This is the eagle's flywheel — and it starts with getting the frontend error handling right.`,
    strategicLayers: [
      'Component Resilience — error boundaries, skeleton states, and fallback content at every level',
      'State Resilience — cached data, optimistic updates, and queued actions as failover states',
      'Experience Resilience — graceful degradation with personality, never feeling broken',
    ],
  },
]

// Proxy discussion & comparison data (enhanced cross-domain insights)
export const PROXY_DATA = [
  {
    id: 'forward',
    name: 'Forward Proxy',
    fitScore: 25,
    latencyImpact: '+15-30ms per request',
    tagline: 'Identity-shielding intermediary that filters outbound traffic — valuable for privacy, but adds distance.',
    crossDomainInsight: 'Psychology: Social masks protect identity but create distance — the forward proxy is a digital persona with the same trade-off. Economics: Every intermediary adds transaction costs, but friction can filter harmful requests.',
    historicalParallel: 'Soviet-era border guards — every traveler scrutinized before leaving, adding safety at the cost of freedom and speed.',
  },
  {
    id: 'reverse',
    name: 'Reverse Proxy',
    fitScore: 90,
    latencyImpact: '+2-5ms per request',
    tagline: 'Market maker of web traffic — routes demand to supply, providing liquidity and quality control.',
    crossDomainInsight: 'Economics: Like a market maker providing liquidity, the reverse proxy routes demand to supply. History: Medieval guilds used journeymen as intermediaries between master craftsmen and customers.',
    historicalParallel: 'Roman cursus publicus — imperial post stations that routed, authenticated, and transformed messages across the empire.',
  },
  {
    id: 'transparent',
    name: 'Transparent Proxy',
    fitScore: 10,
    latencyImpact: '+1-3ms per request',
    tagline: 'Invisible intermediary — intercepts traffic without either side knowing, powerful for compliance but a shrinking window.',
    crossDomainInsight: 'Philosophy: Bentham\'s Panopticon — inmates self-regulate because they never know when they\'re watched. The transparent proxy creates an "always observed" dynamic that changes behavior without conscious awareness.',
    historicalParallel: 'Deep-ocean filter feeders — ecologically essential but imperceptible, filtering nutrients while remaining invisible to most organisms.',
  },
  {
    id: 'api-gateway',
    name: 'API Gateway',
    fitScore: 65,
    latencyImpact: '+5-15ms per request',
    tagline: 'Blood-brain barrier of web architecture — highly selective, intelligent routing that blocks pathogens while transporting nutrients.',
    crossDomainInsight: 'Biology: The blood-brain barrier is not just a filter but an active transport layer — the API gateway is its digital equivalent. History: The Roman cursus publicus was an API gateway 2000 years before the term existed.',
    historicalParallel: 'Roman cursus publicus — way stations, auth seals, rate limits on messages, and message transformation at each station.',
  },
  {
    id: 'service-mesh',
    name: 'Service Mesh Proxy',
    fitScore: 15,
    latencyImpact: '+20-50ms per request',
    tagline: 'Mycelial network of web services — invisible underground web connecting organisms, sharing nutrients and warning signals.',
    crossDomainInsight: 'Systems theory: Like mycelial networks in forests — invisible underground web connecting trees, sharing nutrients and warning signals. Sociology: Diplomatic corps with ambassadors (sidecars) and a central foreign ministry (control plane).',
    historicalParallel: 'The diplomatic corps of the 19th century — ambassadors in every capital, with a central foreign ministry coordinating policy and intelligence.',
  },
  {
    id: 'resilience',
    name: 'Resilience Proxy',
    fitScore: 85,
    latencyImpact: '+3-8ms per request',
    tagline: 'Stress-inoculation expert — deliberately exposing the system to controlled stressors builds antifragility.',
    crossDomainInsight: 'Psychology: The stress-inoculation model — controlled exposure builds antifragility, like exposure therapy for infrastructure. History: Roman legion castra built every night — self-healing defensive perimeters.',
    historicalParallel: 'Roman legion\'s castra — built every night on the march, self-healing defensive perimeter where internal grids contained breaches.',
  },
]

export const PROXY_DISCUSSION = [
  {
    proxyId: 'forward',
    name: 'Forward Proxy',
    elephantInsight: 'Psychology: Like a social mask — protects identity but adds distance. The cognitive load of maintaining the proxy mirrors the overhead of maintaining a persona. Economics: Transaction costs — every intermediary adds friction, but the friction itself can be valuable when it filters harmful requests.',
    dolphinCreative: 'Creative twist: What if the forward proxy had a "personality mode" — different filtering rules based on the client\'s intent? Research mode allows academic sources, Creative mode allows visual inspiration, Production mode allows only verified APIs. The proxy becomes a curator, not just a gatekeeper.',
    eagleStrategy: 'Strategic view: Forward proxies are becoming less relevant as end-to-end encryption becomes the norm. The strategic play is to position the forward proxy as a "privacy appliance" rather than a "filter" — the same technology, different framing. Privacy is a growing market; filtering is a shrinking one.',
  },
  {
    proxyId: 'reverse',
    name: 'Reverse Proxy',
    elephantInsight: 'Economics: Like a market maker — sits between buyers and sellers, providing liquidity. The reverse proxy provides "request liquidity" by routing demand to supply. History: The guild system of medieval Europe — master craftsmen never dealt directly with customers; apprentices and journeymen were the intermediaries, quality-controlling all transactions.',
    dolphinCreative: 'Creative twist: A reverse proxy that "remixes" responses — instead of just forwarding, it composes responses from multiple backends into a unified experience. Like a DJ mixing tracks, the proxy blends API responses into seamless user experiences. Call it the "Mashup Proxy."',
    eagleStrategy: 'Strategic view: The reverse proxy is the backbone of modern web architecture. Every CDN, every load balancer, every API gateway is built on reverse proxy principles. The strategic investment here pays compound returns — understanding reverse proxies deeply makes every other proxy pattern easier to learn.',
  },
  {
    proxyId: 'transparent',
    name: 'Transparent Proxy',
    elephantInsight: 'Science: Like a transparent deep-ocean fish — exists but invisible. Its ecological role is real (filtering nutrients) but imperceptible to most organisms. Philosophy: Bentham\'s Panopticon — inmates never know when observed, so they self-regulate. The transparent proxy creates an "always watched" dynamic that changes behavior without conscious awareness.',
    dolphinCreative: 'Creative twist: What if transparent proxies were... transparent? A dashboard that makes the invisible visible — showing every request that was intercepted, modified, or blocked, in real-time. "Transparency for the transparent proxy" — the ultimate meta-design.',
    eagleStrategy: 'Strategic view: Transparent proxies are a compliance tool, not a performance tool. Their strategic value is in regulatory environments where policy enforcement must be unavoidable. The long-term trend is toward client-side encryption that makes transparent proxies less effective, so the strategic window for this technology is narrowing.',
  },
  {
    proxyId: 'api-gateway',
    name: 'API Gateway',
    elephantInsight: 'Biology: Like the blood-brain barrier — highly selective, actively transports nutrients while blocking pathogens. Not just a filter but an intelligent routing layer. History: Roman cursus publicus — not just roads, but way stations, auth seals, rate limits on messages, and message transformation at each station. The Romans invented the API gateway 2000 years ago.',
    dolphinCreative: 'Creative twist: An API gateway with "conversation mode" — instead of just routing requests, it maintains conversational context across API calls. It remembers that you just authenticated, so it pre-fetches user data. It knows your previous query, so it suggests related endpoints. The gateway becomes an API butler.',
    eagleStrategy: 'Strategic view: API gateways are the "control plane" of modern microservices. The strategic play is to own the gateway — whoever controls the API gateway controls the entire service mesh. This is why AWS API Gateway, Kong, and Ambassador are such competitive markets. Invest in understanding this pattern deeply.',
  },
  {
    proxyId: 'service-mesh',
    name: 'Service Mesh Proxy',
    elephantInsight: 'Systems theory: Like mycelial networks in forests — invisible underground web connecting trees, sharing nutrients and warning signals. Collective intelligence no single tree achieves alone. Sociology: Like diplomatic corps — every nation has ambassadors (sidecars) everywhere, with a central foreign ministry (control plane) coordinating.',
    dolphinCreative: 'Creative twist: Visualize the service mesh as an ecosystem — each service is an organism, each sidecar is a symbiotic helper, the control plane is the environment. When a service fails, show it as a "wilting plant" being nursed back to health by its sidecar. Make the invisible visible through ecological metaphor.',
    eagleStrategy: 'Strategic view: Service meshes solve the complexity problem that microservices created. They\'re a necessary abstraction layer, but they add their own complexity. The strategic insight is that service meshes are a transitional technology — they\'ll be absorbed into the platform layer (Kubernetes) within 5 years. Invest in understanding the patterns, not the specific implementations.',
  },
  {
    proxyId: 'resilience',
    name: 'Resilience Proxy',
    elephantInsight: 'Psychology: The stress-inoculation model — deliberately exposing the system to controlled stressors (health checks, simulated failures) builds antifragility. Like exposure therapy, each recovery makes the system stronger. History: Roman legion\'s castra — built every night on the march, self-healing defensive perimeter. If one wall section fell, internal grid contained the breach.',
    dolphinCreative: 'Creative twist: A resilience proxy that "trains" — it periodically injects controlled failures to test the system\'s recovery, like a fire drill for your infrastructure. Call it "Chaos Puppy" — it causes just enough chaos to keep the system on its toes, but never enough to cause real damage. When real failures happen, the system is already trained.',
    eagleStrategy: 'Strategic view: The resilience proxy is the highest-ROI investment for portfolio and small-team projects. It provides 90% of the reliability of a service mesh at 10% of the complexity. The strategic play is to start here and only add complexity when the resilience proxy proves insufficient. Most projects never need more than this.',
  },
]
