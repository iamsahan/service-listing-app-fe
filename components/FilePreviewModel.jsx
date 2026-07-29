import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";

export default function FilePreviewModel({
  isOpen,
  type,
  previewURL,
  onOpenChange,
}) {
  // Handle case where type might be undefined (when file is a URL string)
  const fileType = type || "";

  // Determine file type from URL if type is not available
  const getFileTypeFromURL = (url) => {
    if (!url) return "";
    const extension = url.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension)) {
      return "image";
    } else if (extension === "pdf") {
      return "application/pdf";
    }
    return "";
  };

  // Construct proper URL for backend files
  const getProperURL = (url) => {
    if (!url) return "";

    // If it's already a full URL (blob: or http:), use as is
    if (url.startsWith("blob:") || url.startsWith("http")) {
      return url;
    }

    // If it's a relative path from API, prepend backend endpoint
    return `${process.env.NEXT_PUBLIC_API_ENDPOINT}${url}`;
  };

  const effectiveType = fileType || getFileTypeFromURL(previewURL);
  const properURL = getProperURL(previewURL);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-sm md:max-w-2xl lg:max-w-4xl">
        <DialogTitle>File Preview</DialogTitle>

        {effectiveType.startsWith("image") ? (
          <img
            crossOrigin="anonymous"
            src={properURL}
            alt="preview"
            className="w-full h-auto rounded"
          />
        ) : effectiveType.includes("pdf") ? (
          <object
            data={properURL}
            type="application/pdf"
            className="w-full h-[500px]"
          >
            <p>
              PDF not supported.{" "}
              <a href={properURL} className="underline" download>
                Download file
              </a>
            </p>
          </object>
        ) : (
          <p>
            File preview not supported.{" "}
            <a href={properURL} download className="underline">
              Download file
            </a>
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
