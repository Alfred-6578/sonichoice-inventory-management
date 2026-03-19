export default function AvatarName({ color, initials, name, preview = false }: { color: string; initials: string; name: string; preview?:boolean }) {
  const style = color.startsWith("#") ? { backgroundColor: color } : undefined;
  const className = `w-7 h-7 text-border rounded-md flex items-center justify-center text-xs font-semibold ${color.startsWith("#") ? "" : color}`;

  return (
    <div className={`flex items-center ${preview && 'max-vsm:justify-center'} gap-2 vsm:gap-3`}>
      <div className={className} style={style}>
        {initials}
      </div>
      <span className={preview ? `max-vsm:hidden` : ''}>{name}</span>
    </div>
  );
}