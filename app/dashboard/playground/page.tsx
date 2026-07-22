export default function PlaygroundPage() {
  return (
    <div className="relative flex-1 overflow-hidden">
      <iframe
        src="/drone-sim/index.html"
        className="absolute inset-0 h-full w-full border-0"
        title="FPV Drone Simulator"
        allow="fullscreen"
      />
    </div>
  );
}
