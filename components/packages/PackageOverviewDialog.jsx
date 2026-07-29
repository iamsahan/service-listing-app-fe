import { serviceAPI } from "@/api/services";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import OverviewSkeleton from "../skeletons/OverviewSkeleton";
import { useState, useEffect } from "react";
import DOMPurify from "dompurify";

export default function PackageOverviewDialog({
  open,
  onOpenChange,
  packageId,
}) {
  const [overviewHtml, setOverviewHtml] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOverview = async () => {
      setLoading(true);
      try {
        const res = await serviceAPI.getPackageOverview(packageId);
        let html = res?.data ?? "";

        // Validation: check if backend returned empty tag or empty text
        const temp = document.createElement("div");
        temp.innerHTML = html;
        const textContent = temp.textContent?.trim();

        if (!html || !textContent) {
          html = "No description";
        }

        setOverviewHtml(html);
      } catch (error) {
        console.error("Failed to fetch overview:", error);
        setOverviewHtml("Failed to load description");
      } finally {
        setLoading(false);
      }
    };

    if (open && packageId) fetchOverview();
  }, [packageId, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] lg:max-w-md xl:max-w-lg w-full p-6 rounded-md shadow-xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Description</DialogTitle>
          <DialogClose />
        </DialogHeader>

        {loading ? (
          <OverviewSkeleton />
        ) : (
          <div
            className="prose prose-sm dark:prose-invert mt-2"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(overviewHtml || "No description"),
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
