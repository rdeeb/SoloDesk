import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface DrawerProps {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  level?: number;
  className?: string;
}

export function Drawer({ open, title, description, children, footer, onClose, level = 0 }: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (level === 0 && document.querySelector(".sd-drawer.level-1")) return;
      onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open, level]);

  if (!open) return null;

  return createPortal(
    <>
      {level === 0 && (
        <div className="sd-drawer-backdrop" onClick={onClose} role="presentation" />
      )}
      <div className={`sd-drawer${level > 0 ? " level-1" : ""}`} role="dialog" aria-modal="true">
        <div className="sd-drawer-head">
          <div className="sd-drawer-glyph outline" aria-hidden="true">
            {title.substring(0, 2).toUpperCase()}
          </div>
          <div className="sd-drawer-meta">
            <div className="sd-drawer-ttl">{title}</div>
            {description && <div className="sd-drawer-sub">{description}</div>}
          </div>
          <button className="sd-drawer-close" onClick={onClose} aria-label="Close drawer">
            <X size={16} />
          </button>
        </div>

        <div className="sd-drawer-body">{children}</div>

        {footer && (
          <div className="sd-drawer-foot">
            <div className="left" />
            <div className="right">{footer}</div>
          </div>
        )}
      </div>
    </>,
    document.body
  );
}
