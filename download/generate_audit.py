#!/usr/bin/env python3
"""Impeccable Error Fix Handler — Multi-Perspective Audit Report"""

import os, sys
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.lib.units import mm, inch, cm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, KeepTogether, HRFlowable, Image
)
from reportlab.platypus.flowables import Flowable
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# ━━ Color Palette ━━
ACCENT       = colors.HexColor('#5533b9')
TEXT_PRIMARY  = colors.HexColor('#1b1b19')
TEXT_MUTED    = colors.HexColor('#8f8c84')
BG_SURFACE   = colors.HexColor('#dfddd8')
BG_PAGE      = colors.HexColor('#eeede9')

TABLE_HEADER_COLOR = ACCENT
TABLE_HEADER_TEXT  = colors.white
TABLE_ROW_EVEN     = colors.white
TABLE_ROW_ODD      = BG_SURFACE

# ━━ Page Setup ━━
PAGE_W, PAGE_H = A4
LEFT_M = 22*mm
RIGHT_M = 22*mm
TOP_M = 25*mm
BOT_M = 25*mm
CONTENT_W = PAGE_W - LEFT_M - RIGHT_M

# ━━ Register Fonts ━━
font_dir = '/usr/share/fonts/truetype'
pdfmetrics.registerFont(TTFont('NotoSerifSC', os.path.join(font_dir, 'noto-serif-sc', 'NotoSerifSC-Regular.ttf')))
pdfmetrics.registerFont(TTFont('NotoSerifSC-Bold', os.path.join(font_dir, 'noto-serif-sc', 'NotoSerifSC-Bold.ttf')))
pdfmetrics.registerFont(TTFont('DejaVuSans', os.path.join(font_dir, 'dejavu', 'DejaVuSans.ttf')))
pdfmetrics.registerFont(TTFont('DejaVuSerif', os.path.join(font_dir, 'dejavu', 'DejaVuSerif.ttf')))

# ━━ Styles ━━
styles = getSampleStyleSheet()

cover_title = ParagraphStyle('CoverTitle', fontName='DejaVuSerif', fontSize=32, leading=40,
    textColor=TEXT_PRIMARY, alignment=TA_LEFT, spaceAfter=12)
cover_sub = ParagraphStyle('CoverSub', fontName='DejaVuSans', fontSize=14, leading=20,
    textColor=TEXT_MUTED, alignment=TA_LEFT, spaceAfter=6)
cover_meta = ParagraphStyle('CoverMeta', fontName='DejaVuSans', fontSize=10, leading=16,
    textColor=TEXT_MUTED, alignment=TA_LEFT)

h1 = ParagraphStyle('H1', fontName='DejaVuSerif', fontSize=22, leading=28,
    textColor=ACCENT, spaceBefore=24, spaceAfter=10, alignment=TA_LEFT)
h2 = ParagraphStyle('H2', fontName='DejaVuSerif', fontSize=16, leading=22,
    textColor=TEXT_PRIMARY, spaceBefore=18, spaceAfter=8, alignment=TA_LEFT)
h3 = ParagraphStyle('H3', fontName='DejaVuSans', fontSize=12, leading=17,
    textColor=ACCENT, spaceBefore=12, spaceAfter=6, alignment=TA_LEFT)

body = ParagraphStyle('Body', fontName='DejaVuSerif', fontSize=10.5, leading=17,
    textColor=TEXT_PRIMARY, alignment=TA_JUSTIFY, spaceAfter=8,
    firstLineIndent=0)
body_indent = ParagraphStyle('BodyIndent', parent=body, leftIndent=18)
bullet_style = ParagraphStyle('Bullet', parent=body, leftIndent=24, firstLineIndent=-12,
    spaceBefore=2, spaceAfter=2)
callout_style = ParagraphStyle('Callout', fontName='DejaVuSans', fontSize=10, leading=16,
    textColor=ACCENT, leftIndent=18, borderPadding=(6,6,6,6),
    spaceBefore=6, spaceAfter=6, backColor=colors.HexColor('#f3f0fa'),
    borderColor=ACCENT, borderWidth=0.5, alignment=TA_LEFT)

tbl_header = ParagraphStyle('TblHeader', fontName='DejaVuSans', fontSize=9, leading=13,
    textColor=TABLE_HEADER_TEXT, alignment=TA_LEFT)
tbl_cell = ParagraphStyle('TblCell', fontName='DejaVuSans', fontSize=9, leading=13,
    textColor=TEXT_PRIMARY, alignment=TA_LEFT)
tbl_cell_muted = ParagraphStyle('TblCellMuted', fontName='DejaVuSans', fontSize=8.5, leading=12,
    textColor=TEXT_MUTED, alignment=TA_LEFT)

footer_style = ParagraphStyle('Footer', fontName='DejaVuSans', fontSize=8, leading=12,
    textColor=TEXT_MUTED, alignment=TA_CENTER)

# ━━ Helper Flowables ━━
class AccentLine(Flowable):
    def __init__(self, width, thickness=1.5, color=ACCENT):
        Flowable.__init__(self)
        self.width = width
        self.thickness = thickness
        self.color = color
        self.height = thickness + 4
    def draw(self):
        self.canv.setStrokeColor(self.color)
        self.canv.setLineWidth(self.thickness)
        self.canv.line(0, 2, self.width, 2)

class CalloutBox(Flowable):
    """Accent-bordered callout box with text."""
    def __init__(self, text, width, accent_color=ACCENT, bg=colors.HexColor('#f3f0fa')):
        Flowable.__init__(self)
        self._text = text
        self._width = width
        self._accent = accent_color
        self._bg = bg
        self._style = ParagraphStyle('cb', fontName='DejaVuSans', fontSize=9.5, leading=15,
            textColor=TEXT_PRIMARY, alignment=TA_LEFT)
        self._para = Paragraph(text, self._style)
        w, h = self._para.wrap(width - 24, 1000)
        self.height = h + 16
        self.width = width
    def draw(self):
        self.canv.setFillColor(self._bg)
        self.canv.setStrokeColor(self._accent)
        self.canv.setLineWidth(2)
        self.canv.roundRect(0, 0, self._width, self.height, 4, fill=1, stroke=0)
        self.canv.line(0, 0, 0, self.height)  # left accent border
        self._para.drawOn(self.canv, 12, 8)

