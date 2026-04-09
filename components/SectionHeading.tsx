interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  highlight?: string;
  centered?: boolean;
}

export default function SectionHeading({ 
  title, 
  subtitle, 
  highlight,
  centered = true 
}: SectionHeadingProps) {
  return (
    <div className={`${centered ? 'text-center' : ''}`}>
      <h2 className="font-heading text-[max(40px,min(60px,4vw))] font-bold text-dark dark:text-light">
        {title} {highlight && <span className="text-primary">{highlight}</span>}
      </h2>
      {subtitle && (
        <p className="text-dark/70 dark:text-light/70 mt-4 max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
}