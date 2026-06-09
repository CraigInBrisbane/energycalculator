export const VersionFooter = () => {
  // @ts-expect-error: Global variable injected by Vite
  const version = __APP_VERSION__;

  return (
    <footer className="mt-12 py-6 text-center">
      <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">
        v{version}
      </p>
    </footer>
  );
};
