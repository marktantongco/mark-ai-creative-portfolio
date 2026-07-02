// =============================================================
// SHARED DATA FOR SUBPAGES
// =============================================================

import { assetPath } from './utils'
import { RESEARCH_FILES_GENERATED } from './research-files.generated'
import { GUIDED_TOUR_GENERATED } from './guided-tour.generated'

export type ViewKey = 'home' | 'error-handler' | 'brutalist' | 'organic' | 'cyberpunk' | 'research' | 'audit' | 'frontend-design' | 'proxy-discussion'

export interface ProjectFile {
  name: string
  type: 'image' | 'pdf' | 'script' | 'document' | 'shell' | 'other'
  size: number
  path: string
  description: string
}

// ---------------------------------------------------------------------------
// Research archive files — generated at build time by
// scripts/generate-research-files.js (Task B / blind spot #3 fix).
//
// The generator walks /public/files/ and /public/images/ at prebuild and
// emits src/lib/research-files.generated.ts. Descriptions come from a
// sidecar JSON (scripts/file-descriptions.json). Files not in the sidecar
// get an auto-generated description so they still appear in the archive.
//
// The hardcoded FALLBACK_RESEARCH_FILES below is kept as a safety net for
// the very first build on a fresh checkout (before prebuild runs). After
// the first prebuild, RESEARCH_FILES_GENERATED takes precedence.
// ---------------------------------------------------------------------------

const FALLBACK_RESEARCH_FILES: ProjectFile[] = [
  {
    name: 'design_approaches.png',
    type: 'image',
    size: 178395,
    path: assetPath('/images/design_approaches.png'),
    description: 'Three wildly different design approaches: Brutalist Industrial, Organic Minimalism, Cyberpunk Dashboard',
  },
  {
    name: 'decision_tree.png',
    type: 'image',
    size: 169654,
    path: assetPath('/images/decision_tree.png'),
    description: 'Decision tree for choosing the right proxy architecture and design approach',
  },
  {
    name: 'architecture_diagram.png',
    type: 'image',
    size: 270760,
    path: assetPath('/images/architecture_diagram.png'),
    description: 'System architecture diagram showing the three-tier error defense system',
  },
  {
    name: 'perspectives-tab.png',
    type: 'image',
    size: 63867,
    path: assetPath('/images/perspectives-tab.png'),
    description: 'Five animal-metaphor perspectives on error handling and resilience',
  },
  {
    name: 'error-handler-tab.png',
    type: 'image',
    size: 84897,
    path: assetPath('/images/error-handler-tab.png'),
    description: 'Pre-flight deployment checker and error handler interface design',
  },
  {
    name: 'proxy-topics-page.png',
    type: 'image',
    size: 81708,
    path: assetPath('/images/proxy-topics-page.png'),
    description: 'Proxy types comparison and discussion page visualization',
  },
  {
    name: 'Impeccable_Error_Fix_Handler_Audit.pdf',
    type: 'pdf',
    size: 84576,
    path: assetPath('/files/Impeccable_Error_Fix_Handler_Audit.pdf'),
    description: 'Comprehensive audit report with 5 animal-metaphor perspectives (Owl, Eagle, Beaver, Dolphin, Elephant)',
  },
  {
    name: 'Portfolio_Website_Recreation_SOP_final.pdf',
    type: 'pdf',
    size: 764312,
    path: assetPath('/files/Portfolio_Website_Recreation_SOP_final.pdf'),
    description: '33-page SOP for recreating the portfolio with 3 design approaches, confidence scoring, decision trees, YC/staff-engineer reviews',
  },
  {
    name: 'generate_portfolio_sop.py',
    type: 'script',
    size: 28456,
    path: assetPath('/files/generate_portfolio_sop.py'),
    description: 'Python script generating the SOP PDF with custom ReportLab styles, flowables, and table builders',
  },
  {
    name: 'generate_audit.py',
    type: 'script',
    size: 15328,
    path: assetPath('/files/generate_audit.py'),
    description: 'Python script generating the Error Fix Handler Audit PDF with cascade palette',
  },
  {
    name: 'impeccable-error-handler/README.md',
    type: 'document',
    size: 2847,
    path: assetPath('/files/impeccable-error-handler/README.md'),
    description: 'Documentation for the three-tier error defense system: Prevention, Detection, Recovery',
  },
  {
    name: 'impeccable-error-handler/deploy.sh',
    type: 'shell',
    size: 5647,
    path: assetPath('/files/impeccable-error-handler/deploy.sh'),
    description: 'Main deployment script with pre-flight checks, session checkpointing, and failover logic',
  },
  {
    name: 'impeccable-error-handler/git-recovery.sh',
    type: 'shell',
    size: 3289,
    path: assetPath('/files/impeccable-error-handler/git-recovery.sh'),
    description: 'Git state recovery script for handling rebase locks, merge conflicts, and index corruption',
  },
  {
    name: 'Portfolio_Website_Recreation_SOP.pdf',
    type: 'pdf',
    size: 705303,
    path: assetPath('/files/Portfolio_Website_Recreation_SOP.pdf'),
    description: 'Earlier draft of the SOP — included for version comparison and historical reference',
  },
  {
    name: 'cover_portfolio_sop.pdf',
    type: 'pdf',
    size: 59959,
    path: assetPath('/files/cover_portfolio_sop.pdf'),
    description: 'Standalone cover page for the Portfolio Website Recreation SOP document',
  },
  {
    name: 'cover_portfolio_sop.html',
    type: 'document',
    size: 5394,
    path: assetPath('/files/cover_portfolio_sop.html'),
    description: 'HTML version of the SOP cover page — viewable inline in the browser',
  },
  {
    name: 'gen_architecture.py',
    type: 'script',
    size: 19127,
    path: assetPath('/files/gen_architecture.py'),
    description: 'Python script generating the system architecture diagram visualization',
  },
  {
    name: 'generate_decision_tree.py',
    type: 'script',
    size: 11539,
    path: assetPath('/files/generate_decision_tree.py'),
    description: 'Python script generating the decision tree visualization for proxy and design approach selection',
  },
]

