"use client";

import { useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import ApplyModal from "@/components/ApplyModal";
import { Job } from "@/lib/db/jobs";

interface ApplyModalWrapperProps {
  job: Job;
  whatsappUrl: string | null;
}

export default function ApplyModalWrapper({ job, whatsappUrl }: ApplyModalWrapperProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-sm shadow-sm transition-colors flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
        >
          <Send className="w-4 h-4" />
          <span>Apply Now on Illy Jobs</span>
        </button>

        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-sm rounded-sm shadow-sm transition-colors flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-emerald-600"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>Apply via WhatsApp</span>
          </a>
        )}
      </div>

      <ApplyModal job={job} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
