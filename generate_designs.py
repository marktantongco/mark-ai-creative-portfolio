import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
import numpy as np

# ── Global style ──────────────────────────────────────────────
plt.rcParams.update({
    'font.family': 'DejaVu Sans',
    'font.size': 9,
    'text.color': '#222222',
})

fig, axes = plt.subplots(1, 3, figsize=(18, 8), dpi=150)
fig.patch.set_facecolor('white')
fig.suptitle('Portfolio Design Approaches', fontsize=20, fontweight='bold', y=0.98)

# ================================================================
#  APPROACH A — Brutalist Industrial
# ================================================================
ax = axes[0]
ax.set_xlim(0, 10)
ax.set_ylim(0, 12)
ax.set_aspect('equal')
ax.axis('off')
ax.set_title('APPROACH A\nBrutalist Industrial', fontsize=13, fontweight='bold',
             fontfamily='DejaVu Sans', color='#111111', pad=18)

# --- background: raw concrete ---
ax.add_patch(patches.Rectangle((0.3, 1.8), 9.4, 9.0, linewidth=0,
             facecolor='#D0CCC8', zorder=0))

# --- heavy black border ---
ax.add_patch(patches.Rectangle((0.3, 1.8), 9.4, 9.0, linewidth=4,
             edgecolor='#111111', facecolor='none', zorder=5))

# --- exposed grid lines (visible seams) ---
for gx in [3.5, 6.5]:
    ax.plot([gx, gx], [1.8, 10.8], color='#999999', linewidth=1.5, linestyle='--', zorder=1)
for gy in [4.2, 6.8]:
    ax.plot([0.3, 9.7], [gy, gy], color='#999999', linewidth=1.5, linestyle='--', zorder=1)

# --- nav bar ---
ax.add_patch(patches.Rectangle((0.3, 9.6), 9.4, 1.2, linewidth=2,
             edgecolor='#111111', facecolor='#F2F0ED', zorder=2))
ax.text(5.0, 10.15, 'NAV  |  WORK  |  ABOUT  |  CONTACT', fontsize=7.5,
        fontfamily='monospace', ha='center', va='center', color='#111111',
        fontweight='bold', zorder=3)

# --- hero: "THIS IS MY WORK" ---
ax.add_patch(patches.Rectangle((0.5, 6.0), 9.0, 3.4, linewidth=3,
             edgecolor='#111111', facecolor='#111111', zorder=2))
ax.text(5.0, 7.85, 'THIS IS\nMY WORK', fontsize=28, fontfamily='monospace',
        ha='center', va='center', color='#FFFFFF', fontweight='bold',
        linespacing=0.95, zorder=3)
# red accent bar
ax.add_patch(patches.Rectangle((1.5, 6.1), 1.8, 0.35, linewidth=0,
             facecolor='#D32F2F', zorder=3))

# --- project cards (rough boxes) ---
card_positions = [(0.6, 2.1), (3.7, 2.1), (6.8, 2.1)]
card_labels = ['PROJ_01', 'PROJ_02', 'PROJ_03']
for (cx, cy), label in zip(card_positions, card_labels):
    ax.add_patch(patches.Rectangle((cx, cy), 2.6, 3.6, linewidth=2.5,
                 edgecolor='#111111', facecolor='#F2F0ED', zorder=2))
    # placeholder image area
    ax.add_patch(patches.Rectangle((cx+0.15, cy+1.2), 2.3, 2.1, linewidth=1,
                 edgecolor='#888888', facecolor='#C8C4C0', zorder=2))
    ax.text(cx+1.3, cy+0.55, label, fontsize=7.5, fontfamily='monospace',
            ha='center', va='center', color='#111111', fontweight='bold', zorder=3)

# --- bullet points ---
bullets_a = [
    "▸ Raw, unpolished aesthetic with heavy borders",
    "▸ Exposed grid structure & visible seams",
    '▸ Vibe: "I don\'t care what you think"',
]
for i, b in enumerate(bullets_a):
    ax.text(5.0, 1.3 - i * 0.45, b, fontsize=7.5, ha='center', va='center',
            fontfamily='monospace', color='#333333')


# ================================================================
#  APPROACH B — Organic Minimalism
# ================================================================
ax = axes[1]
ax.set_xlim(0, 10)
ax.set_ylim(0, 12)
ax.set_aspect('equal')
ax.axis('off')
ax.set_title('APPROACH B\nOrganic Minimalism', fontsize=13, fontweight='bold',
             fontfamily='DejaVu Sans', color='#5D5347', pad=18)

