#!/usr/bin/env python3
"""Generate a professional decision tree diagram for portfolio website recreation decisions."""

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch
import numpy as np

# ── Style constants ──
PRIMARY = "#5632c3"
SECONDARY = "#49d08c"
MUTED = "#7d7b74"
BG = "#f7f7f6"
NODE_FILL = "#efeeed"
DECISION_FILL = "#5b5237"
LEAF_FILL = "#efeeed"
LINE_COLOR = "#9e9a93"
TEXT_DARK = "#2d2b28"
TEXT_LIGHT = "#f7f7f6"
BADGE_BG = PRIMARY
BADGE_TEXT = "#ffffff"

# Font setup
plt.rcParams.update({
    'font.family': 'DejaVu Sans',
    'font.size': 9,
    'axes.facecolor': BG,
    'figure.facecolor': BG,
    'text.color': TEXT_DARK,
})


def draw_rounded_box(ax, x, y, w, h, fill, text, fontsize=9, text_color=TEXT_DARK,
                     edge_color=MUTED, linewidth=1.0, bold=False, sub_text=None):
    """Draw a rounded rectangle node with centered text."""
    box = FancyBboxPatch(
        (x - w / 2, y - h / 2), w, h,
        boxstyle="round,pad=0.12",
        facecolor=fill,
        edgecolor=edge_color,
        linewidth=linewidth,
        zorder=3,
    )
    ax.add_patch(box)

    weight = "bold" if bold else "normal"
    if sub_text:
        ax.text(x, y + h * 0.12, text, ha='center', va='center',
                fontsize=fontsize, fontweight=weight, color=text_color, zorder=4)
        ax.text(x, y - h * 0.18, sub_text, ha='center', va='center',
                fontsize=fontsize - 2, fontweight='normal', color=MUTED, zorder=4,
                style='italic')
    else:
        ax.text(x, y, text, ha='center', va='center',
                fontsize=fontsize, fontweight=weight, color=text_color, zorder=4)


def draw_badge(ax, x, y, text, fontsize=7):
    """Draw a small confidence badge."""
    bbox_props = dict(
        boxstyle="round,pad=0.2",
        facecolor=BADGE_BG,
        edgecolor='none',
        alpha=0.9,
    )
    ax.text(x, y, text, ha='center', va='center',
            fontsize=fontsize, fontweight='bold', color=BADGE_TEXT,
            bbox=bbox_props, zorder=5)


def draw_line(ax, x1, y1, x2, y2, label=None, label_color=SECONDARY, lw=1.0):
    """Draw a thin connecting line with optional edge label."""
    ax.plot([x1, x2], [y1, y2], color=LINE_COLOR, linewidth=lw,
            solid_capstyle='round', zorder=1)
    if label:
        mx, my = (x1 + x2) / 2, (y1 + y2) / 2
        ax.text(mx, my + 0.18, label, ha='center', va='center',
                fontsize=7.5, fontweight='bold', color=label_color, zorder=4,
                bbox=dict(boxstyle='round,pad=0.15', facecolor=BG, edgecolor='none', alpha=0.85))


# ── Figure setup ──
fig, ax = plt.subplots(figsize=(14, 10), dpi=150)
ax.set_xlim(-1, 17)
ax.set_ylim(-0.5, 11)
ax.set_aspect('auto')
ax.axis('off')

# ═══════════════════════════════════════════════════
# LAYOUT COORDINATES (x, y) — tree positioned top-down
# ═══════════════════════════════════════════════════

# ── Level 0: Root ──
root_x, root_y = 8, 10.2

# ── Level 1: Three main branches ──
l1_yes_x, l1_yes_y = 3.2, 8.2          # "What's the primary purpose?"
l1_tech_x, l1_tech_y = 8, 8.2           # "Tech Stack Decision"
l1_deploy_x, l1_deploy_y = 13, 8.2      # "Deployment Strategy"

# ── Level 2A: Primary purpose branches ──
l2a_show_x, l2a_show_y = 1.6, 6.2      # "3 Design Approaches"
l2a_story_x, l2a_story_y = 4.8, 6.2    # "Timeline Architecture"

# ── Level 3A: Design approaches ──
l3a_a_x, l3a_a_y = 0.3, 4.2            # "A: Brutalist Industrial"
l3a_b_x, l3a_b_y = 1.6, 4.2            # "B: Organic Minimalism"
l3a_c_x, l3a_c_y = 2.9, 4.2            # "C: Cyberpunk Dashboard"

# ── Level 3B: Timeline architecture ──
l3b_lin_x, l3b_lin_y = 4.1, 4.2        # "Linear narrative"
l3b_nonlin_x, l3b_nonlin_y = 5.6, 4.2  # "Non-linear exploration"