// Prefer the build-time-generated list; fall back to the hardcoded list
// if the generated file is missing (e.g. fresh checkout before prebuild).
// Using a ternary at module scope so the cost is paid once at import.
export const RESEARCH_FILES: ProjectFile[] =
  RESEARCH_FILES_GENERATED.length > 0 ? RESEARCH_FILES_GENERATED : FALLBACK_RESEARCH_FILES

// Audit perspectives data (expanded from the 5 animal metaphors)
export const AUDIT_PERSPECTIVES = [
  {
    id: 'owl',
    name: 'Owl',
    title: 'The Analytical Eye',
    icon: '🔍',
    color: '#D4A017',
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
    color: '#2DD4BF',
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
    color: '#D4A017',
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
    color: '#2DD4BF',
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

// =============================================================
// GUIDED TOUR — narrative walkthrough of the Error Handler story
// =============================================================
// Each artifact becomes a chapter in the Impeccable Error Handler story.
// Transforms a file browser into a portfolio piece.
export interface TourStop {
  fileName: string
  chapter: string
  narrative: string
  why: string
}

export const FALLBACK_GUIDED_TOUR: TourStop[] = [
  {
    fileName: 'architecture_diagram.png',
    chapter: 'Chapter 1 — The Vision',
    narrative: 'Before writing a single line of recovery code, we draw the system. This diagram shows the three-tier defense: Prevention (pre-flight checks), Detection (real-time monitoring), Recovery (auto-clean + checkpoint restore).',
    why: 'Architecture-first design forces you to name every failure path before you encounter it. Recovery code written without a diagram is just fire-fighting with extra steps.',
  },
  {
    fileName: 'impeccable-error-handler/README.md',
    chapter: 'Chapter 2 — The Design',
    narrative: 'The README documents the three-tier system in plain prose. It is the contract between the code and the operator. Every behavior the system promises lives here first.',
    why: 'A README is a stress test for clarity. If you cannot explain the system in three paragraphs, you have not designed it — you have only coded it.',
  },
  {
    fileName: 'impeccable-error-handler/deploy.sh',
    chapter: 'Chapter 3 — The Implementation',
    narrative: 'The main deployment script: pre-flight checks, session checkpointing, and failover logic. Every line is a defense against a specific failure mode observed in production.',
    why: 'Shell scripts are honest — they cannot hide complexity behind abstractions. Reading deploy.sh end-to-end is the fastest way to understand what the system actually does.',
  },
  {
    fileName: 'impeccable-error-handler/git-recovery.sh',
    chapter: 'Chapter 4 — The Recovery',
    narrative: 'When git state corrupts (rebase locks, merge conflicts, index corruption), this script restores from checkpoint. It is the system\'s immune response — automatic, fast, and predictable.',
    why: 'Recovery code is more important than happy-path code. Users forgive a system that fails gracefully; they abandon one that fails and stays failed.',
  },
  {
    fileName: 'Impeccable_Error_Fix_Handler_Audit.pdf',
    chapter: 'Chapter 5 — The Audit',
    narrative: 'Five animal-metaphor perspectives (Owl, Eagle, Beaver, Dolphin, Elephant) examine the system for hidden factors. Each finds what the others miss.',
    why: 'Single-perspective audits are blind to their own assumptions. Multi-perspective audits surface contradictions that point to the deepest truths about a system.',
  },
  {
    fileName: 'generate_audit.py',
    chapter: 'Chapter 6 — The Audit Generator',
    narrative: 'The Python script that generates the audit PDF using ReportLab. Reading it reveals how the audit\'s structure itself encodes the analytical framework — every flowable is a perspective.',
    why: 'The generator is documentation that runs itself. When the audit changes, the script makes the change visible — unlike a static PDF, it shows its own construction.',
  },
  {
    fileName: 'Portfolio_Website_Recreation_SOP_final.pdf',
    chapter: 'Chapter 7 — The Full Story',
    narrative: 'The 33-page Standard Operating Procedure: 3 design approaches, confidence scoring, decision trees, YC-partner and staff-engineer reviews. This is the canonical document for recreating the entire portfolio.',
    why: 'A SOP is the highest leverage artifact a developer can produce. It converts tacit knowledge into reproducible process — the difference between a project and a practice.',
  },
  {
    fileName: 'cover_portfolio_sop.html',
    chapter: 'Chapter 8 — The Cover',
    narrative: 'The HTML cover for the SOP. Inline-viewable in any browser, no PDF reader required. A small kindness for mobile readers who hate downloading PDFs.',
    why: 'Format choice is accessibility. The same content in HTML, PDF, and PNG reaches three audiences: the impatient, the archivist, and the visual learner.',
  },
  {
    fileName: 'generate_portfolio_sop.py',
    chapter: 'Chapter 9 — The SOP Generator',
    narrative: 'The script that generates the SOP PDF. Custom ReportLab styles, flowables, and table builders. Reading it teaches you how to programmatically produce a 33-page document with consistent typography.',
    why: 'Programmatic document generation is a superpower. Every resume, every report, every proposal can be regenerated from data — never out of date, never inconsistent.',
  },
  {
    fileName: 'gen_architecture.py',
    chapter: 'Chapter 10 — The Architecture Generator',
    narrative: 'Generates the architecture diagram (Chapter 1) programmatically. The diagram is not a static artifact — it is code, versionable and reproducible.',
    why: 'Diagrams as code is the only sustainable architecture documentation practice. Whiteboard photos rot, Visio files rot, but Python that draws the same picture every commit does not.',
  },
  {
    fileName: 'generate_decision_tree.py',
    chapter: 'Chapter 11 — The Decision Tree Generator',
    narrative: 'Generates the decision tree that helps choose between proxy architectures and design approaches. Encodes the same trade-offs the SOP discusses — but as a visual query.',
    why: 'A decision tree is a conversation with your future self. When you forget why you chose X over Y, the tree reminds you — and shows what would have to change to flip the decision.',
  },
  {
    fileName: 'decision_tree.png',
    chapter: 'Chapter 12 — The Decision Tree',
    narrative: 'The rendered decision tree. Start at the root, follow your constraints, arrive at a recommended architecture. Three branches: portfolio, microservices, enterprise.',
    why: 'Visual decisions are auditable decisions. Stakeholders can point to a node and say "this is wrong" — a conversation that is impossible with prose rationales.',
  },
  {
    fileName: 'design_approaches.png',
    chapter: 'Chapter 13 — Three Design Approaches',
    narrative: 'Brutalist Industrial, Organic Minimalism, Cyberpunk Dashboard. Same content, three wildly different presentations. The point: design is not about what to say, but how to say it.',
    why: 'Generating the same artifact in three styles is the cheapest way to surface your actual design preferences. The approach you reject tells you more than the one you choose.',
  },
  {
    fileName: 'error-handler-tab.png',
    chapter: 'Chapter 14 — The Error Handler UI',
    narrative: 'The pre-flight deployment checker and error handler interface. Visible resilience — users see the checks running, not just their outcome.',
    why: 'Visible resilience builds trust. Hidden resilience builds suspicion. Users who never see the system work assume it does not work — even when it does.',
  },
  {
    fileName: 'perspectives-tab.png',
    chapter: 'Chapter 15 — The Five Perspectives',
    narrative: 'The five animal-metaphor perspectives rendered as a single comparison view. Owl, Eagle, Beaver, Dolphin, Elephant — each lens adds a dimension the others cannot see.',
    why: 'A 2D table of 5 perspectives surfaces contradictions that bullet lists hide. The contradictions are where the deepest insights live.',
  },
  {
    fileName: 'proxy-topics-page.png',
    chapter: 'Chapter 16 — The Proxy Discussion',
    narrative: 'The proxy types comparison and discussion page. Six proxies, fit-scored against the portfolio use case. Reverse (90%) and Resilience (85%) win; Service Mesh (15%) and Transparent (10%) lose.',
    why: 'A fit-scored comparison converts "it depends" into "it depends on X, Y, Z — and here are the values". The next person does not have to re-derive your reasoning.',
  },
  {
    fileName: 'Portfolio_Website_Recreation_SOP.pdf',
    chapter: 'Chapter 17 — The Earlier Draft',
    narrative: 'The earlier draft of the SOP, kept for version comparison. Comparing draft and final reveals which decisions hardened and which stayed soft.',
    why: 'Keeping drafts is keeping your own decision history. The delta between draft and final is the most honest record of what you learned during the project.',
  },
  {
    fileName: 'cover_portfolio_sop.pdf',
    chapter: 'Chapter 18 — The Cover PDF',
    narrative: 'The standalone cover page as PDF. Useful for embedding in other documents, slide decks, or printing as a title page for a physical binder.',
    why: 'Artifacts should be composable. A cover that works as HTML, PDF, and print reaches three audiences with zero extra work — the holy grail of format polyglotism.',
  },
  {
    fileName: 'README.md',
    chapter: 'Chapter 19 — Project Readme',
    narrative: 'The project README. Live links to both deployments, tech stack, project structure, interactive demos, design philosophy, and case studies. The front door for any new visitor.',
    why: 'A README is the only document every visitor will read. Optimize it for the visitor who spends 30 seconds and decides whether to stay — then add depth for the one who stays 30 minutes.',
  },
]

// Prefer the build-time-generated tour; fall back to the hardcoded tour
// if the generated file is missing (e.g. fresh checkout before prebuild).
// Generated file is regenerated from scripts/tour-chapters.json on every
// prebuild — see scripts/generate-guided-tour.js.
export const GUIDED_TOUR: TourStop[] =
  GUIDED_TOUR_GENERATED.length > 0 ? GUIDED_TOUR_GENERATED : FALLBACK_GUIDED_TOUR

// =============================================================
// ENHANCED ANALYSIS — Failure Modes, Contrarian, Second-Order,
// Metrics, Blind Spots (the questions the user explicitly asked)
// =============================================================

export const FAILURE_MODES = [
  {
    mode: 'Git Lock Cascade',
    trigger: 'git rebase interrupted + zsh prompt hook fires simultaneously',
    impact: 'Total session death — no component can recover alone',
    mitigation: 'Pre-flight lock detection (Tier 1) + checkpoint restore (Tier 3)',
    detectionTime: '< 500ms',
    recoveryTime: '2-5s',
    severity: 'critical',
  },
  {
    mode: 'Shell Hook Deadlock',
    trigger: 'Framework guard loops waiting for lock release that never comes',
    impact: 'Interactive shell unusable; developer forced to kill terminal',
    mitigation: 'Hook timeout (3s) + force-clean on deadlock detection',
    detectionTime: '3s (timeout)',
    recoveryTime: '1-2s',
    severity: 'high',
  },
  {
    mode: 'Framework Guard Loop',
    trigger: 'Guard re-enters itself when checking state it modified',
    impact: 'CPU spike, eventual OOM kill, no useful work done',
    mitigation: 'Guard recursion depth limit (max 2) + circuit breaker',
    detectionTime: '< 100ms (depth check)',
    recoveryTime: 'immediate',
    severity: 'high',
  },
  {
    mode: 'Checkpoint Corruption',
    trigger: 'Power loss during checkpoint write, or disk full',
    impact: 'Recovery script cannot restore state; manual intervention required',
    mitigation: 'Atomic write (temp file + rename) + checksum validation',
    detectionTime: 'on next read',
    recoveryTime: 'manual (5-15 min)',
    severity: 'medium',
  },
  {
    mode: 'Failover Target Unreachable',
    trigger: 'Both Vercel and GitHub Pages have network issues simultaneously',
    mitigation: 'Local fallback server (next best-effort) + deferred deploy',
    detectionTime: '30s (health check interval)',
    recoveryTime: 'deferred (operator-driven)',
    severity: 'low',
    impact: 'Deployment delayed, but no state lost',
  },
  {
    mode: 'Error Log Saturation',
    trigger: 'Sustained error storm fills the 50-entry rolling log',
    impact: 'Historical context lost; recurring patterns invisible',
    mitigation: 'Log rotation + summary entry (top 3 errors + counts)',
    detectionTime: 'immediate',
    recoveryTime: 'immediate',
    severity: 'low',
  },
]

export const CONTRARIAN_VIEWS = [
  {
    claim: 'The three-tier architecture is over-engineered for a portfolio site',
    steelman: 'A portfolio site serves static files. Failure modes are: build error (catch in CI), DNS error (Cloudflare handles it), deploy error (git push again). No part of this requires pre-flight checks, session checkpointing, or failover targets. The whole system is theater — a portfolio piece masquerading as production infrastructure.',
    response: 'True for a portfolio. False for the practice. The system is not justified by the portfolio\'s reliability needs — it is justified by the skill it demonstrates. Hiring managers reading the code see a developer who thinks in systems. That is the actual deliverable.',
    confidence: 8,
  },
  {
    claim: 'Animal metaphors dilute technical credibility',
    steelman: 'Senior engineers roll their eyes at "Owl, Eagle, Beaver" framing. It reads like a marketing deck, not a post-mortem. The same analysis in plain English (detection gaps, strategic risks, practical steps) would land harder with technical audiences.',
    response: 'Half right. For technical audiences, plain English wins. But the portfolio audience is mixed — designers, recruiters, founders. The animal metaphors are an accessibility layer that gets mixed audiences to read the analysis. The detailedAnalysis fields contain the plain-English version for those who want it.',
    confidence: 7,
  },
  {
    claim: 'Inlining all artifacts is a UX regression — links are better',
    steelman: 'Modal viewers force one-file-at-a-time consumption. The original design (download + open externally) let visitors keep files open in tabs, compare side-by-side, and use their preferred tools. Modals are a marketing decision, not an ergonomics decision.',
    response: 'True for power users. False for the 80% who never download. Modals convert "this file exists" into "this file is interesting" — they lower the activation energy to engage. The download button is still there for power users. Win-win.',
    confidence: 9,
  },
  {
    claim: 'The prebuild sync script is unnecessary — just commit /public/files/',
    steelman: 'A prebuild script adds a build step that can fail in CI. Committing /public/files/ directly is simpler, requires zero Node code, and is the standard Next.js pattern for static assets.',
    response: 'True if you trust yourself to never forget. False the moment you add a new PDF to /download/ and forget to copy it to /public/files/. The sync script costs 30 lines of code and eliminates an entire class of "why is this 404" debugging. Worth it.',
    confidence: 9,
  },
  {
    claim: 'Fit scores for proxies are arbitrary numbers',
    steelman: 'Assigning "85" to the Resilience Proxy implies a precision the analysis does not have. The scoring invites readers to treat it as data when it is opinion. A qualitative "high/medium/low" would be more honest.',
    response: 'Fair. The numbers are anchors for discussion, not measurements. The fix is not to remove them — it is to label them as anchors. We should add "Methodology: fit score = weighted average of complexity (40%), reliability gain (40%), operational overhead (20%), judged by author." Honest about subjectivity.',
    confidence: 8,
  },
]

export const SECOND_ORDER_EFFECTS = [
  {
    decision: 'Move from /api/files (SSR) to /public/files (static)',
    firstOrder: 'Files work on both Vercel and GitHub Pages without code changes',
    secondOrder: 'Removes SSR dependency entirely → portfolio can be deployed to any static host (Cloudflare Pages, Netlify, S3) without re-architecture',
    thirdOrder: 'Hiring conversation shifts from "we use Vercel" to "we deploy anywhere" — broader appeal to engineering cultures that avoid vendor lock-in',
  },
  {
    decision: 'Inline preview modal for all file types',
    firstOrder: 'Visitors engage with artifacts without leaving the page',
    secondOrder: 'Average session duration increases → SEO signals improve → portfolio ranks higher for "AI creative technologist" queries',
    thirdOrder: 'Inbound recruiter traffic qualitatively shifts — recruiters who saw the modal contact with specific questions about specific files, not generic "are you available" pings',
  },
  {
    decision: 'Add syntax highlighting to code viewer',
    firstOrder: 'Python and bash files become readable instead of monospace blobs',
    secondOrder: 'Visitors actually read the scripts → understand the system depth → perceive the portfolio as senior-level work, not junior-level',
    thirdOrder: 'Salary expectations calibrated upward because the visitor\'s mental model of "what this person can do" includes "writes production deployment scripts"',
  },
  {
    decision: 'Guided Tour mode in research archive',
    firstOrder: 'Visitors walk through the story in narrative order instead of browsing randomly',
    secondOrder: 'Time-on-page for the research archive doubles — visitors reach the audit PDF (chapter 5) instead of bouncing at chapter 1',
    thirdOrder: 'The audit PDF\'s animal-metaphor framing becomes the dominant lens through which visitors describe the portfolio — "the owl/eagle/beaver thing" becomes a brand identifier',
  },
  {
    decision: 'Prebuild sync script',
    firstOrder: 'New artifacts in /download/ automatically appear in /public/files/',
    secondOrder: 'Artifact drift becomes impossible → trust in the research archive increases → visitors stop second-guessing whether they\'re seeing the latest version',
    thirdOrder: 'The portfolio becomes a living document — adding a new case study is "drop PDF in /download/, commit, push" with zero manual publishing steps',
  },
]

export const DATA_ENGINEER_METRICS = [
  { metric: 'artifact_load_count', type: 'counter', description: 'Number of times any artifact is opened in the modal viewer' },
  { metric: 'artifact_load_latency_ms', type: 'histogram', description: 'Time from click to content rendered, by file type (image/pdf/script/shell/doc)' },
  { metric: 'artifact_load_failure', type: 'counter', description: 'Failed fetches (network 4xx/5xx), labeled by file path and status code' },
  { metric: 'tour_completion_rate', type: 'funnel', description: 'Of visitors who start the Guided Tour, % reaching each chapter (drop-off per chapter)' },
  { metric: 'tour_vs_browse_ratio', type: 'gauge', description: 'Of research archive visitors, % using Guided Tour vs free browse' },
  { metric: 'download_after_preview', type: 'counter', description: 'Downloads triggered after inline preview — measures whether preview satisfies or whets appetite' },
  { metric: 'copy_to_clipboard_count', type: 'counter', description: 'Script/shell copies — proxy for "this person wants to use this code"' },
  { metric: 'search_query_empty_results', type: 'counter', description: 'Searches that returned zero files — surfaces missing artifacts visitors expect to find' },
  { metric: 'filter_type_distribution', type: 'gauge', description: 'Most-applied filter (image/pdf/script/etc) — tells you which artifact type visitors come for' },
  { metric: 'modal_dwell_time_ms', type: 'histogram', description: 'Time modal stays open per file — long dwell = engaging content; short = wrong file or poor preview' },
  { metric: 'cross_view_navigation', type: 'counter', description: 'Transitions between subpages (research → audit → proxy) — measures whether the story connects' },
  { metric: 'asset_path_404', type: 'counter', description: '404s on /files/* or /images/* paths — catches basePath misconfiguration on new deployments' },
]

export const BLIND_SPOTS = [
  {
    area: 'Mobile modal UX',
    issue: 'The preview modal is optimized for desktop (max-w-5xl). On mobile, code files become horizontally scrollable walls of text. PDFs are barely readable.',
    fix: 'Add a mobile-specific modal layout: full-screen, swipe-to-dismiss, with a "download for offline reading" CTA taking precedence over inline preview.',
  },
  {
    area: 'Accessibility of syntax highlighter',
    issue: 'react-syntax-highlighter renders colored spans. Screen readers may read each token separately, destroying code comprehension for visually impaired visitors.',
    fix: 'Add aria-label="Source code, N lines" on the pre element and a "copy to read in editor" button as the primary CTA on mobile/a11y modes.',
  },
  {
    area: 'Search index freshness ✅ FIXED',
    issue: 'RESEARCH_FILES WAS a hardcoded array in subpage-data.ts. New files added to /download/ did not appear until a developer updated the array.',
    fix: 'NOW FIXED: scripts/generate-research-files.js runs at prebuild, walks /public/files/ + /public/images/ via fs.readdirSync, and emits src/lib/research-files.generated.ts. Descriptions come from scripts/file-descriptions.json (sidecar). Files not in the sidecar get auto-generated descriptions so they still appear.',
  },
  {
    area: 'PDF rendering on Safari ✅ A/B TEST RUNNING + WINNER DECLARATION',
    issue: 'Safari\'s PDF iframe rendering is inconsistent — sometimes shows blank page on first load, requires refresh. Chrome and Firefox are fine.',
    fix: 'NOW A/B TESTED with winner declaration: visitors are assigned a fallback timer variant (2s/3s/5s, sticky per visitor) via shouldServeVariant(). Per-visitor sample counts accumulate in localStorage (survive buffer drains). At threshold=100 local pdf_loaded samples, a winner is auto-declared for that visitor. Developer can also declare a winner globally by setting EXPERIMENTS.safari_pdf_fallback_timer.winner in src/lib/analytics.ts. Once declared, all visitors receive the winning variant — losers are removed from rotation. See the Active Experiments panel in the Audit view for live per-variant counts + manual declare buttons.',
  },
  {
    area: 'Offline support',
    issue: 'No service worker. Visitors who lose connectivity mid-tour lose all state. (Note: tour position is now persisted via URL params + localStorage mirror — see Task D.)',
    fix: 'Add a minimal service worker that caches /files/* and /images/*. Tour position persists via ?chapter=N URL param. Resume on reconnect.',
  },
  {
    area: 'Internationalization',
    issue: 'All file descriptions are English. The portfolio targets Filipino and international audiences — non-English speakers get no artifact context.',
    fix: 'Add a translations sidecar (en.json, fil.json) and use next-intl for artifact descriptions. This is the single biggest accessibility win for the local audience.',
  },
  {
    area: 'Versioning of artifacts',
    issue: 'When a PDF is regenerated (e.g., audit.pdf), the old version is overwritten. Visitors cannot compare versions or see what changed.',
    fix: 'Versioned filenames (audit_v3.pdf) with a "current" symlink. Add a "What changed" diff view in the modal for repeat visitors.',
  },
  {
    area: 'Analytics blind to value',
    issue: 'Page views tell you traffic. They do not tell you whether visitors understood the work. A visitor who opens audit.pdf and bounces in 3 seconds looks identical to one who reads it for 5 minutes.',
    fix: 'Add modal_dwell_time_ms (above) and segment by "engaged" (>30s) vs "bounce" (<5s). Optimize content for the engaged segment, not the bounce segment.',
  },
]

// 80/20 version — the smallest useful subset of the system
export const EIGHTY_TWENTY = {
  principle: '20% of the features deliver 80% of the value. Identify them, ship them, defer the rest.',
  ship: [
    'Pre-flight checks (lock detection, working tree clean) — prevents 70% of failures',
    'Session checkpointing before risky operations — enables 90% of recoveries',
    'Rolling 50-entry error log — surfaces recurring patterns',
    'Static /public/files/ serving with assetPath() prefix — works on every host',
    'Universal modal with image/PDF/text/code handlers — every artifact accessible',
    'Copy-to-clipboard on code files — visitors can grab the code',
    'Search + type filter — visitors find what they need',
  ],
  defer: [
    'Guided Tour mode (nice-to-have, not blocking)',
    'Cross-view navigation analytics (instrumentation can come later)',
    'Mobile-specific modal layout (current responsive works acceptably)',
    'Service worker for offline (only matters if connectivity is a real issue)',
    'Versioned artifacts with diff view (only matters when revisions are frequent)',
    'Internationalization (only matters when non-English audience grows)',
    'AI-powered "ask the audit" chatbot (premature; the static audit is enough)',
  ],
  kill: [
    'The /api/files SSR route (replaced by /public/files/ static serving)',
    'Forced PDF rendering on Safari without fallback (just show download link)',
    'Over-engineered service mesh analogies for a portfolio site (the contrarian is right here)',
  ],
}

// Sub-agent decomposition — what each agent would own
export const SUB_AGENT_DECOMPOSITION = [
  {
    agent: 'sync-agent',
    role: 'Mirror /download/* → /public/files/ before every build',
    owns: ['scripts/sync-files.js', 'package.json prebuild hook'],
    successCriteria: 'Synced file count matches source count. Build fails fast on mismatch.',
  },
  {
    agent: 'asset-path-agent',
    role: 'Guarantee every static path uses assetPath()',
    owns: ['src/lib/utils.ts', 'src/lib/subpage-data.ts'],
    successCriteria: 'No raw "/files/" or "/images/" string literals in source. CI grep enforces.',
  },
  {
    agent: 'modal-agent',
    role: 'Universal preview modal that handles every file type',
    owns: ['src/components/views/ResearchReportView.tsx (modal section)'],
    successCriteria: 'PDF, PNG, PY, SH, HTML, MD all render correctly on Vercel AND GitHub Pages.',
  },
  {
    agent: 'tour-agent',
    role: 'Guided Tour mode — narrative walkthrough of artifacts',
    owns: ['GUIDED_TOUR data in subpage-data.ts', 'GuidedTour React component', 'URL param sync (?chapter=N)', 'Share-this-chapter button'],
    successCriteria: 'Visitor can walk all 19 chapters with prev/next. Position persists in URL params (shareable) + localStorage mirror (resume on tab close). Browser back/forward works.',
  },
  {
    agent: 'resilience-agent',
    role: 'Fetch + fallback + retry for text content in modal',
    owns: ['UniversalPreviewModal fetch logic'],
    successCriteria: 'Network failure → graceful error with download link, no broken UI.',
  },
  {
    agent: 'analytics-agent',
    role: 'Wire DATA_ENGINEER_METRICS to actual telemetry',
    owns: ['src/lib/analytics.ts', 'LiveMetricsDashboard in AuditView', 'emit helpers in ResearchReportView + page.tsx'],
    successCriteria: 'Every metric in DATA_ENGINEER_METRICS is emitted on real user interactions. Live counts visible in Audit view dashboard. Buffer drains via sendBeacon when NEXT_PUBLIC_ANALYTICS_ENDPOINT is set.',
  },
  {
    agent: 'a11y-agent',
    role: 'Audit and fix accessibility gaps (mobile, screen reader, keyboard)',
    owns: ['BLIND_SPOTS fixes #1, #2, #4'],
    successCriteria: 'Lighthouse a11y score ≥ 95. Modal fully keyboard-navigable. Screen reader test passes.',
  },
  {
    agent: 'verify-agent',
    role: 'Build for both Vercel and GitHub Pages, verify every artifact loads',
    owns: ['build:static script', 'verification script', 'scripts/generate-research-files.js'],
    successCriteria: 'HTTP 200 on every file in RESEARCH_FILES, on both deployment targets. Generated file count matches walk of /public/files/.',
  },
]
