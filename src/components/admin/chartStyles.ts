/** Tooltip styling for recharts, so hover cards follow the theme. */
export const chartTooltip = {
  contentStyle: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    boxShadow: "var(--shadow)",
    color: "var(--text)",
    fontSize: 13,
  },
  labelStyle: { color: "var(--text-muted)", marginBottom: 2 },
  itemStyle: { color: "var(--text)" },
  cursor: { fill: "var(--surface-2)", stroke: "var(--border)" },
};

export const chartAxis = {
  tick: { fontSize: 12, fill: "var(--text-muted)" },
  axisLine: false,
  tickLine: false,
};
