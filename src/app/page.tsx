import Link from "next/link";
import { ArrowRight, Clock3 } from "lucide-react";
import { getPrisma } from "@/infrastructure/database/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const problems = await getPrisma().problem.findMany({ where: { isPublished: true }, orderBy: [{ difficulty: "asc" }, { title: "asc" }] });
  return <main>
    <section className="hero shell"><div className="eyebrow"><span /> Deliberate LLD practice</div><h1>Design it. Defend it.<br /><em>Improve it.</em></h1><p className="hero-copy">Practice real low-level design problems and receive evidence-backed feedback that helps your next attempt—not just a number.</p><div className="hero-actions"><Link className="button primary" href="#problems">Choose a problem <ArrowRight size={17} /></Link><Link className="button ghost" href="/history">View attempt history</Link></div><div className="hero-meta" aria-label="Platform highlights"><span><strong>03</strong> focused problems</span><span><strong>07</strong> rubric dimensions</span><span><strong>01</strong> deliberate loop</span></div></section>
    <section className="shell section" id="problems"><div className="section-heading"><div><p className="kicker">Problem library</p><h2>Pick one system to design</h2></div><p>Start with the requirements. The format guides your thinking without prescribing one correct design.</p></div><div className="problem-grid">{problems.map((problem,index)=><Link className="problem-card" href={`/problems/${problem.slug}`} key={problem.id}><div className="card-top"><span className="problem-number">0{index+1}</span><span className={`difficulty ${problem.difficulty.toLowerCase()}`}>{problem.difficulty.toLowerCase()}</span></div><h3>{problem.title}</h3><p>{problem.summary}</p><div className="card-footer"><span><Clock3 size={15}/> {problem.estimatedMinutes} min</span><span>Start designing <ArrowRight size={15}/></span></div></Link>)}</div></section>
    <section className="how-section"><div className="shell how-grid"><div><p className="kicker">The practice loop</p><h2>Feedback that<br/><em>shows its work</em></h2><p>Every score points to evidence, a concern, and a concrete next step.</p></div><ol><li><span>01</span><div><strong>Frame the problem</strong><p>Read the requirements and state your assumptions.</p></div></li><li><span>02</span><div><strong>Explain your design</strong><p>Describe responsibilities, relationships, and interactions.</p></div></li><li><span>03</span><div><strong>Review and retry</strong><p>Use rubric feedback to improve the next version.</p></div></li></ol></div></section>
  </main>;
}
