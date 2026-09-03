import { Advantages } from "./components/Advantages";
import { AskAssistant } from "./components/AskAssistant";
import { CoverageMap } from "./components/CoverageMap";
import { CtaBanner } from "./components/CtaBanner";
import { Hero } from "./components/Hero";
import { Manifesto } from "./components/Manifesto";
import { ProjectStrip } from "./components/ProjectStrip";
import { Services } from "./components/Services";
import { Stats } from "./components/Stats";

export default function Home() {
  return (
    <>
      <Hero />
      <ProjectStrip />
      <Manifesto />
      <Stats />
      <Services />
      <Advantages />
      <CoverageMap />
      <CtaBanner />
      <AskAssistant />
    </>
  );
}
