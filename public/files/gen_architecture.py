#!/usr/bin/env python3
"""Generate a professional system architecture diagram for the portfolio website."""

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
from matplotlib.font_manager import FontProperties
import os

# ── Constants ──────────────────────────────────────────────────────────
FIG_W, FIG_H = 16, 12
DPI = 150

BG_COLOR      = "#f7f7f6"
BOX_FILL      = "#efeeed"
BOX_BORDER    = "#c2bba5"
PRIMARY_ACC   = "#5632c3"   # left border for primary routes
SUBPAGE_ACC   = "#49d08c"   # left border for subpage
ARROW_COLOR   = "#7d7b74"
HEADER_COLOR  = "#5b5237"
TEXT_COLOR     = "#2d2a24"
SUBTLE_TEXT    = "#7d7b74"

HEADER_SIZE   = 12
BODY_SIZE     = 9
SMALL_SIZE    = 7.5

OUTPUT_PATH   = "/home/z/my-project/download/architecture_diagram.png"

# ── Fonts ──────────────────────────────────────────────────────────────
try:
    fp_header = FontProperties(family="Noto Serif SC", size=HEADER_SIZE, weight="bold")
    fp_body   = FontProperties(family="DejaVu Sans", size=BODY_SIZE)
    fp_small  = FontProperties(family="DejaVu Sans", size=SMALL_SIZE)
    fp_title  = FontProperties(family="Noto Serif SC", size=15, weight="bold")
    fp_section = FontProperties(family="Noto Serif SC", size=HEADER_SIZE, weight="bold")
except Exception:
    fp_header = FontProperties(family="DejaVu Sans", size=HEADER_SIZE, weight="bold")
    fp_body   = FontProperties(family="DejaVu Sans", size=BODY_SIZE)
    fp_small  = FontProperties(family="DejaVu Sans", size=SMALL_SIZE)
    fp_title  = FontProperties(family="DejaVu Sans", size=15, weight="bold")
    fp_section = FontProperties(family="DejaVu Sans", size=HEADER_SIZE, weight="bold")


# ── Helper: draw a rounded-rect box with optional left accent ─────────
def draw_box(ax, x, y, w, h, accent_color=None, accent_width=4):
    """Draw a rounded rectangle at (x, y) with width w, height h.
    If accent_color given, draw a thick left-border accent stripe."""
    box = FancyBboxPatch(
        (x, y), w, h,
        boxstyle="round,pad=0.15",
        facecolor=BOX_FILL,
        edgecolor=BOX_BORDER,
        linewidth=1.2,
        zorder=3,
    )
    ax.add_patch(box)

    if accent_color:
        # Draw a small rounded rect as left accent
        accent = FancyBboxPatch(
            (x, y + 0.05), accent_width / 80, h - 0.10,
            boxstyle="round,pad=0.04",
            facecolor=accent_color,
            edgecolor=accent_color,
            linewidth=0,
            zorder=4,
            clip_on=True,
        )
        ax.add_patch(accent)

    return box


def add_text(ax, x, y, text, fp=fp_body, color=TEXT_COLOR, ha="left", va="center", zorder=5):
    ax.text(x, y, text, fontproperties=fp, color=color, ha=ha, va=va, zorder=zorder)


def draw_arrow(ax, x1, y1, x2, y2, style="->,head_length=6,head_width=4"):
    arrow = FancyArrowPatch(
        (x1, y1), (x2, y2),
        arrowstyle=style,
        color=ARROW_COLOR,
        linewidth=1.5,
        connectionstyle="arc3,rad=0",
        zorder=2,
    )
    ax.add_patch(arrow)
    return arrow


def draw_dashed_arrow(ax, x1, y1, x2, y2):
    arrow = FancyArrowPatch(
        (x1, y1), (x2, y2),
        arrowstyle="->,head_length=6,head_width=4",
        color=ARROW_COLOR,
        linewidth=1.2,
        linestyle="dashed",
        connectionstyle="arc3,rad=0",
        zorder=2,
    )
    ax.add_patch(arrow)
    return arrow


# ── Build figure ───────────────────────────────────────────────────────
fig, ax = plt.subplots(figsize=(FIG_W, FIG_H), dpi=DPI)
fig.patch.set_facecolor(BG_COLOR)
ax.set_facecolor(BG_COLOR)
ax.set_xlim(0, 16)
ax.set_ylim(0, 12)
ax.axis("off")

