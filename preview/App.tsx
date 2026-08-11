import { LevelBadge } from "../src/components/rewards/level-badge.js";
import { JourneyPath, type JourneyStep } from "../src/components/rewards/journey-path.js";
import { NavIconButton } from "../src/components/nav-shell.js";
import { PortfolioHeader } from "../src/components/portfolio-header.js";
import { PortfolioOverview } from "../src/components/portfolio-overview.js";
import { Award } from "lucide-react";

const WIDTHS = [375, 768, 1024, 1440];

const SAMPLE_STEPS: JourneyStep[] = [
  { actionType: "a", label: "First step", href: "#", icon: Award },
  { actionType: "b", label: "Second step", href: "#", icon: Award },
  { actionType: "c", label: "Third step", href: "#", icon: Award },
];

const SAMPLE_TILES = [
  { key: "assets", title: "Assets", href: "#", content: <div style={{ padding: 12 }}>12 assets</div> },
  { key: "collections", title: "Collections", href: "#", content: <div style={{ padding: 12 }}>3 collections</div> },
  { key: "activity", title: "Activity", href: "#", content: <div style={{ padding: 12 }}>Recent activity</div> },
];

function Strip({ width, children }: { width: number; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <p style={{ fontFamily: "monospace", fontSize: 12, marginBottom: 8 }}>{width}px</p>
      <div style={{ width, border: "1px solid #ccc", padding: 16, overflow: "auto" }}>
        {children}
      </div>
    </div>
  );
}

export function App() {
  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>medialane-ui component preview</h1>
      {WIDTHS.map((w) => (
        <Strip key={w} width={w}>
          <LevelBadge level={7} name="Fighter" badgeColor="#f6608f" size="md" />
          <div style={{ marginTop: 16 }}>
            <JourneyPath steps={SAMPLE_STEPS} breakdown={{ a: 1 }} />
          </div>
          <div style={{ marginTop: 16 }}>
            <NavIconButton aria-label="Sample">
              <Award size={18} />
            </NavIconButton>
          </div>
          <div style={{ marginTop: 16 }}>
            <PortfolioHeader address="0x0123456789abcdef0123456789abcdef01234567" score={{ levelName: "Fighter", totalXp: 1240, href: "#" }} />
          </div>
          <div style={{ marginTop: 16 }}>
            <PortfolioOverview tiles={SAMPLE_TILES} />
          </div>
        </Strip>
      ))}
    </div>
  );
}
