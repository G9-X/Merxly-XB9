"use client";

import { BotIcon, ChevronDownIcon } from "lucide-react";
import { type FC, useState } from "react";
import { AssistantModalPrimitive } from "@assistant-ui/react";

import { Thread } from "@/components/thread";

export const AssistantModal: FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const tooltip = isOpen ? "Close Assistant" : "Open Assistant";

  return (
    <AssistantModalPrimitive.Root open={isOpen} onOpenChange={setIsOpen}>
      <AssistantModalPrimitive.Anchor className="aui-root aui-modal-anchor fixed right-4 bottom-4 z-50 size-11">
        <button
          onClick={() => setIsOpen(!isOpen)}
          title={tooltip}
          className="aui-modal-button flex size-full items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-110 active:scale-90"
        >
          <BotIcon
            className={`absolute size-6 transition-all ${isOpen ? 'scale-0 rotate-90' : 'scale-100 rotate-0'}`}
          />
          <ChevronDownIcon
            className={`absolute size-6 transition-all ${isOpen ? 'scale-100 rotate-0' : 'scale-0 -rotate-90'}`}
          />
          <span className="sr-only">{tooltip}</span>
        </button>
      </AssistantModalPrimitive.Anchor>
      <AssistantModalPrimitive.Content
        sideOffset={16}
        className="aui-root aui-modal-content data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom-1/2 data-[state=closed]:slide-out-to-right-1/2 data-[state=closed]:zoom-out data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-1/2 data-[state=open]:slide-in-from-right-1/2 data-[state=open]:zoom-in z-50 h-125 w-100 overflow-clip overscroll-contain rounded-xl border bg-popover p-0 text-popover-foreground shadow-md outline-none data-[state=closed]:animate-out data-[state=open]:animate-in [&>.aui-thread-root]:bg-inherit [&>.aui-thread-root_.aui-thread-viewport-footer]:bg-inherit"
      >
        <Thread />
      </AssistantModalPrimitive.Content>
    </AssistantModalPrimitive.Root>
  );
};
