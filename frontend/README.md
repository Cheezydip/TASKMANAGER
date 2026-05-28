## TaskFlow Slate Frontend Design Instructions

Use the HTML and CSS in `taskflow-slate.html` as the single source of truth. Preserve every layout, spacing, color, and interaction exactly as defined there. The quickest path is to reuse the class names and tokens from the HTML so the CSS can be ported without deviations.

### 1) Global foundations

**Fonts**
- Primary: `Syne` (400/500/600/700)
- Mono: `DM Mono` (300/400/500, italic variants available)
- Import from Google Fonts exactly as in the HTML.

**Root tokens**
Keep these variables exactly (names and values):
- `--bg: #0b0b0e`
- `--surface: #111115`
- `--card: #17171d`
- `--elevated: #1e1e26`
- `--raised: #25252f`
- `--border: rgba(255,255,255,0.055)`
- `--border-hover: rgba(255,255,255,0.11)`
- `--border-active: rgba(255,255,255,0.18)`
- `--text: #dde0ef`
- `--text-muted: #565869`
- `--text-dim: #333445`
- `--accent: #5b9cf6`
- `--accent-dim: rgba(91,156,246,0.1)`
- `--low: #4dc88a`
- `--low-dim: rgba(77,200,138,0.1)`
- `--medium: #d49058`
- `--medium-dim: rgba(212,144,88,0.1)`
- `--high: #d45870`
- `--high-dim: rgba(212,88,112,0.1)`

**Base reset**
- `*` uses `box-sizing: border-box` with zero margin and padding.
- `html, body` set `background: var(--bg)`, `color: var(--text)`, `font-family: Syne`, `height: 100%`, `overflow: hidden`.
- Custom thin scrollbar (`3px`) with `var(--raised)` thumb.

### 2) Layout grid

Use a 3-column grid layout in a single `.app` container:
- `grid-template-columns: 216px 1fr 272px`
- `height: 100vh`
- `overflow: hidden`

Columns:
1. **Sidebar** (left)
2. **Main content** (center)
3. **Right panel** (analytics)

### 3) Sidebar (left)

Structure (preserve class names):
- `.sidebar` (surface background, right border)
- `.logo` containing `.logo-mark` and `.logo-name`
- `.user-card` with:
  - `.user-row` containing `.avatar`, `.user-meta`, `.user-name`, `.user-tag`
  - `.prod-row` with label and percent (`#prod-pct`)
  - `.prod-track` and `.prod-fill` (`#prod-fill`)
- `.nav` with `.nav-item` entries (active state)
- `.tip-card` with `.tip-label`, `.tip-dot`, `.tip-text`

Key visual rules:
- Sidebar background `var(--surface)` with `0.5px` right border.
- Card surfaces use `var(--card)` with `0.5px` border and `14px` radius.
- Active nav item uses `var(--accent-dim)` background and accent text.

### 4) Main content (center)

**Header**
- `.main-header` contains title block and `.btn-add`.
- `.page-title` uses `21px`, weight `700`, negative letter spacing.
- `.page-sub` uses `11.5px` muted text.

**Stat grid**
- `.stat-grid` = 4 equal columns with `10px` gap.
- `.stat-cell` uses `var(--card)` background with border and `14px` radius.
- Each cell has `.stat-pip`, `.stat-num` (DM Mono, `28px`), `.stat-lbl`.
- Hover state lightens border and background.

**Task panel**
- `.task-panel` with header (`.task-hd`) and body (`.task-list`).
- Header has `.task-hd-left` and `.task-badge`.
- Filter tabs `.f-tab` with `.on` state.
- Empty state: `.empty` with `.empty-glyph`, `.empty-title`, `.empty-hint`.
- Task rows: `.t-item` with `.t-check`, `.t-body`, `.t-name`, `.t-meta`, `.p-badge`, `.t-del`.
- Done state: `.t-item.done` reduces opacity and adds line-through to `.t-name`.
- Delete button `.t-del` fades in on hover.

**Add row**
- `.add-row` with `.btn-ghost` (text button, muted -> accent hover).

### 5) Right panel (analytics)

Structure:
- `.panel` with surface background and left border.
- Several `.bento` cards (card background, border, `14px` radius).

**Task statistics**
- `.mini-grid` (2x2), each `.mini-cell` uses `var(--elevated)` background.
- `.mini-num` uses DM Mono `22px`.

**Progress**
- `.prog-track` with `.prog-fill` (accent fill, animated width).
- `.b-label` includes `.b-label-mono` for numeric label.

**Recent activity**
- Empty state uses `.act-empty`, `.act-glyph`, `.act-none`, `.act-sub`.
- Activity item uses `.act-item`, `.act-dot`, `.act-text`, `.act-time`.

### 6) Modal

Elements:
- `.overlay` full-screen with `rgba(5,5,8,0.75)` backdrop.
- `.modal` surface background, `18px` radius, `28px` padding, `430px` width.
- `.m-title`, `.m-sub` for header.
- Form groups `.f-grp` with `.f-lbl` and `.f-inp`.
- Priority row `.pri-row` with `.pri-opt` and active states `.on-low/.on-medium/.on-high`.
- Actions `.m-actions` with `.btn-cancel` and `.btn-ok`.

Interactions:
- `.overlay.open` enables visibility and modal slide-in.
- `.f-inp.err` uses `var(--high)` border.

### 7) Animation

Keep the `rise` keyframes and apply it to:
- `.stat-cell`
- `.task-panel`
- `.bento`
- `.t-item`
- `.act-item`

### 8) Behavior mapping (UI only)

Even if behavior is implemented in React:
- Preserve element IDs used by the HTML (`#task-list`, `#task-count`, `#prod-fill`, etc.) to avoid accidental UI drift.
- Preserve button and tab classes for hover/active states.

### 9) File placement guidance

If converting to React:
- Place the global CSS in a single stylesheet (e.g., `src/styles/taskflow-slate.css`) and import it at the app root.
- Keep the class names identical to the HTML.
- Split UI into Sidebar, Main, Panel, and Modal components, but do not rename classes or change structure.
