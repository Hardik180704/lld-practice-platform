# Research Note

## Learner problem

The difficult part of LLD practice is not finding another Parking Lot prompt. It is deciding whether a solution assigns responsibilities well when multiple designs can be valid. Static articles and reference repositories provide breadth, but comparison against a finished answer encourages imitation. Compiler and test feedback proves behavior, but cannot by itself explain cohesion, coupling, encapsulation, or whether an abstraction earns its cost.

A useful loop needs to preserve the learner's reasoning, identify evidence behind each judgment, and make a better second attempt possible. The submission must therefore capture more than a diagram: assumptions establish scope, responsibilities and interactions expose the model, trade-offs reveal judgment, and edge cases show whether the design survives pressure.

## Existing approaches

**Course-led instruction.** Educative's Low Level Design interview course teaches OOD through real-world systems, while Design Gurus emphasizes SOLID principles, patterns, and class-modeling exercises. These approaches provide structured instruction and worked examples, but practice can still become answer-led rather than centered on the learner's own evidence. Sources: [Educative](https://www.educative.io/), [Design Gurus](https://www.designgurus.io/).

**Reference repositories.** JavaScript LLD repositories offer runnable examples, diagrams, class maps, trade-offs, and interviewer questions. They are valuable study material, but usually publish the destination rather than evaluating a learner's evolving attempt. Source: [Low-Level-Design-Javascript](https://github.com/vivek-panchal/Low-Level-Design-Javascript).

**Interactive practice.** LLD Arena combines an editor, compilation, hidden tests, UML diagrams, checklists, and an optional AI grader. It demonstrates the benefit of mixing deterministic behavior checks with judgment-heavy review. Its broad feature set also reinforces the value of a narrower MVP for a two-day exercise. Source: [LLD Arena](https://github.com/mightbeanshuu/lld-arena).

## Gaps and product direction

Three gaps shape DesignLoop:

1. A single reference solution is a weak judge of an open-ended design.
2. A score without evidence does not tell the learner what to change.
3. A one-time result does not expose recurring weaknesses.

DesignLoop therefore uses a fixed rubric and stores criterion-level evidence, concerns, suggestions, and confidence. Attempt history makes feedback part of a repeated learning loop. The MVP accepts structured text because it captures the design decisions being evaluated while remaining implementable and accessible. Code execution and diagram editing are intentionally deferred.

## Success criteria

A learner should be able to complete the loop without explanation from the builder, understand why each criterion received its score, and identify one concrete change for the next attempt. The product succeeds when feedback improves the next design, not when it merely produces a convincing number.
