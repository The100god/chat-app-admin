"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal, LucideIcon } from "lucide-react";

export interface DropdownActionItem {
  id: string;
  label: string;
  icon?: LucideIcon | React.ComponentType<{ className?: string }>;
  onClick?: (e: React.MouseEvent) => void;
  danger?: boolean;
  disabled?: boolean;
  badge?: string;
  description?: string;
  dividerAfter?: boolean;
}

export interface ActionDropdownProps {
  items: (DropdownActionItem | null | undefined | false)[];
  align?: "left" | "right";
  buttonTitle?: string;
  buttonClassName?: string;
  icon?: React.ComponentType<{ className?: string }>;
  size?: "sm" | "md";
}

export default function ActionDropdown({
  items,
  align = "right",
  buttonTitle = "More actions",
  buttonClassName = "",
  icon: TriggerIcon = MoreHorizontal,
  size = "md",
}: ActionDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuCoords, setMenuCoords] = useState<{ top: number; left?: number; right?: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const validItems = items.filter(Boolean) as DropdownActionItem[];

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const dropdownHeight = validItems.length * 40 + 20;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpwards = spaceBelow < dropdownHeight && rect.top > dropdownHeight;

    const top = openUpwards
      ? rect.top + window.scrollY - dropdownHeight - 4
      : rect.bottom + window.scrollY + 6;

    if (align === "right") {
      const right = Math.max(8, window.innerWidth - rect.right - window.scrollX);
      setMenuCoords({ top, right });
    } else {
      const left = Math.max(8, rect.left + window.scrollX);
      setMenuCoords({ top, left });
    }
  }, [align, validItems.length]);

  const toggleDropdown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOpen) {
      setIsOpen(false);
    } else {
      updatePosition();
      setIsOpen(true);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    const handleScrollOrResize = () => {
      setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isOpen]);

  const btnPadding = size === "sm" ? "p-1" : "p-1.5";
  const iconSize = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";

  return (
    <div className="relative inline-block text-left" onClick={(e) => e.stopPropagation()}>
      <button
        ref={triggerRef}
        type="button"
        onClick={toggleDropdown}
        title={buttonTitle}
        className={`rounded-lg transition-all cursor-pointer focus:outline-none ${btnPadding} ${isOpen
            ? "bg-white/[0.12] text-white border border-white/[0.2] shadow-sm"
            : "text-zinc-400 hover:text-white hover:bg-white/[0.08] border border-transparent hover:border-white/[0.1]"
          } ${buttonClassName}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <TriggerIcon className={iconSize} />
      </button>

      {isOpen &&
        mounted &&
        menuCoords &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: "absolute",
              top: `${menuCoords.top}px`,
              ...(menuCoords.right !== undefined ? { right: `${menuCoords.right}px` } : {}),
              ...(menuCoords.left !== undefined ? { left: `${menuCoords.left}px` } : {}),
            }}
            className="w-56 rounded-xl bg-zinc-950/95 backdrop-blur-xl border border-white/[0.12] shadow-2xl p-1.5 z-[99999] text-xs animate-in fade-in zoom-in-95 duration-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-0.5">
              {validItems.map((item) => {
                const ItemIcon = item.icon;
                return (
                  <React.Fragment key={item.id}>
                    <button
                      type="button"
                      disabled={item.disabled}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (item.disabled) return;
                        setIsOpen(false);
                        item.onClick?.(e);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed group ${item.danger
                          ? "text-rose-400 hover:text-rose-300 hover:bg-rose-500/15"
                          : "text-zinc-300 hover:text-white hover:bg-white/[0.08]"
                        }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {ItemIcon && (
                          <ItemIcon
                            className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-105 ${item.danger ? "text-rose-400" : "text-zinc-400 group-hover:text-white"
                              }`}
                          />
                        )}
                        <div className="min-w-0">
                          <div className="truncate font-medium">{item.label}</div>
                          {item.description && (
                            <div className="text-[10px] text-zinc-500 truncate leading-tight">
                              {item.description}
                            </div>
                          )}
                        </div>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/[0.08] text-zinc-400 border border-white/[0.06] shrink-0 ml-2">
                          {item.badge}
                        </span>
                      )}
                    </button>
                    {item.dividerAfter && (
                      <div className="my-1 border-t border-white/[0.06]" />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
