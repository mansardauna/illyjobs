"use client";

import { useState } from "react";
import { MessageCircle, Send, Share2 } from "lucide-react";
import ApplyModal from "@/components/ApplyModal";
import type { Job } from "@/lib/db/jobs";

interface ApplyModalWrapperProps {
  job: Job;
  whatsappUrl: string | null;
  shareUrl: string;
}

export default function ApplyModalWrapper({ job, whatsappUrl, shareUrl }: ApplyModalWrapperProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => setIsOpen(true)} className="btn-primary gap-2">
          <Send className="w-4 h-4" aria-hidden="true" />
          Apply now
        </button>

        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-400 font-semibold text-base rounded-sm shadow-sm transition-colors"
          >
            <MessageCircle className="w-4 h-4" aria-hidden="true" />
            Apply on WhatsApp
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        )}

        <a
          href={shareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary gap-2"
        >
          <Share2 className="w-4 h-4" aria-hidden="true" />
          Share on WhatsApp
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>

      <ApplyModal job={job} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
