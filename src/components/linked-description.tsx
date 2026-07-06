import { Fragment } from "react";
import { cn } from "@/lib/utils";

type TextSegment = {
  type: "text";
  text: string;
};

type LinkSegment = {
  type: "link";
  text: string;
  href: string;
};

type Segment = TextSegment | LinkSegment;

const MARKDOWN_LINK_RE = /\[([^\]\n]+)\]\((https?:\/\/[^\s)]+|mailto:[^\s)]+)\)/gi;
const BARE_URL_RE = /(?:https?:\/\/|www\.)[^\s<]+/gi;
const TRAILING_PUNCTUATION_RE = /[.,!?;:]+$/;

function normalizeHref(value: string): string | null {
  const withProtocol = value.startsWith("www.") ? `https://${value}` : value;

  try {
    const url = new URL(withProtocol);
    if (!["http:", "https:", "mailto:"].includes(url.protocol)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

function splitTrailingPunctuation(value: string): [string, string] {
  const trailing = value.match(TRAILING_PUNCTUATION_RE)?.[0] ?? "";
  if (!trailing) return [value, ""];
  return [value.slice(0, -trailing.length), trailing];
}

function tokenizeBareLinks(text: string): Segment[] {
  const segments: Segment[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(BARE_URL_RE)) {
    const rawUrl = match[0];
    const index = match.index ?? 0;
    const [urlText, trailing] = splitTrailingPunctuation(rawUrl);
    const href = normalizeHref(urlText);

    if (!href) continue;
    if (index > lastIndex) {
      segments.push({ type: "text", text: text.slice(lastIndex, index) });
    }

    segments.push({ type: "link", text: urlText, href });
    if (trailing) segments.push({ type: "text", text: trailing });
    lastIndex = index + rawUrl.length;
  }

  if (lastIndex < text.length) {
    segments.push({ type: "text", text: text.slice(lastIndex) });
  }

  return segments.length > 0 ? segments : [{ type: "text", text }];
}

function tokenizeDescription(description: string): Segment[] {
  const segments: Segment[] = [];
  let lastIndex = 0;

  for (const match of description.matchAll(MARKDOWN_LINK_RE)) {
    const [raw, label, rawHref] = match;
    const index = match.index ?? 0;
    const href = normalizeHref(rawHref);

    if (!href) continue;
    if (index > lastIndex) {
      segments.push(...tokenizeBareLinks(description.slice(lastIndex, index)));
    }

    segments.push({ type: "link", text: label, href });
    lastIndex = index + raw.length;
  }

  if (lastIndex < description.length) {
    segments.push(...tokenizeBareLinks(description.slice(lastIndex)));
  }

  return segments.length > 0 ? segments : [{ type: "text", text: description }];
}

export function descriptionToPlainText(description: string): string {
  return tokenizeDescription(description)
    .map((segment) => segment.text)
    .join("");
}

type LinkedDescriptionProps = {
  description: string;
  className?: string;
};

export function LinkedDescription({
  description,
  className,
}: LinkedDescriptionProps) {
  const segments = tokenizeDescription(description);

  return (
    <p className={cn("whitespace-pre-wrap break-words", className)}>
      {segments.map((segment, index) =>
        segment.type === "link" ? (
          <a
            key={index}
            href={segment.href}
            target={segment.href.startsWith("mailto:") ? undefined : "_blank"}
            rel={
              segment.href.startsWith("mailto:")
                ? undefined
                : "noopener noreferrer"
            }
            className="font-medium underline underline-offset-4"
          >
            {segment.text}
          </a>
        ) : (
          <Fragment key={index}>{segment.text}</Fragment>
        )
      )}
    </p>
  );
}
