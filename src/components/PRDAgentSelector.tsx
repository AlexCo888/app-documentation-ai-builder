import { Badge } from '@/components/ui/badge';
import { Check, Info, Sparkles, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface PRDAgent {
  id: keyof PRDAgentSelection;
  name: string;
  description: string;
  icon: string;
  dependencies?: Array<keyof PRDAgentSelection>;
  category: 'foundation' | 'technical' | 'quality';
}

export interface PRDAgentSelection {
  marketAnalyst: boolean;
  scopePlanner: boolean;
  nextjsArchitect: boolean;
  aiDesigner: boolean;
  dataApiDesigner: boolean;
  securityOfficer: boolean;
  performanceEngineer: boolean;
  qualityLead: boolean;
}

const PRD_AGENTS: PRDAgent[] = [
  {
    id: 'marketAnalyst',
    name: 'Market Analyst',
    description: 'Analyzes target personas, competitive landscape, and value proposition',
    icon: '📊',
    category: 'foundation',
  },
  {
    id: 'scopePlanner',
    name: 'Scope Planner',
    description: 'Defines features, user journeys, and MVP scope using MoSCoW prioritization',
    icon: '🎯',
    dependencies: ['marketAnalyst'],
    category: 'foundation',
  },
  {
    id: 'nextjsArchitect',
    name: 'Next.js Architect',
    description: 'Designs technical architecture, routing, caching, and rendering strategies',
    icon: '⚡',
    dependencies: ['scopePlanner'],
    category: 'technical',
  },
  {
    id: 'aiDesigner',
    name: 'AI Designer',
    description: 'Plans AI SDK integration, tool definitions, and conversation patterns',
    icon: '🤖',
    dependencies: ['scopePlanner', 'nextjsArchitect'],
    category: 'technical',
  },
  {
    id: 'dataApiDesigner',
    name: 'Data/API Designer',
    description: 'Creates database schema, API contracts, and integration points',
    icon: '🗄️',
    dependencies: ['scopePlanner', 'nextjsArchitect'],
    category: 'technical',
  },
  {
    id: 'securityOfficer',
    name: 'Security Officer',
    description: 'Defines AuthN/AuthZ, threat modeling, and compliance requirements',
    icon: '🔒',
    dependencies: ['nextjsArchitect', 'dataApiDesigner'],
    category: 'quality',
  },
  {
    id: 'performanceEngineer',
    name: 'Performance Engineer',
    description: 'Sets Core Web Vitals targets, observability, and performance budgets',
    icon: '⚡',
    dependencies: ['nextjsArchitect'],
    category: 'quality',
  },
  {
    id: 'qualityLead',
    name: 'Quality Lead',
    description: 'Plans testing strategy, rollout gates, and documentation',
    icon: '✅',
    dependencies: ['performanceEngineer'],
    category: 'quality',
  },
];

interface PRDAgentSelectorProps {
  selected: PRDAgentSelection;
  onChange: (selected: PRDAgentSelection) => void;
}

export function PRDAgentSelector({ selected, onChange }: PRDAgentSelectorProps) {
  const handleToggle = (agentId: keyof PRDAgentSelection) => {
    const agent = PRD_AGENTS.find((a) => a.id === agentId);
    
    if (!agent) return;

    // If enabling, also enable all dependencies
    if (!selected[agentId]) {
      const newSelection = { ...selected, [agentId]: true };
      
      // Recursively enable dependencies
      const enableDependencies = (id: keyof PRDAgentSelection) => {
        const agentToEnable = PRD_AGENTS.find((a) => a.id === id);
        if (agentToEnable?.dependencies) {
          agentToEnable.dependencies.forEach((dep) => {
            newSelection[dep] = true;
            enableDependencies(dep);
          });
        }
      };
      
      enableDependencies(agentId);
      onChange(newSelection);
    } else {
      // If disabling, also disable all dependents
      const newSelection = { ...selected, [agentId]: false };
      
      // Find and disable all agents that depend on this one
      PRD_AGENTS.forEach((a) => {
        if (a.dependencies?.includes(agentId)) {
          newSelection[a.id] = false;
        }
      });
      
      onChange(newSelection);
    }
  };

  const selectAll = () => {
    const allSelected = PRD_AGENTS.reduce(
      (acc, agent) => ({ ...acc, [agent.id]: true }),
      {} as PRDAgentSelection
    );
    onChange(allSelected);
  };

  const selectNone = () => {
    const noneSelected = PRD_AGENTS.reduce(
      (acc, agent) => ({ ...acc, [agent.id]: false }),
      {} as PRDAgentSelection
    );
    onChange(noneSelected);
  };

  const selectedCount = Object.values(selected).filter(Boolean).length;
  const totalCount = PRD_AGENTS.length;

  const groupedAgents = {
    foundation: PRD_AGENTS.filter((a) => a.category === 'foundation'),
    technical: PRD_AGENTS.filter((a) => a.category === 'technical'),
    quality: PRD_AGENTS.filter((a) => a.category === 'quality'),
  };

  return (
    <div className="space-y-6">
      {/* Header with explanation */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Users className="size-5 text-[hsl(var(--color-primary))]" />
          <h3 className="text-lg font-semibold">PRD Generation Agents</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="size-4 text-[hsl(var(--color-muted-foreground))] cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <p className="text-sm">
                  These specialized AI agents collaborate to create your PRD. Each agent is an expert in a specific
                  domain. Select the agents you want to participate in the generation process.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <div className="rounded-xl bg-[hsl(var(--color-muted)/0.3)] border border-[hsl(var(--color-border)/0.5)] p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="size-5 text-[hsl(var(--color-primary))] mt-0.5 flex-shrink-0" />
            <div className="space-y-2 text-sm">
              <p className="text-[hsl(var(--color-foreground))]">
                <strong>How it works:</strong> Each agent generates a specialized section of your PRD. Agents
                collaborate by building on each other&rsquo;s outputs. Dependencies are automatically managed.
              </p>
              <p className="text-[hsl(var(--color-muted-foreground))]">
                💡 <strong>Tip:</strong> Select all agents for comprehensive documentation, or choose specific agents
                to focus on particular aspects of your project.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Selection controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-[hsl(var(--color-primary)/0.1)]">
            {selectedCount} / {totalCount} selected
          </Badge>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={selectAll}
            className="text-sm text-[hsl(var(--color-primary))] hover:underline"
          >
            Select all
          </button>
          <span className="text-[hsl(var(--color-muted-foreground))]">•</span>
          <button
            type="button"
            onClick={selectNone}
            className="text-sm text-[hsl(var(--color-muted-foreground))] hover:underline"
          >
            Select none
          </button>
        </div>
      </div>

      {/* Agent categories */}
      <div className="space-y-6">
        {Object.entries(groupedAgents).map(([category, agents]) => (
          <div key={category} className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--color-muted-foreground))]">
              {category === 'foundation' && '🏗️ Foundation'}
              {category === 'technical' && '⚙️ Technical Design'}
              {category === 'quality' && '🎯 Quality & Security'}
            </h4>
            <div className="grid gap-3 sm:grid-cols-2">
              {agents.map((agent) => {
                const isSelected = selected[agent.id];
                const hasUnmetDependencies = agent.dependencies?.some((dep) => !selected[dep]);

                return (
                  <button
                    key={agent.id}
                    type="button"
                    onClick={() => handleToggle(agent.id)}
                    disabled={hasUnmetDependencies && !isSelected}
                    className={cn(
                      'group relative flex items-start gap-3 rounded-xl border p-4 text-left transition-all',
                      'hover:border-[hsl(var(--color-ring)/0.5)] hover:shadow-sm',
                      isSelected
                        ? 'border-[hsl(var(--color-primary))] bg-[hsl(var(--color-primary)/0.08)] shadow-sm'
                        : 'border-[hsl(var(--color-border)/0.7)] bg-[hsl(var(--color-card)/0.5)]',
                      hasUnmetDependencies && !isSelected && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    {/* Icon */}
                    <div className="text-2xl flex-shrink-0 mt-0.5">{agent.icon}</div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <h5 className="font-semibold text-sm text-[hsl(var(--color-foreground))]">
                          {agent.name}
                        </h5>
                        {agent.dependencies && agent.dependencies.length > 0 && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge
                                  variant="outline"
                                  className="text-[10px] px-1.5 py-0 h-4 bg-[hsl(var(--color-muted)/0.3)]"
                                >
                                  Depends on {agent.dependencies.length}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">
                                  Requires:{' '}
                                  {agent.dependencies
                                    .map((dep) => PRD_AGENTS.find((a) => a.id === dep)?.name)
                                    .join(', ')}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                      <p className="text-xs text-[hsl(var(--color-muted-foreground))] leading-relaxed">
                        {agent.description}
                      </p>
                    </div>

                    {/* Checkbox */}
                    <div
                      className={cn(
                        'flex size-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all',
                        isSelected
                          ? 'border-[hsl(var(--color-primary))] bg-[hsl(var(--color-primary))]'
                          : 'border-[hsl(var(--color-border))] bg-transparent group-hover:border-[hsl(var(--color-ring))]'
                      )}
                    >
                      {isSelected && <Check className="size-3 text-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