# ── Level 2B: Tech stack branches ──
l2b_next_x, l2b_next_y = 7.0, 6.2      # "Already chosen - optimize"
l2b_alt_x, l2b_alt_y = 9.2, 6.2        # "Not recommended (conf 8/10)"

# ── Level 3C: Next.js sub ──
l3c_ssr_x, l3c_ssr_y = 6.4, 4.2        # "SSR for SEO"
l3c_csr_x, l3c_csr_y = 7.8, 4.2        # "CSR for animations"

# ── Level 2C: Deployment branches ──
l2c_vercel_x, l2c_vercel_y = 12.0, 6.2  # "Fast, integrated"
l2c_self_x, l2c_self_y = 14.2, 6.2      # "More control, more work"

# ── Level 3D: Vercel sub ──
l3d_gh_x, l3d_gh_y = 12.0, 4.2         # "GitHub Pages fallback"

# ═══════════════════════════════════
# DRAW NODES
# ═══════════════════════════════════

# Decision node dimensions
dw, dh = 2.6, 0.7        # decision box
lw2, lh2 = 2.4, 0.65     # leaf box
sw, sh = 2.2, 0.55       # small leaf

# Root
draw_rounded_box(ax, root_x, root_y, 2.8, 0.8, DECISION_FILL,
                 "Is this a portfolio?", fontsize=11, text_color=TEXT_LIGHT,
                 edge_color=DECISION_FILL, bold=True)

# Level 1 — decision nodes
draw_rounded_box(ax, l1_yes_x, l1_yes_y, dw, dh, DECISION_FILL,
                 "What's the primary purpose?", fontsize=9, text_color=TEXT_LIGHT,
                 edge_color=DECISION_FILL, bold=True)
draw_rounded_box(ax, l1_tech_x, l1_tech_y, dw, dh, DECISION_FILL,
                 "Tech Stack Decision", fontsize=9, text_color=TEXT_LIGHT,
                 edge_color=DECISION_FILL, bold=True)
draw_rounded_box(ax, l1_deploy_x, l1_deploy_y, dw, dh, DECISION_FILL,
                 "Deployment Strategy", fontsize=9, text_color=TEXT_LIGHT,
                 edge_color=DECISION_FILL, bold=True)

# Level 2A
draw_rounded_box(ax, l2a_show_x, l2a_show_y, lw2, lh2, NODE_FILL,
                 "3 Design Approaches", fontsize=8.5, bold=True)
draw_rounded_box(ax, l2a_story_x, l2a_story_y, lw2, lh2, NODE_FILL,
                 "Timeline Architecture", fontsize=8.5, bold=True)

# Level 3A — leaf nodes
draw_rounded_box(ax, l3a_a_x, l3a_a_y, sw, sh, LEAF_FILL,
                 "A: Brutalist Industrial", fontsize=8)
draw_rounded_box(ax, l3a_b_x, l3a_b_y, sw, sh, LEAF_FILL,
                 "B: Organic Minimalism", fontsize=8)
draw_rounded_box(ax, l3a_c_x, l3a_c_y, sw, sh, LEAF_FILL,
                 "C: Cyberpunk Dashboard", fontsize=8)

# Level 3B — leaf nodes
draw_rounded_box(ax, l3b_lin_x, l3b_lin_y, sw, sh, LEAF_FILL,
                 "Linear narrative", fontsize=8)
draw_rounded_box(ax, l3b_nonlin_x, l3b_nonlin_y, sw, sh, LEAF_FILL,
                 "Non-linear exploration", fontsize=8)

# Level 2B — tech stack
draw_rounded_box(ax, l2b_next_x, l2b_next_y, lw2 + 0.2, lh2, NODE_FILL,
                 "Already chosen — optimize", fontsize=8.5, bold=True,
                 sub_text="Next.js + GSAP")
draw_rounded_box(ax, l2b_alt_x, l2b_alt_y, lw2 + 0.2, lh2, NODE_FILL,
                 "Alternative", fontsize=8.5, bold=True,
                 sub_text="Not recommended")

# Level 3C — leaf nodes
draw_rounded_box(ax, l3c_ssr_x, l3c_ssr_y, sw, sh, LEAF_FILL,
                 "SSR for SEO", fontsize=8)
draw_rounded_box(ax, l3c_csr_x, l3c_csr_y, sw, sh, LEAF_FILL,
                 "CSR for animations", fontsize=8)

# Level 2C — deployment
draw_rounded_box(ax, l2c_vercel_x, l2c_vercel_y, lw2, lh2, NODE_FILL,
                 "Fast, integrated", fontsize=8.5, bold=True,
                 sub_text="Vercel primary")
draw_rounded_box(ax, l2c_self_x, l2c_self_y, lw2, lh2, NODE_FILL,
                 "More control, more work", fontsize=8.5, bold=True,
                 sub_text="Self-hosted")

