import React, { useEffect, useState } from "react";

/**
 * App-wide custom tooltip, styled like the sidebar's option tooltips.
 *
 * Usage: put `data-tooltip="Label"` on ANY element (instead of the native
 * `title`). Optionally set `data-tip-pos="top|bottom|left|right"` (default
 * "top"). One layer is mounted once near the app root; it listens via event
 * delegation and renders a single fixed-position bubble — so it never gets
 * clipped by `overflow` containers and stays consistent everywhere.
 */
const GAP = 8;

const TooltipLayer = () => {
  const [tip, setTip] = useState(null); // { text, rect, pos }

  useEffect(() => {
    let current = null;

    const show = (el) => {
      const text = el.getAttribute("data-tooltip");
      if (!text) return;
      current = el;
      setTip({
        text,
        rect: el.getBoundingClientRect(),
        pos: el.getAttribute("data-tip-pos") || "top",
      });
    };

    const hide = () => {
      current = null;
      setTip(null);
    };

    const onOver = (e) => {
      const el = e.target.closest?.("[data-tooltip]");
      if (el && el !== current) show(el);
    };

    const onOut = (e) => {
      if (!current) return;
      // Hide once the pointer truly leaves the current target (not into a child).
      const related = e.relatedTarget;
      if (!related || !current.contains(related)) hide();
    };

    document.addEventListener("mouseover", onOver, true);
    document.addEventListener("mouseout", onOut, true);
    document.addEventListener("focusin", onOver, true);
    document.addEventListener("focusout", onOut, true);
    // Any scroll/resize/click invalidates the anchored position — just hide.
    window.addEventListener("scroll", hide, true);
    window.addEventListener("resize", hide, true);
    document.addEventListener("click", hide, true);

    return () => {
      document.removeEventListener("mouseover", onOver, true);
      document.removeEventListener("mouseout", onOut, true);
      document.removeEventListener("focusin", onOver, true);
      document.removeEventListener("focusout", onOut, true);
      window.removeEventListener("scroll", hide, true);
      window.removeEventListener("resize", hide, true);
      document.removeEventListener("click", hide, true);
    };
  }, []);

  if (!tip) return null;

  const { rect, pos } = tip;
  const style = { position: "fixed", zIndex: 9999 };
  if (pos === "bottom") {
    style.left = rect.left + rect.width / 2;
    style.top = rect.bottom + GAP;
    style.transform = "translate(-50%, 0)";
  } else if (pos === "left") {
    style.left = rect.left - GAP;
    style.top = rect.top + rect.height / 2;
    style.transform = "translate(-100%, -50%)";
  } else if (pos === "right") {
    style.left = rect.right + GAP;
    style.top = rect.top + rect.height / 2;
    style.transform = "translate(0, -50%)";
  } else {
    // top (default)
    style.left = rect.left + rect.width / 2;
    style.top = rect.top - GAP;
    style.transform = "translate(-50%, -100%)";
  }

  return (
    <div
      role="tooltip"
      style={style}
      className="px-2.5 py-1.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-[10px] font-semibold rounded-lg shadow-xl border border-zinc-800 dark:border-zinc-100/10 whitespace-nowrap pointer-events-none animate-in fade-in zoom-in-95 duration-150"
    >
      {tip.text}
    </div>
  );
};

export default TooltipLayer;