# ── Title ──────────────────────────────────────────────────────────────
add_text(ax, 8, 11.5, "Portfolio Website — System Architecture", fp=fp_title, color=HEADER_COLOR, ha="center")
add_text(ax, 8, 11.15, "Next.js App Router  ·  GSAP Animations  ·  3-Tier Deployment Defense", fp=fp_small, color=SUBTLE_TEXT, ha="center")

# ════════════════════════════════════════════════════════════════════════
# LAYER 1 — Browser Client  (top)
# ════════════════════════════════════════════════════════════════════════
layer1_y = 10.0
draw_box(ax, 5.5, layer1_y, 5, 0.8)
add_text(ax, 8, layer1_y + 0.45, "Browser Client", fp=fp_header, color=HEADER_COLOR, ha="center")
add_text(ax, 8, layer1_y + 0.15, "React 18 · TypeScript · GSAP · Tailwind CSS", fp=fp_small, color=SUBTLE_TEXT, ha="center")

# Arrow down from Browser → Next.js
draw_arrow(ax, 8, layer1_y, 8, layer1_y - 0.45)

# ════════════════════════════════════════════════════════════════════════
# LAYER 2 — Next.js App Router  (middle, the big block)
# ════════════════════════════════════════════════════════════════════════
layer2_top = 9.5
layer2_bot = 3.5
layer2_h  = layer2_top - layer2_bot

# Section header background
header_bg = FancyBboxPatch(
    (1.0, layer2_bot), 14.0, layer2_h,
    boxstyle="round,pad=0.2",
    facecolor="#f0efed",
    edgecolor=BOX_BORDER,
    linewidth=1.5,
    linestyle="--",
    zorder=1,
)
ax.add_patch(header_bg)

# Section header text
add_text(ax, 1.5, layer2_top - 0.3, "Next.js App Router", fp=fp_section, color=HEADER_COLOR)
add_text(ax, 1.5, layer2_top - 0.6, "File-system based routing · Server Components · Streaming SSR", fp=fp_small, color=SUBTLE_TEXT)

# ── Route: / (Home) ───────────────────────────────────────────────────
home_x, home_y = 1.5, 6.8
home_w, home_h = 4.2, 2.3
draw_box(ax, home_x, home_y, home_w, home_h, accent_color=PRIMARY_ACC)
add_text(ax, home_x + 0.25, home_y + home_h - 0.25, "/  (Home)", fp=fp_header, color=PRIMARY_ACC)
add_text(ax, home_x + 0.25, home_y + home_h - 0.55, "Hero Section", fp=fp_body, color=TEXT_COLOR)
add_text(ax, home_x + 0.35, home_y + home_h - 0.75, "GSAP scroll-triggered animations", fp=fp_small, color=SUBTLE_TEXT)
add_text(ax, home_x + 0.25, home_y + home_h - 1.0, "Timeline", fp=fp_body, color=TEXT_COLOR)
add_text(ax, home_x + 0.35, home_y + home_h - 1.2, "4 variants: Terminal · HUD · Magazine · Bento", fp=fp_small, color=SUBTLE_TEXT)
add_text(ax, home_x + 0.25, home_y + home_h - 1.45, "Manifesto CTA", fp=fp_body, color=TEXT_COLOR)
add_text(ax, home_x + 0.25, home_y + home_h - 1.7, "Repo Cards (neon sweep)", fp=fp_body, color=TEXT_COLOR)
add_text(ax, home_x + 0.35, home_y + home_h - 1.9, "Hover glow · Live status badges", fp=fp_small, color=SUBTLE_TEXT)

