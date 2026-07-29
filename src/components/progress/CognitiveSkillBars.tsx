import { Lightning } from '@phosphor-icons/react';

export function CognitiveSkillBars() {
  const steps = [
    { name: 'Threat Scan', score: 42, label: '42% (Needs Work)', color: 'bg-amber-500', textColor: 'text-amber-500' },
    { name: 'Safety Scan (LPDO)', score: 78, label: '78%', color: 'bg-emerald-500', textColor: 'text-emerald-500' },
    { name: 'Candidate Generation', score: 65, label: '65%', color: 'bg-indigo-500', textColor: 'text-indigo-500' },
    { name: 'Calculation', score: 72, label: '72%', color: 'bg-indigo-500', textColor: 'text-indigo-500' },
    { name: 'Evaluation', score: 58, label: '58%', color: 'bg-amber-500', textColor: 'text-amber-500' },
    { name: 'Planning', score: 80, label: '80%', color: 'bg-emerald-500', textColor: 'text-emerald-500' },
  ];

  return (
    <div className="surface-card rounded-2xl p-6 space-y-4">
      <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider font-mono flex items-center gap-2">
        <Lightning className="w-4 h-4 text-indigo-500" weight="bold" />
        Cognitive Thinking Step Telemetry
      </h3>

      <div className="space-y-4 text-xs font-mono">
        {steps.map((step) => (
          <div key={step.name} className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-[var(--text-primary)] font-medium">{step.name}</span>
              <span className={`${step.textColor} font-semibold`}>{step.label}</span>
            </div>
            <div className="h-2 rounded-full bg-[var(--bg-subtle)] overflow-hidden">
              <div
                className={`h-full ${step.color} rounded-full transition-all duration-500`}
                style={{ width: `${step.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