# --- background: warm cream ---
ax.add_patch(patches.Rectangle((0.3, 1.8), 9.4, 9.0, linewidth=0,
             facecolor='#FAF6F0', zorder=0))

# --- soft outer frame ---
ax.add_patch(patches.FancyBboxPatch((0.3, 1.8), 9.4, 9.0, linewidth=1,
             edgecolor='#C4B9A8', facecolor='none', boxstyle='round,pad=0.15',
             zorder=5))

# --- elegant serif name + thin line divider ---
ax.text(5.0, 9.7, 'Elena Rowe', fontsize=26, fontfamily='serif',
        ha='center', va='center', color='#5D5347', fontstyle='italic', zorder=3)
ax.plot([2.5, 7.5], [9.05, 9.05], color='#C4B9A8', linewidth=0.8, zorder=3)
ax.text(5.0, 8.55, 'portfolio', fontsize=10, fontfamily='serif',
        ha='center', va='center', color='#8B7E6A', fontstyle='italic', zorder=3)

# --- flowing organic shape (decorative) ---
theta = np.linspace(0, 2 * np.pi, 200)
blob_x = 5.0 + 1.8 * np.cos(theta) + 0.5 * np.cos(3 * theta)
blob_y = 6.8 + 1.0 * np.sin(theta) + 0.3 * np.sin(2 * theta)
ax.fill(blob_x, blob_y, color='#B5C4A8', alpha=0.35, zorder=1)
ax.plot(blob_x, blob_y, color='#8FA87A', linewidth=0.7, alpha=0.6, zorder=1)

# --- soft image placeholders ---
card_positions_b = [(0.9, 3.0), (3.9, 3.0), (6.8, 3.0)]
card_labels_b = ['Landscape', 'Portrait', 'Still Life']
soft_colors = ['#C8D4BB', '#D6CFC4', '#C4B9A8']
for (cx, cy), label, sc in zip(card_positions_b, card_labels_b, soft_colors):
    ax.add_patch(FancyBboxPatch((cx, cy), 2.5, 3.2, linewidth=0.6,
                 edgecolor='#C4B9A8', facecolor=sc, boxstyle='round,pad=0.12',
                 zorder=2))
    ax.text(cx + 1.25, cy + 0.45, label, fontsize=7, fontfamily='serif',
            ha='center', va='center', color='#6B6052', fontstyle='italic', zorder=3)

# --- subtle nav ---
nav_items = ['Work', 'About', 'Contact']
for i, item in enumerate(nav_items):
    ax.text(3.5 + i * 1.5, 2.25, item, fontsize=7.5, fontfamily='serif',
            ha='center', va='center', color='#8B7E6A', zorder=3)

# --- bullet points ---
bullets_b = [
    "▸ Soft, flowing curves with large whitespace",
    "▸ Nature-inspired muted palette (sage, cream)",
    '▸ Vibe: "Quiet confidence"',
]
for i, b in enumerate(bullets_b):
    ax.text(5.0, 1.3 - i * 0.45, b, fontsize=7.5, ha='center', va='center',
            fontfamily='serif', color='#6B6052')


# ================================================================
#  APPROACH C — Cyberpunk Dashboard
# ================================================================
ax = axes[2]
ax.set_xlim(0, 10)
ax.set_ylim(0, 12)
ax.set_aspect('equal')
ax.axis('off')
ax.set_title('APPROACH C\nCyberpunk Dashboard', fontsize=13, fontweight='bold',
             fontfamily='DejaVu Sans', color='#00E5FF', pad=18)

# --- dark background ---
ax.add_patch(patches.Rectangle((0.3, 1.8), 9.4, 9.0, linewidth=0,
             facecolor='#0A0E27', zorder=0))

# --- HUD corners ---
corner_len = 0.8
corners = [
    # (x, y, dx, dy)
    (0.3, 10.8, corner_len, 0), (0.3, 10.8, 0, -corner_len),  # top-left
    (9.7, 10.8, -corner_len, 0), (9.7, 10.8, 0, -corner_len),  # top-right
    (0.3, 1.8, corner_len, 0), (0.3, 1.8, 0, corner_len),  # bottom-left
    (9.7, 1.8, -corner_len, 0), (9.7, 1.8, 0, corner_len),  # bottom-right
]
for (cx, cy, dx, dy) in corners:
    ax.plot([cx, cx + dx], [cy, cy + dy], color='#00E5FF', linewidth=2, zorder=6)

