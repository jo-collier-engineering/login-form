import './Card.scss';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

function Card({
  children,
  className = "",
}: CardProps) {
  return (
    <article className={`card ${className}`.trim()}>
      {children}
    </article>
  );
}

export default Card;