# Level 3D — leaf
draw_rounded_box(ax, l3d_gh_x, l3d_gh_y, sw + 0.4, sh, LEAF_FILL,
                 "GitHub Pages fallback", fontsize=8)

# ═══════════════════════════════════
# DRAW CONNECTING LINES
# ═══════════════════════════════════

# Root → Level 1
draw_line(ax, root_x, root_y - 0.4, l1_yes_x, l1_yes_y + 0.35, label="YES")
draw_line(ax, root_x, root_y - 0.4, l1_tech_x, l1_tech_y + 0.35)
draw_line(ax, root_x, root_y - 0.4, l1_deploy_x, l1_deploy_y + 0.35)

# Level 1 → Level 2A
draw_line(ax, l1_yes_x, l1_yes_y - 0.35, l2a_show_x, l2a_show_y + 0.325, label="Showcase work")
draw_line(ax, l1_yes_x, l1_yes_y - 0.35, l2a_story_x, l2a_story_y + 0.325, label="Tell a story")

# Level 2A → Level 3A
draw_line(ax, l2a_show_x, l2a_show_y - 0.325, l3a_a_x, l3a_a_y + 0.275)
draw_line(ax, l2a_show_x, l2a_show_y - 0.325, l3a_b_x, l3a_b_y + 0.275)
draw_line(ax, l2a_show_x, l2a_show_y - 0.325, l3a_c_x, l3a_c_y + 0.275)

# Level 2A → Level 3B
draw_line(ax, l2a_story_x, l2a_story_y - 0.325, l3b_lin_x, l3b_lin_y + 0.275)
draw_line(ax, l2a_story_x, l2a_story_y - 0.325, l3b_nonlin_x, l3b_nonlin_y + 0.275)

# Level 1 Tech → Level 2B
draw_line(ax, l1_tech_x, l1_tech_y - 0.35, l2b_next_x, l2b_next_y + 0.325, label="Next.js + GSAP")
draw_line(ax, l1_tech_x, l1_tech_y - 0.35, l2b_alt_x, l2b_alt_y + 0.325, label="Other")

# Level 2B → Level 3C
draw_line(ax, l2b_next_x, l2b_next_y - 0.325, l3c_ssr_x, l3c_ssr_y + 0.275)
draw_line(ax, l2b_next_x, l2b_next_y - 0.325, l3c_csr_x, l3c_csr_y + 0.275)

# Level 1 Deploy → Level 2C
draw_line(ax, l1_deploy_x, l1_deploy_y - 0.35, l2c_vercel_x, l2c_vercel_y + 0.325, label="Vercel")
draw_line(ax, l1_deploy_x, l1_deploy_y - 0.35, l2c_self_x, l2c_self_y + 0.325, label="Self-hosted")

# Level 2C → Level 3D
draw_line(ax, l2c_vercel_x, l2c_vercel_y - 0.325, l3d_gh_x, l3d_gh_y + 0.275)

# ═══════════════════════════════════
# DRAW CONFIDENCE BADGES
# ═══════════════════════════════════

# YES branch conf 9/10
draw_badge(ax, (root_x + l1_yes_x) / 2 + 0.5, (root_y + l1_yes_y) / 2 + 0.05, "conf 9/10")

# Alternative "Not recommended" conf 8/10
draw_badge(ax, l2b_alt_x + 1.35, l2b_alt_y + 0.15, "conf 8/10", fontsize=6.5)

# ═══════════════════════════════════
# DECORATIVE TITLE
# ═══════════════════════════════════
ax.text(8, 0.5, "Portfolio Website Recreation — Decision Tree",
        ha='center', va='center', fontsize=13, fontweight='bold',
        color=PRIMARY, zorder=4)

# Subtle legend
legend_y = 0.0
legend_items = [
    (DECISION_FILL, "Decision Node"),
    (NODE_FILL, "Category Node"),
    (LEAF_FILL, "Leaf / Option"),
]
for i, (color, label) in enumerate(legend_items):
    lx = 5.5 + i * 3.2
    box = FancyBboxPatch((lx - 0.25, legend_y - 0.12), 0.5, 0.24,
                         boxstyle="round,pad=0.05", facecolor=color,
                         edgecolor=MUTED, linewidth=0.5, zorder=4)
    ax.add_patch(box)
    ax.text(lx + 0.5, legend_y, label, ha='left', va='center',
            fontsize=7.5, color=MUTED, zorder=4)

plt.tight_layout()

# ── Save ──
output_path = "/home/z/my-project/download/decision_tree.png"
fig.savefig(output_path, dpi=150, bbox_inches='tight', facecolor=BG, edgecolor='none')
plt.close(fig)

print(f"✅ Decision tree saved to: {output_path}")