# ── Route: /error-handler (Subpage) ────────────────────────────────────
err_x, err_y = 5.95, 6.8
err_w, err_h = 4.2, 2.3
draw_box(ax, err_x, err_y, err_w, err_h, accent_color=SUBPAGE_ACC)
add_text(ax, err_x + 0.25, err_y + err_h - 0.25, "/error-handler", fp=fp_header, color=SUBPAGE_ACC)
add_text(ax, err_x + 0.25, err_y + err_h - 0.55, "Proxy Comparison Tab", fp=fp_body, color=TEXT_COLOR)
add_text(ax, err_x + 0.35, err_y + err_h - 0.75, "Cloudflare vs Vercel vs GitHub Pages", fp=fp_small, color=SUBTLE_TEXT)
add_text(ax, err_x + 0.25, err_y + err_h - 1.0, "Error Handler Tab", fp=fp_body, color=TEXT_COLOR)
add_text(ax, err_x + 0.35, err_y + err_h - 1.2, "Pre-flight checks · Retry logic · Fallback chain", fp=fp_small, color=SUBTLE_TEXT)
add_text(ax, err_x + 0.25, err_y + err_h - 1.45, "Five Perspectives Tab", fp=fp_body, color=TEXT_COLOR)
add_text(ax, err_x + 0.35, err_y + err_h - 1.65, "Dev · Ops · User · Business · Security views", fp=fp_small, color=SUBTLE_TEXT)

# ── Route: /about ──────────────────────────────────────────────────────
about_x, about_y = 10.4, 7.9
about_w, about_h = 4.2, 1.2
draw_box(ax, about_x, about_y, about_w, about_h, accent_color=PRIMARY_ACC)
add_text(ax, about_x + 0.25, about_y + about_h - 0.25, "/about", fp=fp_header, color=PRIMARY_ACC)
add_text(ax, about_x + 0.25, about_y + about_h - 0.55, "Profile · Skills · Philosophy", fp=fp_body, color=TEXT_COLOR)
add_text(ax, about_x + 0.35, about_y + about_h - 0.8, "Animated entrance · Glassmorphism cards", fp=fp_small, color=SUBTLE_TEXT)

# ── Route: /contact ────────────────────────────────────────────────────
contact_x, contact_y = 10.4, 6.35
contact_w, contact_h = 4.2, 1.2
draw_box(ax, contact_x, contact_y, contact_w, contact_h, accent_color=PRIMARY_ACC)
add_text(ax, contact_x + 0.25, contact_y + contact_h - 0.25, "/contact", fp=fp_header, color=PRIMARY_ACC)
add_text(ax, contact_x + 0.25, contact_y + contact_h - 0.55, "Form · Social Links · Map", fp=fp_body, color=TEXT_COLOR)
add_text(ax, contact_x + 0.35, contact_y + contact_h - 0.8, "Formspree integration · Validation", fp=fp_small, color=SUBTLE_TEXT)

# ── Horizontal tree lines from Router header to route boxes ────────────
# Connector: central router point → each route
router_cx = 8
router_cy = layer2_top - 0.9  # just below the router header text

# Vertical trunk
ax.plot([router_cx, router_cx], [router_cy, router_cy - 0.3], color=ARROW_COLOR, lw=1.5, zorder=2)
# Horizontal spread
spread_y = router_cy - 0.3
ax.plot([home_x + home_w/2, contact_x + contact_w/2], [spread_y, spread_y], color=ARROW_COLOR, lw=1.5, zorder=2)

# Vertical drops to each route box
for cx in [home_x + home_w/2, err_x + err_w/2, about_x + about_w/2, contact_x + contact_w/2]:
    ax.plot([cx, cx], [spread_y, spread_y - 0.35], color=ARROW_COLOR, lw=1.5, zorder=2)
    # small arrowhead triangle
    ax.annotate("", xy=(cx, spread_y - 0.35), xytext=(cx, spread_y - 0.15),
                arrowprops=dict(arrowstyle="->,head_length=5,head_width=3", color=ARROW_COLOR, lw=1.2),
                zorder=2)

# ── Bottom-level boxes inside Layer 2 ──────────────────────────────────
# Shared components row
shared_y = 4.0
shared_h = 0.9

# GSAP Engine
gsap_x, gsap_w = 1.5, 3.2
draw_box(ax, gsap_x, shared_y, gsap_w, shared_h)
add_text(ax, gsap_x + 0.2, shared_y + shared_h - 0.25, "GSAP Animation Engine", fp=fp_header, color=HEADER_COLOR)
add_text(ax, gsap_x + 0.2, shared_y + shared_h - 0.55, "ScrollTrigger · Timeline · SplitText", fp=fp_small, color=SUBTLE_TEXT)

