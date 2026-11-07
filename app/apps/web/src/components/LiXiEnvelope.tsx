/** Red lì-xì envelope with a gold diamond — the join page's hero mark (replaces the purple 🎓
 * tile). Pure CSS (globals.css `.envelope`), swings gently from its hanging loop. */
export function LiXiEnvelope({ symbol = "?", className = "" }: { symbol?: string; className?: string }) {
  return (
    <div className={`envelope ${className}`} aria-hidden="true">
      <div className="diamond">
        <span>{symbol}</span>
      </div>
      <div className="wave" />
      <div className="tassel" />
    </div>
  );
}
