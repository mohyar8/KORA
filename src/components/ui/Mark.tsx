export function Mark({
  children,
  tone = "green",
}: {
  children: string;
  tone?: "green" | "coral";
}) {
  return (
    <em className={tone === "coral" ? "word-mark word-mark-coral" : "word-mark"}>
      {children}
    </em>
  );
}
