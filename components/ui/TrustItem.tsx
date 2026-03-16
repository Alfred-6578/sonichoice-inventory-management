export default function TrustItem({Icon, text }: { Icon?:  React.ComponentType<{ className?: string }>; text: string }) {
  return (
    <div className="flex max-tny:flex-col items-center gap-2 text-border/70">
      <div className=" rounded flex items-center justify-center text-lg">
       {Icon && <Icon />}
      </div>
      {text}
    </div>
  );
}