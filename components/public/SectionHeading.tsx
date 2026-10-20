type SectionHeadingProps = {
  title: string;
  align?: "left" | "center";
  intro?: string;
};

export default function SectionHeading({
  title,
  align = "left",
  intro,
}: SectionHeadingProps) {
  return (
    <div className={align === "center" ? "text-center" : "text-left"}>
      <h2 className="font-display text-3xl sm:text-4xl text-navy font-medium tracking-tightish">
        {title}
      </h2>
      <div
        className={`hairline w-16 mt-4 ${align === "center" ? "mx-auto" : ""}`}
      />
      {intro && (
        <p className="mt-5 text-charcoal/80 max-w-2xl leading-relaxed">
          {intro}
        </p>
      )}
    </div>
  );
}