# Tailwind / Design System
tw_x, tw_w = 5.0, 3.2
draw_box(ax, tw_x, shared_y, tw_w, shared_h)
add_text(ax, tw_x + 0.2, shared_y + shared_h - 0.25, "Design System", fp=fp_header, color=HEADER_COLOR)
add_text(ax, tw_x + 0.2, shared_y + shared_h - 0.55, "Tailwind CSS 4 · CSS Variables", fp=fp_small, color=SUBTLE_TEXT)

# State Management
state_x, state_w = 8.5, 3.2
draw_box(ax, state_x, shared_y, state_w, shared_h)
add_text(ax, state_x + 0.2, shared_y + shared_h - 0.25, "State & Data", fp=fp_header, color=HEADER_COLOR)
add_text(ax, state_x + 0.2, shared_y + shared_h - 0.55, "React Context · SWR hooks", fp=fp_small, color=SUBTLE_TEXT)

# Component Library
comp_x, comp_w = 12.0, 3.2
draw_box(ax, comp_x, shared_y, comp_w, shared_h)
add_text(ax, comp_x + 0.2, shared_y + shared_h - 0.25, "Component Library", fp=fp_header, color=HEADER_COLOR)
add_text(ax, comp_x + 0.2, shared_y + shared_h - 0.55, "shadcn/ui · Radix · Lucide", fp=fp_small, color=SUBTLE_TEXT)

# ════════════════════════════════════════════════════════════════════════
# Arrow from Layer 2 bottom → Layer 3
# ════════════════════════════════════════════════════════════════════════
draw_arrow(ax, 8, layer2_bot, 8, layer2_bot - 0.55)

# ════════════════════════════════════════════════════════════════════════
# LAYER 3 — Resilience Proxy Middleware
# ════════════════════════════════════════════════════════════════════════
layer3_y = 2.3
layer3_h = 0.9

proxy_bg = FancyBboxPatch(
    (2.5, layer3_y - 0.1), 11, layer3_h + 0.2,
    boxstyle="round,pad=0.15",
    facecolor="#f0efed",
    edgecolor=BOX_BORDER,
    linewidth=1.2,
    linestyle="--",
    zorder=1,
)
ax.add_patch(proxy_bg)

add_text(ax, 3.0, layer3_y + layer3_h - 0.1, "Resilience Proxy Middleware", fp=fp_section, color=HEADER_COLOR)

# Vercel
vercel_x, vercel_w = 6.5, 2.8
draw_box(ax, vercel_x, layer3_y + 0.1, vercel_w, 0.55, accent_color=PRIMARY_ACC)
add_text(ax, vercel_x + 0.2, layer3_y + 0.42, "Vercel", fp=fp_header, color=PRIMARY_ACC, ha="left")
add_text(ax, vercel_x + vercel_w - 0.2, layer3_y + 0.42, "PRIMARY", fp=fp_small, color=SUBTLE_TEXT, ha="right")

# GitHub Pages
gh_x, gh_w = 9.6, 2.8
draw_box(ax, gh_x, layer3_y + 0.1, gh_w, 0.55, accent_color=SUBPAGE_ACC)
add_text(ax, gh_x + 0.2, layer3_y + 0.42, "GitHub Pages", fp=fp_header, color=SUBPAGE_ACC, ha="left")
add_text(ax, gh_x + gh_w - 0.2, layer3_y + 0.42, "FALLBACK", fp=fp_small, color=SUBTLE_TEXT, ha="right")

# Arrow from Vercel → GitHub Pages (failover)
draw_dashed_arrow(ax, vercel_x + vercel_w + 0.05, layer3_y + 0.38, gh_x - 0.05, layer3_y + 0.38)
add_text(ax, (vercel_x + vercel_w + gh_x) / 2, layer3_y + 0.58, "failover", fp=fp_small, color=SUBTLE_TEXT, ha="center")

# ════════════════════════════════════════════════════════════════════════
# Arrow from Layer 3 → Layer 4
# ════════════════════════════════════════════════════════════════════════
draw_arrow(ax, 8, layer3_y - 0.1, 8, 1.55)

# ════════════════════════════════════════════════════════════════════════
# LAYER 4 — Deployment Pipeline
# ════════════════════════════════════════════════════════════════════════
layer4_y = 0.3
layer4_h = 1.1