# --- outer frame ---
ax.add_patch(patches.Rectangle((0.3, 1.8), 9.4, 9.0, linewidth=1,
             edgecolor='#00E5FF', facecolor='none', alpha=0.5, zorder=5))

# --- scan lines ---
for sy in np.arange(2.0, 10.8, 0.3):
    ax.plot([0.3, 9.7], [sy, sy], color='#00E5FF', linewidth=0.15, alpha=0.12, zorder=1)

# --- glitch-effect name ---
ax.text(5.0, 9.6, 'NEX//DEV', fontsize=26, fontfamily='monospace',
        ha='center', va='center', color='#00E5FF', fontweight='bold', zorder=3)
# glitch offset duplicate
ax.text(5.15, 9.5, 'NEX//DEV', fontsize=26, fontfamily='monospace',
        ha='center', va='center', color='#FF00FF', fontweight='bold', alpha=0.25, zorder=2)

# --- metrics dashboard ---
metrics = [
    ('PROJECTS', '047', '#00E5FF'),
    ('COMMITS', '2.8K', '#FF00FF'),
    ('UPTIME', '99.9%', '#00E5FF'),
]
for i, (label, value, clr) in enumerate(metrics):
    mx = 1.2 + i * 3.0
    my = 7.4
    ax.add_patch(patches.Rectangle((mx, my), 2.4, 1.6, linewidth=1,
                 edgecolor=clr, facecolor='#0F1435', alpha=0.85, zorder=2))
    ax.text(mx + 1.2, my + 1.05, value, fontsize=14, fontfamily='monospace',
            ha='center', va='center', color=clr, fontweight='bold', zorder=3)
    ax.text(mx + 1.2, my + 0.35, label, fontsize=6, fontfamily='monospace',
            ha='center', va='center', color='#5588AA', zorder=3)

# --- project cards (neon-bordered) ---
card_positions_c = [(0.8, 3.0), (3.7, 3.0), (6.6, 3.0)]
card_labels_c = ['SYS.α', 'SYS.β', 'SYS.γ']
card_colors_c = ['#00E5FF', '#FF00FF', '#00E5FF']
for (cx, cy), label, clr in zip(card_positions_c, card_labels_c, card_colors_c):
    ax.add_patch(patches.Rectangle((cx, cy), 2.6, 3.8, linewidth=1.5,
                 edgecolor=clr, facecolor='#0F1435', alpha=0.9, zorder=2))
    # mini placeholder
    ax.add_patch(patches.Rectangle((cx + 0.2, cy + 1.3), 2.2, 2.2, linewidth=0.5,
                 edgecolor=clr, facecolor='#151A3A', alpha=0.8, zorder=2))
    ax.text(cx + 1.3, cy + 0.55, label, fontsize=8, fontfamily='monospace',
            ha='center', va='center', color=clr, fontweight='bold', zorder=3)

# --- status bar ---
ax.add_patch(patches.Rectangle((0.3, 2.35), 9.4, 0.4, linewidth=0,
             facecolor='#0F1435', zorder=2))
ax.text(5.0, 2.55, '▸ STATUS: ONLINE  |  LATENCY: 12ms  |  NODE: ALPHA-7',
        fontsize=6, fontfamily='monospace', ha='center', va='center',
        color='#00E5FF', alpha=0.7, zorder=3)

# --- bullet points ---
bullets_c = [
    "▸ Dark background with neon HUD accents",
    "▸ Data-driven metrics & scan-line effects",
    '▸ Vibe: "Future is now"',
]
for i, b in enumerate(bullets_c):
    ax.text(5.0, 1.3 - i * 0.45, b, fontsize=7.5, ha='center', va='center',
            fontfamily='monospace', color='#445566')


# ── Final layout & save ───────────────────────────────────────
plt.tight_layout(rect=[0, 0, 1, 0.94])
output_path = '/home/z/my-project/download/design_approaches.png'
fig.savefig(output_path, dpi=150, bbox_inches='tight',
            facecolor='white', edgecolor='none')
plt.close(fig)
print(f'Saved to {output_path}')
