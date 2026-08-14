interface PageHeaderProps {
  description?: string;
  actions?: React.ReactNode;
}

/**
 * The strip under the top bar: context and actions for the current screen.
 *
 * The heading itself moved to the shell's top bar, so this renders no <h1> --
 * two headings for one page would be a document-outline bug, not a style
 * choice.
 */
export function PageHeader({ description, actions }: PageHeaderProps) {
  if (!description && !actions) return null;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {description ? (
        <p className="text-muted-foreground text-sm">{description}</p>
      ) : (
        <span />
      )}
      {actions ? (
        <div className="flex items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