deploy_bg = FancyBboxPatch(
    (1.5, layer4_y - 0.1), 13, layer4_h + 0.2,
    boxstyle="round,pad=0.15",
    facecolor="#f0efed",
    edgecolor=BOX_BORDER,
    linewidth=1.2,
    linestyle="--",
    zorder=1,
)
ax.add_patch(deploy_bg)

add_text(ax, 2.0, layer4_y + layer4_h - 0.1, "Deployment Pipeline", fp=fp_section, color=HEADER_COLOR)

# deploy.sh
d1_x, d1_w = 2.0, 3.5
draw_box(ax, d1_x, layer4_y + 0.1, d1_w, 0.6, accent_color=PRIMARY_ACC)
add_text(ax, d1_x + 0.2, layer4_y + 0.52, "deploy.sh", fp=fp_header, color=PRIMARY_ACC)
add_text(ax, d1_x + 0.2, layer4_y + 0.25, "3-tier defense · Build → Validate → Deploy", fp=fp_small, color=SUBTLE_TEXT)

# git-recovery.sh
d2_x, d2_w = 5.8, 3.5
draw_box(ax, d2_x, layer4_y + 0.1, d2_w, 0.6, accent_color=SUBPAGE_ACC)
add_text(ax, d2_x + 0.2, layer4_y + 0.52, "git-recovery.sh", fp=fp_header, color=SUBPAGE_ACC)
add_text(ax, d2_x + 0.2, layer4_y + 0.25, "Auto-recovery · Rollback on failure", fp=fp_small, color=SUBTLE_TEXT)

# Heartbeat Widget
d3_x, d3_w = 9.6, 4.2
draw_box(ax, d3_x, layer4_y + 0.1, d3_w, 0.6, accent_color="#e06040")
add_text(ax, d3_x + 0.2, layer4_y + 0.52, "Heartbeat Widget", fp=fp_header, color="#c04030")
add_text(ax, d3_x + 0.2, layer4_y + 0.25, "Real-time status · Uptime monitoring · Visual indicator", fp=fp_small, color=SUBTLE_TEXT)

# ── Legend ──────────────────────────────────────────────────────────────
legend_x, legend_y = 12.0, 10.0
legend_w, legend_h = 3.5, 1.3

legend_box = FancyBboxPatch(
    (legend_x, legend_y), legend_w, legend_h,
    boxstyle="round,pad=0.1",
    facecolor=BOX_FILL,
    edgecolor=BOX_BORDER,
    linewidth=1.0,
    zorder=5,
)
ax.add_patch(legend_box)

add_text(ax, legend_x + 0.2, legend_y + legend_h - 0.2, "Legend", fp=fp_header, color=HEADER_COLOR)

# Primary accent
accent1 = FancyBboxPatch((legend_x + 0.15, legend_y + 0.7), 0.15, 0.22, boxstyle="round,pad=0.02",
                          facecolor=PRIMARY_ACC, edgecolor=PRIMARY_ACC, linewidth=0, zorder=6)
ax.add_patch(accent1)
add_text(ax, legend_x + 0.45, legend_y + 0.81, "Primary route", fp=fp_small, color=TEXT_COLOR)

# Subpage accent
accent2 = FancyBboxPatch((legend_x + 0.15, legend_y + 0.35), 0.15, 0.22, boxstyle="round,pad=0.02",
                          facecolor=SUBPAGE_ACC, edgecolor=SUBPAGE_ACC, linewidth=0, zorder=6)
ax.add_patch(accent2)
add_text(ax, legend_x + 0.45, legend_y + 0.46, "Subpage / Error handler", fp=fp_small, color=TEXT_COLOR)

# Dashed = failover
ax.plot([legend_x + 0.15, legend_x + 0.30], [legend_y + 0.12, legend_y + 0.12],
        color=ARROW_COLOR, lw=1.2, linestyle="dashed", zorder=6)
add_text(ax, legend_x + 0.45, legend_y + 0.12, "Failover path", fp=fp_small, color=TEXT_COLOR)

# ── Save ───────────────────────────────────────────────────────────────
os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
fig.savefig(OUTPUT_PATH, dpi=DPI, bbox_inches="tight", facecolor=BG_COLOR, edgecolor="none")
plt.close(fig)
print(f"✅ Architecture diagram saved to: {OUTPUT_PATH}")
