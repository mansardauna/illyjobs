/**
 * Renders schema.org structured data. "<" is escaped so user-written text
 * (for example a job description containing "</script>") cannot break out of
 * the script tag.
 */
export default function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
