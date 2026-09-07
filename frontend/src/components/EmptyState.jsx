export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center text-center gap-3 py-16 px-6">
      {Icon && (
        <div className="w-11 h-11 rounded-full bg-accent-soft text-accent flex items-center justify-center">
          <Icon size={20} />
        </div>
      )}
      <div>
        <p className="font-medium text-ink">{title}</p>
        {description && <p className="text-sm text-muted mt-1 max-w-sm">{description}</p>}
      </div>
      {action}
    </div>
  );
}