def make_table(headers, rows, col_widths=None):
    """Build a styled table."""
    data = [[Paragraph(h, tbl_header) for h in headers]]
    for row in rows:
        data.append([Paragraph(str(c), tbl_cell) for c in row])
    if not col_widths:
        col_widths = [CONTENT_W / len(headers)] * len(headers)
    t = Table(data, colWidths=col_widths, repeatRows=1)
    style_cmds = [
        ('BACKGROUND', (0, 0), (-1, 0), TABLE_HEADER_COLOR),
        ('TEXTCOLOR', (0, 0), (-1, 0), TABLE_HEADER_TEXT),
        ('FONTNAME', (0, 0), (-1, 0), 'DejaVuSans'),
        ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
        ('TOPPADDING', (0, 0), (-1, 0), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#d0cdc6')),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 1), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 6),
    ]
    for i in range(1, len(data)):
        bg = TABLE_ROW_EVEN if i % 2 == 1 else TABLE_ROW_ODD
        style_cmds.append(('BACKGROUND', (0, i), (-1, i), bg))
    t.setStyle(TableStyle(style_cmds))
    return t

# ━━ Build Document ━━
output_path = '/home/z/my-project/download/Impeccable_Error_Fix_Handler_Audit.pdf'
doc = SimpleDocTemplate(output_path, pagesize=A4,
    leftMargin=LEFT_M, rightMargin=RIGHT_M,
    topMargin=TOP_M, bottomMargin=BOT_M,
    title='Impeccable Error Fix Handler Audit',
    author='Z.ai', creator='Z.ai',
    subject='Multi-Perspective Audit of Web Dev & Deployment Error Handling')

story = []

# ━━ COVER SECTION ━━
story.append(Spacer(1, 60))
story.append(AccentLine(CONTENT_W, 3, ACCENT))
story.append(Spacer(1, 16))
story.append(Paragraph('Impeccable Error Fix Handler', cover_title))
story.append(Paragraph('A Multi-Perspective Audit', ParagraphStyle('CoverTitle2',
    fontName='DejaVuSerif', fontSize=24, leading=32, textColor=TEXT_PRIMARY)))
story.append(Spacer(1, 12))
story.append(AccentLine(CONTENT_W * 0.4, 1, ACCENT))
story.append(Spacer(1, 24))
story.append(Paragraph('Examining error handling architecture, frontend resilience, proxy strategy,<br/>and long-term system sustainability through five analytical lenses', cover_sub))
story.append(Spacer(1, 40))
story.append(Paragraph('Audit Date: June 11, 2026', cover_meta))
story.append(Paragraph('Perspectives: Owl / Eagle / Beaver / Dolphin / Elephant', cover_meta))
story.append(Paragraph('Session: web-3e3bf977-8549-4613-b293-b19b6c712de9', cover_meta))
story.append(Spacer(1, 30))
story.append(AccentLine(CONTENT_W, 1.5, TEXT_MUTED))

story.append(PageBreak())

# ━━ TABLE OF CONTENTS ━━
story.append(Paragraph('Contents', h1))
story.append(AccentLine(CONTENT_W * 0.3, 1, ACCENT))
story.append(Spacer(1, 12))

toc_items = [
    ('1', 'Executive Summary', '3'),
    ('2', 'The Owl Perspective: Slow, Observant, Analytical', '4'),
    ('3', 'The Eagle Perspective: Long-Term Strategic Vision', '7'),
    ('4', 'The Beaver Perspective: Practical Error Handling Systems', '10'),
    ('5', 'The Dolphin Perspective: Creative Frontend Design Solutions', '14'),
    ('6', 'The Elephant Perspective: Cross-Domain Insights on Proxy Architecture', '18'),
    ('7', 'Synthesis: Connecting the Five Perspectives', '22'),
    ('8', 'Actionable Recommendations', '24'),
    ('9', 'Appendix: Failure Mode Catalogue', '26'),
]

toc_data = []
for num, title, pg in toc_items:
    toc_data.append([
        Paragraph(f'<b>{num}</b>', ParagraphStyle('tocn', fontName='DejaVuSans', fontSize=10, textColor=ACCENT, alignment=TA_CENTER)),
        Paragraph(title, ParagraphStyle('toct', fontName='DejaVuSerif', fontSize=10.5, leading=16, textColor=TEXT_PRIMARY)),
        Paragraph(pg, ParagraphStyle('tocp', fontName='DejaVuSans', fontSize=9, textColor=TEXT_MUTED, alignment=TA_CENTER)),
    ])

toc_table = Table(toc_data, colWidths=[35, CONTENT_W - 70, 35])
toc_table.setStyle(TableStyle([
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ('LINEBELOW', (1, 0), (1, -1), 0.3, colors.HexColor('#e0ddd6')),
]))
story.append(toc_table)

story.append(PageBreak())

# ━━ SECTION 1: EXECUTIVE SUMMARY ━━
story.append(Paragraph('1. Executive Summary', h1))
story.append(AccentLine(CONTENT_W * 0.3, 1, ACCENT))
story.append(Spacer(1, 8))

story.append(Paragraph(
    'This audit examines a web development and deployment project that experienced a cascading failure during its final deployment phase. '
    'The project, a personal portfolio website built with Next.js and GSAP animations, suffered a critical git rebase conflict that locked the '
    'entire development session, preventing any further tool execution or code deployment. While the code changes themselves were completed '
    'successfully, the inability to recover from this single git state failure reveals systemic weaknesses in error handling, deployment '
    'resilience, and operational safeguards.', body))

story.append(Paragraph(
    'The audit applies five distinct analytical perspectives, each inspired by a different animal metaphor, to examine the problem from '
    'multiple angles. The Owl provides slow, deep observation of hidden factors most people overlook. The Eagle surveys the long-term '
    'strategic landscape and how architectural pieces connect. The Beaver constructs practical, step-by-step systems for error handling '
    'and recovery. The Dolphin brings playful, inventive creativity to frontend design challenges. And the Elephant draws on powerful '
    'cross-domain memory, connecting insights from psychology, economics, science, and history to illuminate the proxy architecture '
    'discussion and how this project can stand out in a crowded market.', body))

story.append(Paragraph(
    'The core finding is that the project lacks what we term an "Impeccable Error Fix Handler" - a self-healing, self-recovering system '
    'that can detect, diagnose, and resolve errors without human intervention or session restarts. The git lock was merely a symptom; the '
    'root cause is an architectural philosophy that treats errors as exceptional rather than expected. This audit proposes a comprehensive '
    'redesign of error handling across four dimensions: state management, frontend resilience, deployment automation, and proxy architecture '
    'for operational continuity.', body))

story.append(Spacer(1, 6))
story.append(CalloutBox(
    '<b>Core Thesis:</b> The git rebase conflict that killed the session was not a bug - it was a design failure. '
    'An impeccable error fix handler would have detected the conflict, auto-aborted the rebase, restored the working '
    'tree, and continued deployment without missing a beat. Every error is an opportunity for the system to demonstrate resilience.',
    CONTENT_W))

# ━━ SECTION 2: THE OWL PERSPECTIVE ━━
story.append(Spacer(1, 16))
story.append(Paragraph('2. The Owl Perspective: Slow, Observant, Analytical', h1))
story.append(AccentLine(CONTENT_W * 0.3, 1, ACCENT))
story.append(Spacer(1, 8))

story.append(Paragraph(
    'The owl sees what others miss in the dark. By slowing down and observing the entire timeline of events with patient attention, '
    'hidden patterns emerge that a rushed analysis would overlook. This perspective focuses on identifying the latent failure modes, '
    'the second-order effects, and the invisible dependencies that made the git lock catastrophic rather than merely inconvenient.', body))

story.append(Paragraph('2.1 The Anatomy of a Cascading Failure', h2))

story.append(Paragraph(
    'The session began with a series of ambitious but reasonable requests: integrate 12 visual concept variants into a timeline, '
    'select the 4 most impactful, implement CSS variant classes to prevent code bloat, remove sticky emoticons, add GenZ design '
    'animations, and deploy to both GitHub Pages and Vercel. Each step was completed successfully in isolation. The build passed '
    'in 6.3 seconds with zero errors. The code was clean, the animations worked, and the design was cohesive.', body))

story.append(Paragraph(
    'Then the deployment phase began, and everything collapsed. A <font face="DejaVuSans" size="9">git pull --rebase</font> created '
    'a merge conflict that locked the persistent shell session at the framework level. Every subsequent command - even '
    '<font face="DejaVuSans" size="9">pwd</font> - was blocked. The session was permanently dead. The AI assistant could only suggest '
    'that the user click the "Restart" button and manually run recovery commands.', body))

story.append(Paragraph(
    'What the owl observes is that this was not a random event. The conditions for catastrophic failure were baked into the system '
    'from the start. The persistent shell session was a single point of failure. The git rebase was executed without a pre-check '
    'for conflict likelihood. The framework-level guard had no escape hatch. And the entire deployment pipeline depended on a single, '
    'fragile shell session that could not be reset from within. Each of these vulnerabilities was invisible during normal operation, '
    'like cracks in a dam that only reveal themselves under pressure.', body))

story.append(Paragraph('2.2 Hidden Factors Most People Overlook', h2))

story.append(Paragraph(
    '<b>Factor 1: The Shell Prompt Hook Trap.</b> The zsh git prompt hook was the actual mechanism that locked the session. '
    'When git enters a conflict state, the prompt hook attempts to read the git status on every command, which triggers the '
    'framework-level guard that blocks tool execution. The hook itself becomes a deadlock: the guard waits for the hook to complete, '
    'but the hook cannot complete because the git index is in a conflicted state. This is a classic "guardian becomes jailer" pattern '
    'where a safety mechanism becomes the very thing that prevents recovery.', body))

story.append(Paragraph(
    '<b>Factor 2: Index Lock File Persistence.</b> When the rebase conflict occurred, git created a '
    '<font face="DejaVuSans" size="9">.git/index.lock</font> file. This file persists even after the rebase is nominally aborted, '
    'because the abort itself may fail if the index is in a corrupted state. The lock file then blocks all future git operations, '
    'creating a circular dependency: you need git to remove the lock, but git refuses to operate while the lock exists. The only '
    'escape is manual file deletion, which requires shell access - which is blocked by the prompt hook.', body))

story.append(Paragraph(
    '<b>Factor 3: Session State Entanglement.</b> The persistent shell session maintained state across multiple tool calls, including '
    'environment variables, working directory, and shell history. When the session locked, all of this state became inaccessible. '
    'This means that even if a new session were started, the deployment commands would need to be re-entered from scratch, including '
    'sensitive credentials like API tokens and GitHub PATs. The state was not checkpointed or recoverable.', body))

story.append(Paragraph(
    '<b>Factor 4: The Framework-Level Guard as Achilles Heel.</b> The guard that blocked tool execution was not part of git or the '
    'shell - it was a framework-level safety feature that detected the conflicted state and prevented any commands from running. While '
    'this guard exists to prevent accidental data loss, its rigid implementation means there is no way to override it, even when the '
    'user explicitly wants to force-recover. The guard has no "emergency override" switch, no "I know what I am doing" flag, and no '
    'fallback path. It is absolute, and in its absoluteness, it creates the very data loss risk it was designed to prevent - by forcing '
    'the user to restart the session, it guarantees that any unsaved state is lost.', body))

story.append(Paragraph('2.3 The Owl Diagnosis', h2))

story.append(Spacer(1, 4))
story.append(make_table(
    ['Hidden Factor', 'Observed Behavior', 'Root Cause', 'Severity'],
    [
        ['Shell prompt hook trap', 'All commands blocked during git conflict', 'Guardian-becomes-jailer deadlock in zsh git hook', 'Critical'],
        ['Index lock persistence', 'Git operations circular-blocked', '.git/index.lock survives rebase abort', 'Critical'],
        ['Session state entanglement', 'Credentials and env lost on restart', 'No checkpoint/serialization of session state', 'High'],
        ['Framework guard absolutism', 'No override path for intentional recovery', 'Missing emergency escape hatch', 'Critical'],
        ['No pre-flight conflict check', 'Rebase executed blindly on divergent branches', 'Missing git status/divergence analysis', 'High'],
    ],
    [CONTENT_W*0.2, CONTENT_W*0.25, CONTENT_W*0.35, CONTENT_W*0.2]
))

# ━━ SECTION 3: THE EAGLE PERSPECTIVE ━━
story.append(Spacer(1, 16))
story.append(Paragraph('3. The Eagle Perspective: Long-Term Strategic Vision', h1))
story.append(AccentLine(CONTENT_W * 0.3, 1, ACCENT))
story.append(Spacer(1, 8))

story.append(Paragraph(
    'The eagle flies high above the landscape, seeing how individual trees form a forest, how rivers connect to oceans, and how '
    'seasons cycle into years. This perspective examines the long-term strategy behind error handling architecture and how the pieces '
    'of a deployment pipeline should connect to create a resilient, self-sustaining system that grows stronger with each failure.', body))

story.append(Paragraph('3.1 The Strategic Architecture of Error Recovery', h2))

story.append(Paragraph(
    'At the strategic level, error handling is not a feature - it is the foundation upon which all other features depend. '
    'A portfolio website that cannot deploy reliably is worse than no website at all, because it erodes trust with every failed '
    'attempt. The long-term vision for this project must treat deployment as a first-class citizen, not an afterthought. This means '
    'investing in infrastructure that makes deployment automatic, verified, and recoverable.', body))

story.append(Paragraph(
    'The current architecture has a fundamental strategic weakness: it treats the development environment and the deployment pipeline '
    'as the same thing. The developer works in a persistent shell session, and when that session fails, both development and deployment '
    'are blocked. A strategically sound architecture would separate these concerns: development happens in a sandboxed environment that '
    'can be reset without affecting deployment, and deployment happens through an automated pipeline that can be triggered independently '
    'of the development session. This separation of concerns is not just good engineering practice; it is the foundation of operational '
    'resilience.', body))

story.append(Paragraph('3.2 How the Pieces Connect: A Systems View', h2))

story.append(Paragraph(
    'Viewing the system from altitude reveals four interconnected layers that must all function correctly for reliable deployment. '
    'The first layer is the <b>Code Layer</b>, where the actual application code lives. This layer is generally well-managed - builds '
    'pass, linting is clean, and the code is structured with CSS variant classes to prevent bloat. The second layer is the '
    '<b>State Layer</b>, where git repositories, environment variables, and session state are managed. This layer is fragile - '
    'a single conflict can lock the entire system. The third layer is the <b>Execution Layer</b>, where the persistent shell session '
    'and framework guards operate. This layer is brittle - it has no recovery mechanisms and no fallback paths. The fourth layer is '
    'the <b>Deployment Layer</b>, where GitHub, Vercel, and GitHub Pages integrations live. This layer is unreachable when the '
    'execution layer is locked.', body))

story.append(Paragraph(
    'The strategic insight is that resilience must be built into every layer, with each layer capable of independent recovery. '
    'If the state layer fails, the execution layer should be able to detect and repair it. If the execution layer fails, the '
    'deployment layer should be able to operate independently. Currently, a failure in any layer cascades to all layers above it, '
    'which is the opposite of resilience. The goal is to invert this: a failure in any layer should be contained and recovered '
    'without affecting adjacent layers. This is the architectural principle known as "bulkheading" in naval engineering - if one '
    'compartment floods, watertight doors prevent the ship from sinking.', body))

story.append(Paragraph('3.3 The Long-Term Vision: Self-Healing Infrastructure', h2))

story.append(Paragraph(
    'Looking even further ahead, the ultimate goal is a self-healing infrastructure that treats every error as a signal for '
    'improvement. When a git conflict occurs, the system should not just recover - it should analyze why the conflict happened, '
    'update the deployment strategy to prevent similar conflicts, and log the incident for future reference. This is the principle '
    'of antifragility, coined by Nassim Nicholas Taleb: a system that does not merely survive shocks but actually improves because '
    'of them. Every failed deployment should make the next deployment more likely to succeed. This requires three capabilities: '
    'detection (knowing when something went wrong), diagnosis (understanding why), and adaptation (changing the system to prevent '
    'recurrence). The current system has none of these capabilities, which is why the same git conflict pattern will recur indefinitely '
    'unless the architecture is fundamentally redesigned.', body))

story.append(Spacer(1, 6))
story.append(CalloutBox(
    '<b>Strategic Imperative:</b> The deployment pipeline must be elevated from a manual, session-dependent process to an automated, '
    'self-healing system. This is not a nice-to-have improvement - it is a strategic necessity for any project that depends on '
    'reliable delivery. The cost of each failed deployment compounds over time, while the cost of building resilience is a one-time '
    'investment that pays dividends forever.',
    CONTENT_W))

# ━━ SECTION 4: THE BEAVER PERSPECTIVE ━━
story.append(Spacer(1, 16))
story.append(Paragraph('4. The Beaver Perspective: Practical Error Handling Systems', h1))
story.append(AccentLine(CONTENT_W * 0.3, 1, ACCENT))
story.append(Spacer(1, 8))

story.append(Paragraph(
    'The beaver does not philosophize about dams - it builds them, one stick at a time, with practical engineering precision. '
    'This perspective designs a concrete, implementable system that solves the error handling problem step by step, with no '
    'abstractions that cannot be translated into working code within the current project architecture.', body))

story.append(Paragraph('4.1 The Error Handling Architecture: A Three-Tier Defense', h2))

story.append(Paragraph(
    'An impeccable error fix handler requires three defensive tiers, each capable of catching and resolving errors that slip past '
    'the tiers below it. The first tier is <b>Prevention</b> - detecting potential errors before they occur and taking proactive '
    'action to avoid them. The second tier is <b>Detection</b> - identifying errors that do occur as quickly as possible and '
    'classifying their severity. The third tier is <b>Recovery</b> - resolving detected errors automatically or providing the '
    'tools for manual recovery. Each tier must be independent, so that a failure in one tier does not disable the others.', body))

story.append(Paragraph('4.2 Tier 1: Prevention - Pre-Flight Checks', h2))

story.append(Paragraph(
    'Before any deployment operation, a comprehensive pre-flight check should run automatically. This check should verify: '
    '(a) that the git working tree is clean with no uncommitted changes; (b) that the local branch is up to date with the remote; '
    '(c) that no rebase, merge, or cherry-pick operation is in progress; (d) that no index.lock file exists; (e) that all required '
    'environment variables and API tokens are present and valid; and (f) that the build passes successfully. If any check fails, the '
    'deployment should be aborted with a clear, actionable error message that explains exactly what needs to be fixed and how to fix it.', body))

story.append(Spacer(1, 4))
story.append(make_table(
    ['Pre-Flight Check', 'Command', 'Failure Action', 'Auto-Fix'],
    [
        ['Working tree clean', 'git status --porcelain', 'Abort + warn', 'git stash --include-untracked'],
        ['Branch up to date', 'git fetch && git log HEAD..origin/main', 'Abort + warn', 'git pull --ff-only'],
        ['No rebase/merge in progress', 'test -d .git/rebase-merge', 'Abort + auto-clean', 'rm -rf .git/rebase-merge'],
        ['No index.lock', 'test -f .git/index.lock', 'Abort + auto-clean', 'rm -f .git/index.lock'],
        ['Env vars present', 'test -n "$VERCEL_TOKEN"', 'Abort + warn', 'Prompt user to set'],
        ['Build passes', 'npm run build', 'Abort + warn', 'Display build error log'],
    ],
    [CONTENT_W*0.2, CONTENT_W*0.3, CONTENT_W*0.2, CONTENT_W*0.3]
))

story.append(Paragraph('4.3 Tier 2: Detection - Real-Time Error Monitoring', h2))

story.append(Paragraph(
    'Errors that slip past prevention must be detected immediately. The detection system should monitor three channels: '
    'git state (via <font face="DejaVuSans" size="9">.git</font> directory watchers that alert on rebase-merge directories, '
    'index.lock files, and MERGE_HEAD presence), shell state (via exit code monitoring on every command, with automatic '
    'classification of non-zero exits as warnings or critical errors), and build state (via stdout/stderr parsing that detects '
    'common failure patterns like "CONFLICT", "error:", and "fatal:"). Each detection event should trigger a classification '
    'pipeline that determines severity, likely cause, and recommended recovery action.', body))

story.append(Paragraph(
    'The detection system should also maintain a rolling error log that tracks the last 50 errors, their timestamps, '
    'classifications, and resolutions. This log serves two purposes: it enables pattern detection (e.g., "the same conflict '
    'has occurred three times in the last hour") and it provides context for recovery (e.g., "the last successful state was '
    'commit abc123, so recovery should reset to that commit"). Without this log, every error is treated as a novel event, '
    'which prevents the system from learning and improving over time.', body))

story.append(Paragraph('4.4 Tier 3: Recovery - The Self-Healing Protocol', h2))

story.append(Paragraph(
    'When an error is detected, the recovery protocol should execute a defined sequence of escalating interventions. The first '
    'intervention is <b>Auto-Clean</b>: attempt to remove the error condition automatically. For git conflicts, this means aborting '
    'the rebase, removing lock files, and resetting to the last known good commit. For build errors, this means clearing the '
    'cache and retrying. For missing environment variables, this means checking alternative sources (e.g., .env files, CI/CD '
    'environment, secret managers).', body))

story.append(Paragraph(
    'If auto-clean fails, the second intervention is <b>Safe Reset</b>: restore the system to the last known good state '
    'without losing any work. This requires maintaining a checkpoint before every risky operation (git rebase, force push, '
    'deployment). The checkpoint should include the git HEAD commit hash, the working tree diff (if any), and the environment '
    'variable snapshot. A safe reset restores all of these, effectively rewinding time to before the error occurred.', body))

story.append(Paragraph(
    'If safe reset fails, the third intervention is <b>Escalate</b>: provide the user with a detailed diagnostic report '
    'and a set of exact commands they can run to recover manually. This report should include: the exact error that occurred, '
    'the state of the system at the time of the error, the recovery actions that were attempted and why they failed, and the '
    'specific commands needed to restore the system to a working state. This escalation should never require the user to restart '
    'the entire session - instead, it should provide a targeted fix that resolves the specific error without affecting the rest '
    'of the system.', body))

story.append(Spacer(1, 6))
story.append(CalloutBox(
    '<b>Beaver Principle:</b> Every error has a recovery path. If the recovery path is not defined before the error occurs, '
    'the system is not ready for production. The beaver builds the dam before the flood comes, not after.',
    CONTENT_W))

# ━━ SECTION 5: THE DOLPHIN PERSPECTIVE ━━
story.append(Spacer(1, 16))
story.append(Paragraph('5. The Dolphin Perspective: Creative Frontend Design Solutions', h1))
story.append(AccentLine(CONTENT_W * 0.3, 1, ACCENT))
story.append(Spacer(1, 8))

story.append(Paragraph(
    'The dolphin plays, experiments, and finds joy in discovery. This perspective applies creative, unconventional thinking '
    'to frontend design challenges, seeking solutions that most people would not normally consider. The goal is not just to fix '
    'the current design issues but to reimagine what the frontend experience could be when freed from conventional constraints.', body))

story.append(Paragraph('5.1 Reimagining Error States as Design Opportunities', h2))

story.append(Paragraph(
    'The conventional approach to error states in frontend design is to hide them - show a generic "Something went wrong" message, '
    'maybe with a retry button, and hope the user does not notice. The dolphin approach is the opposite: make error states visible, '
    'beautiful, and informative. When a deployment fails, the frontend should not just display a red badge; it should show an animated '
    'timeline of what happened, a visual diff of the conflicting changes, and a one-click recovery button that triggers the self-healing '
    'protocol. Error states are moments of heightened user attention - they are opportunities to build trust through transparency.', body))

story.append(Paragraph(
    'Consider the concept of a <b>"Deployment Heartbeat"</b> - a small, always-visible widget in the corner of the portfolio site '
    'that pulses green when the deployment is healthy and shifts to amber/red when something is wrong. Clicking the widget expands '
    'it into a full deployment dashboard that shows the current status of all deployment targets (GitHub Pages, Vercel, CDN), the '
    'last successful deployment time, and any pending errors. This turns a passive portfolio into an active, self-monitoring system '
    'that demonstrates engineering maturity to potential employers and clients.', body))

story.append(Paragraph('5.2 Creative GenZ Design: Beyond the Obvious', h2))

story.append(Paragraph(
    'The project already embraces GenZ design aesthetics with neon border sweeps, cyan accent colors (#00E5FF), and tier-badge '
    'systems. But the dolphin sees opportunities to push further. Instead of static tier badges, consider <b>living tier badges</b> '
    'that evolve based on real repository activity - a TIER-1 project that has not been updated in 6 months should visually degrade, '
    'its badge dimming and its card contracting, while an active TIER-3 project should glow brighter as its commit frequency increases. '
    'This creates a portfolio that breathes - it reflects not just what you built, but how alive your work is.', body))

story.append(Paragraph(
    'Another creative opportunity is the <b>GSAP Error Recovery Animation</b>. When the deployment pipeline encounters an error, '
    'instead of simply showing a static error message, trigger a GSAP animation that visually "repairs" the UI. The error state '
    'could appear as a fractured screen with glitch effects, then smoothly reassemble as the self-healing protocol runs. The user '
    'sees the system recovering in real-time, which transforms a moment of anxiety into a moment of delight. This is not just '
    'aesthetic - it is functional, because it provides real-time visual feedback on the recovery process.', body))

story.append(Paragraph('5.3 The Manifesto as a Living Document', h2))

story.append(Paragraph(
    'The project replaced a large manifesto block with a compact GenZ CTA button in pink (#FF6B9D). The dolphin suggests taking '
    'this further: make the manifesto a <b>living document</b> that updates based on real data. Instead of a static "Let\'s Build '
    'Together" CTA, the button text could dynamically reflect the current state of the portfolio: "127 Repos and Counting" when a '
    'new repository is added, or "Just Deployed: Project X" after a successful deployment. The CTA becomes a real-time status update, '
    'not just a marketing message. This transforms the portfolio from a static brochure into a living, breathing dashboard of '
    'professional activity, which is far more compelling to visitors who want to see active engagement rather than historical '
    'accomplishments.', body))

story.append(Paragraph('5.4 Frontend Resilience Patterns', h2))

story.append(Paragraph(
    'Beyond aesthetics, the dolphin perspective also addresses frontend resilience - the ability of the UI to remain functional '
    'even when backend services fail. Three patterns are particularly relevant here. The first is <b>Optimistic UI Updates</b>: '
    'when a deployment is triggered, immediately show the success state (green badge, "Deployed!" message) and then confirm or '
    'revert based on the actual result. This reduces perceived latency and keeps the user engaged. The second is <b>Graceful '
    'Degradation</b>: when the deployment API is unreachable, fall back to displaying the last known deployment status with a '
    '"Last checked: X minutes ago" timestamp, rather than showing an error. The third is <b>Client-Side Retry with Exponential '
    'Backoff</b>: when an API call fails, automatically retry with increasing delays (1s, 2s, 4s, 8s) before showing an error, '
    'because most deployment failures are transient and resolve within seconds.', body))

# ━━ SECTION 6: THE ELEPHANT PERSPECTIVE ━━
story.append(Spacer(1, 16))
story.append(Paragraph('6. The Elephant Perspective: Cross-Domain Insights on Proxy Architecture', h1))
story.append(AccentLine(CONTENT_W * 0.3, 1, ACCENT))
story.append(Spacer(1, 8))

story.append(Paragraph(
    'The elephant remembers everything and connects distant memories into wisdom. This perspective draws on insights from '
    'psychology, economics, science, and history to illuminate the discussion of proxy architecture and how this project can '
    'stand out in a landscape of competing portfolio sites and deployment tools.', body))

story.append(Paragraph('6.1 Proxy Types: A Comparative Analysis', h2))

story.append(Paragraph(
    'In the context of web deployment and error handling, a "proxy" is an intermediary that sits between the client and the '
    'target service, providing caching, load balancing, security filtering, or error recovery. Understanding the different types '
    'of proxies and their trade-offs is essential for designing a deployment architecture that is both resilient and efficient. '
    'The following comparison examines five major proxy paradigms and evaluates their relevance to the project.', body))

story.append(Spacer(1, 4))
story.append(make_table(
    ['Proxy Type', 'Mechanism', 'Strengths', 'Weaknesses', 'Fit for This Project'],
    [
        ['Forward Proxy', 'Client-side intermediary that forwards requests to target', 'Privacy, access control, caching', 'Single point of failure, latency overhead', 'Low - adds complexity without clear benefit'],
        ['Reverse Proxy', 'Server-side intermediary that distributes requests to backends', 'Load balancing, SSL termination, caching', 'Configuration complexity, can become bottleneck', 'High - Vercel/CDN already provide this'],
        ['Transparent Proxy', 'Intercepts traffic without client configuration', 'Zero-config, policy enforcement', 'No privacy, hard to debug, limited flexibility', 'Low - not applicable to deployment pipeline'],
        ['API Gateway', 'Manages, routes, and transforms API requests', 'Rate limiting, auth, analytics, transformation', 'Added latency, vendor lock-in risk', 'Medium - useful if API surface grows'],
        ['Service Mesh Proxy', 'Sidecar proxy for microservice communication', 'Observability, traffic management, security', 'High complexity, resource overhead, steep learning curve', 'Low - overkill for a single-service portfolio'],
    ],
    [CONTENT_W*0.12, CONTENT_W*0.2, CONTENT_W*0.2, CONTENT_W*0.22, CONTENT_W*0.26]
))

story.append(Paragraph('6.2 How This Project Can Stand Out: The Proxy as Resilience Layer', h2))

story.append(Paragraph(
    'Most portfolio sites treat the proxy as an invisible infrastructure component - something configured once and forgotten. '
    'The elephant sees an opportunity to make the proxy a visible differentiator. By exposing the proxy layer through the '
    'Deployment Heartbeat widget described in the Dolphin perspective, the project can demonstrate not just that it deploys '
    'reliably, but that it understands and monitors its own infrastructure. This is the difference between a developer who '
    'builds websites and a developer who builds systems - and employers are looking for the latter.', body))

story.append(Paragraph(
    'The specific recommendation is to implement a <b>Resilience Proxy</b> - a custom middleware layer that sits between the '
    'Next.js application and its deployment targets (GitHub Pages, Vercel). This proxy would provide: (a) automatic failover '
    'between deployment targets, so that if Vercel is down, the site automatically serves from GitHub Pages; (b) deployment '
    'health monitoring, with real-time status updates exposed via the frontend widget; (c) error recovery, automatically '
    'retrying failed deployments with exponential backoff; and (d) deployment analytics, tracking success rates, deployment '
    'frequency, and recovery times. This transforms the proxy from a passive infrastructure component into an active intelligence '
    'layer that continuously improves deployment reliability.', body))

story.append(Paragraph('6.3 Cross-Domain Insights', h2))

story.append(Paragraph(
    '<b>From Psychology: The Stress-Inoculation Model.</b> In psychology, stress inoculation therapy exposes patients to '
    'manageable stressors to build resilience against larger ones. Applied to deployment architecture, this means deliberately '
    'introducing controlled failures (e.g., killing a deployment mid-process, simulating a git conflict) to verify that the '
    'recovery system works. This practice, known as Chaos Engineering (pioneered by Netflix), ensures that the system can '
    'handle real failures because it has been tested against simulated ones. The current project has never been tested against '
    'a simulated git conflict, which is why the real conflict was catastrophic.', body))

story.append(Paragraph(
    '<b>From Economics: The Option Value of Redundancy.</b> In economics, an "option" is the right, but not the obligation, '
    'to take an action in the future. Maintaining multiple deployment targets (GitHub Pages + Vercel + potentially Cloudflare Pages) '
    'creates option value: the right to switch between targets without cost when one fails. The current project has this redundancy '
    'in theory (it deploys to both GitHub Pages and Vercel), but in practice, the deployment pipeline does not automatically failover '
    'between targets. The option exists but cannot be exercised. Making failover automatic converts the theoretical option into a '
    'practical one, dramatically increasing the system\'s resilience at near-zero marginal cost.', body))

story.append(Paragraph(
    '<b>From Science: The Redundancy Principle in Biological Systems.</b> Biological systems achieve extraordinary reliability '
    'through redundancy: two kidneys, two lungs, two hemispheres of the brain. If one fails, the other takes over. The key insight '
    'is that redundancy is not wasteful duplication - it is insurance against catastrophic failure. In the deployment architecture, '
    'this means that every critical operation should have a backup path. If the primary deployment to Vercel fails, the system should '
    'automatically deploy to GitHub Pages. If git push fails due to authentication, the system should try the backup token. If the '
    'persistent shell locks, the system should be able to spawn a new shell and resume from the last checkpoint. Each backup path '
    'dramatically reduces the probability of total system failure, following the multiplicative rule: if each path has a 1% failure '
    'rate, two independent paths reduce total failure probability to 0.01%, a hundredfold improvement.', body))

story.append(Paragraph(
    '<b>From History: The Titanic Fallacy.</b> The Titanic was deemed "unsinkable" because it had 16 watertight compartments, '
    'any 4 of which could flood without the ship sinking. But the compartments did not extend all the way to the top deck - '
    'water spilled over the tops and filled compartment after compartment. The git conflict that killed this session is a Titanic '
    'fallacy: the framework guard was supposed to prevent damage (like the watertight compartments), but because it had no '
    '"overflow protection" (no way to recover from a guard lockout), a single failure cascaded to total system failure. The lesson '
    'is that partial redundancy is worse than no redundancy, because it creates a false sense of security. Either build complete '
    'redundancy with full isolation, or acknowledge the vulnerability and plan for total failure scenarios.', body))

# ━━ SECTION 7: SYNTHESIS ━━
story.append(Spacer(1, 16))
story.append(Paragraph('7. Synthesis: Connecting the Five Perspectives', h1))
story.append(AccentLine(CONTENT_W * 0.3, 1, ACCENT))
story.append(Spacer(1, 8))

story.append(Paragraph(
    'The five perspectives reveal a coherent picture when synthesized. The Owl identified the hidden failure mechanisms '
    '(prompt hook traps, index lock persistence, session state entanglement, guard absolutism). The Eagle positioned these '
    'failures within a strategic framework (four-layer architecture with cascading failure). The Beaver designed the '
    'three-tier defense system (prevention, detection, recovery). The Dolphin reimagined error states as design opportunities '
    '(Deployment Heartbeat, living tier badges, GSAP recovery animations). And the Elephant connected the design to '
    'cross-domain wisdom (stress inoculation, option value, biological redundancy, the Titanic fallacy).', body))

story.append(Paragraph(
    'The synthesis reveals that the core problem is not a missing feature or a bug fix - it is a paradigm shift. The current '
    'system treats errors as exceptional events that should be prevented. The proposed system treats errors as expected events '
    'that should be detected, recovered from, and learned from. This shift from "prevention-only" to "prevention + detection + '
    'recovery + learning" is the essence of an impeccable error fix handler. It does not mean accepting errors as inevitable - '
    'it means building a system that is so good at recovering from errors that it appears impeccable from the outside, even when '
    'errors occur internally. The user never sees the conflict because the system resolves it before it becomes visible.', body))

story.append(Spacer(1, 4))
story.append(make_table(
    ['Perspective', 'Core Insight', 'Architectural Implication'],
    [
        ['Owl (Observation)', 'Hidden factors cause cascading failures', 'Map all failure dependencies and hidden states'],
        ['Eagle (Strategy)', 'Errors are architectural, not incidental', 'Redesign layers with independent recovery'],
        ['Beaver (Practice)', 'Three-tier defense: prevent, detect, recover', 'Implement pre-flight checks + monitoring + self-heal'],
        ['Dolphin (Creativity)', 'Error states are design opportunities', 'Make resilience visible and delightful'],
        ['Elephant (Memory)', 'Cross-domain wisdom validates the approach', 'Apply chaos engineering, redundancy, option value'],
    ],
    [CONTENT_W*0.18, CONTENT_W*0.35, CONTENT_W*0.47]
))

# ━━ SECTION 8: RECOMMENDATIONS ━━
story.append(Spacer(1, 16))
story.append(Paragraph('8. Actionable Recommendations', h1))
story.append(AccentLine(CONTENT_W * 0.3, 1, ACCENT))
story.append(Spacer(1, 8))

story.append(Paragraph(
    'The following recommendations are ordered by implementation priority, with the most critical items first. Each recommendation '
    'includes a specific implementation path, an estimated effort, and the expected impact on system resilience.', body))

story.append(Spacer(1, 4))
recs = [
    ['R1', 'Implement pre-flight deployment checks', 'Critical', '2-3 hours',
     'Create a deploy.sh script that runs all 6 pre-flight checks before any deployment operation. '
     'This single change would have prevented the git rebase conflict entirely, because the check '
     'for branch divergence would have triggered a ff-only pull instead of a rebase.'],
    ['R2', 'Add git state auto-recovery to the shell session', 'Critical', '4-6 hours',
     'Modify the zsh configuration to detect git conflict states and automatically run cleanup '
     'commands (abort rebase, remove index.lock, reset to HEAD) before the prompt hook triggers. '
     'This breaks the guardian-becomes-jailer deadlock.'],
    ['R3', 'Implement session state checkpointing', 'High', '6-8 hours',
     'Before every risky operation (git rebase, deployment), serialize the current session state '
     '(HEAD commit, working tree diff, env vars) to a .session-checkpoint.json file. On session '
     'restart, auto-detect and offer to restore from the checkpoint.'],
    ['R4', 'Build the Deployment Heartbeat widget', 'Medium', '8-12 hours',
     'Add a React component that polls deployment status endpoints (Vercel API, GitHub Actions API) '
     'and displays a real-time status indicator. This makes resilience visible and builds trust.'],
    ['R5', 'Implement automatic deployment failover', 'Medium', '4-6 hours',
     'Create a deployment orchestrator that tries Vercel first, then GitHub Pages on failure, '
     'and logs the outcome. This converts the existing theoretical redundancy into practical resilience.'],
    ['R6', 'Add chaos engineering tests', 'Low', '4-8 hours',
     'Write integration tests that deliberately trigger git conflicts, deployment failures, and '
     'API timeouts to verify that the recovery system works under controlled conditions.'],
]

story.append(make_table(
    ['ID', 'Recommendation', 'Priority', 'Effort', 'Description'],
    recs,
    [CONTENT_W*0.05, CONTENT_W*0.2, CONTENT_W*0.09, CONTENT_W*0.09, CONTENT_W*0.57]
))

# ━━ SECTION 9: APPENDIX ━━
story.append(Spacer(1, 16))
story.append(Paragraph('9. Appendix: Failure Mode Catalogue', h1))
story.append(AccentLine(CONTENT_W * 0.3, 1, ACCENT))
story.append(Spacer(1, 8))

story.append(Paragraph(
    'The following catalogue documents all identified failure modes, their symptoms, root causes, and recommended '
    'recovery strategies. This catalogue should be maintained and expanded as new failure modes are discovered.', body))

story.append(Spacer(1, 4))
story.append(make_table(
    ['Failure Mode', 'Symptom', 'Root Cause', 'Recovery Strategy'],
    [
        ['Git rebase conflict', 'All commands blocked in shell', 'Divergent branches + rebase strategy',
         'Pre-flight check + auto-abort + ff-only pull fallback'],
        ['Index lock file', 'git operations hang or fail', 'Concurrent git processes or killed git',
         'Auto-detect .git/index.lock + remove on idle'],
        ['Framework guard lockout', 'Tool calls blocked after git conflict', 'zsh prompt hook + framework guard',
         'Override flag + timeout-based guard release'],
        ['Session state loss', 'Env vars and working dir lost on restart', 'No serialization of session state',
         'Checkpoint before risky operations + restore on init'],
        ['Deployment auth failure', 'git push or vercel deploy rejected', 'Expired or invalid tokens',
         'Multi-token rotation + pre-flight token validation'],
        ['Build failure', 'npm run build exits non-zero', 'Code errors, dependency conflicts',
         'Pre-commit hooks + build verification before deploy'],
        ['Network timeout', 'API calls hang indefinitely', 'Slow or unreachable endpoints',
         'Retry with exponential backoff + timeout thresholds'],
        ['Vercel deployment failure', 'Deployment stuck or rejected', 'Build errors, config issues, quota',
         'Automatic failover to GitHub Pages + alert'],
    ],
    [CONTENT_W*0.17, CONTENT_W*0.22, CONTENT_W*0.28, CONTENT_W*0.33]
))

story.append(Spacer(1, 20))
story.append(AccentLine(CONTENT_W, 1, TEXT_MUTED))
story.append(Spacer(1, 8))
story.append(Paragraph(
    'This audit was generated on June 11, 2026 by Z.ai. The findings and recommendations are based on analysis of the '
    'shared chat session and the observed failure patterns. Implementation of the recommended changes should follow the '
    'priority order specified in Section 8, with R1 and R2 (the critical items) addressed immediately.',
    ParagraphStyle('closing', fontName='DejaVuSans', fontSize=9, leading=14, textColor=TEXT_MUTED, alignment=TA_CENTER)))

# ━━ Build PDF ━━
doc.build(story)
print(f'PDF generated: {output_path}')
