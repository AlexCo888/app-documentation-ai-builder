import { tool } from 'ai';
import { z } from 'zod';
import { ResearchResultSchema, HandoffSchema, ValidationResultSchema } from './types';

/**
 * Common tools available to all agents
 */

export const researchTool = tool({
  description: 'Research and generate content for a specific PRD section. Use this to create detailed, well-researched content.',
  inputSchema: z.object({
    section: z.string().describe('Name of the PRD section to research'),
    focus: z.string().describe('Specific aspects to focus on'),
    context: z.string().optional().describe('Additional context from previous agents')
  }),
  execute: async ({ section, focus, context }) => {
    // Tool execution happens in the agent loop
    // This is a marker for the LLM to understand when to use research
    return {
      section,
      content: `[RESEARCH_NEEDED: ${section} - ${focus}${context ? ` | Context: ${context}` : ''}]`,
      status: 'pending'
    };
  }
});

export const handoffTool = tool({
  description: 'Hand off work to another agent. Use this when you\'ve completed your work and another agent needs to continue.',
  inputSchema: HandoffSchema,
  execute: async ({ toAgent, message, artifacts }) => {
    return {
      success: true,
      toAgent,
      message,
      artifacts: artifacts || {},
      timestamp: new Date().toISOString()
    };
  }
});

export const validateTool = tool({
  description: 'Validate content for completeness, accuracy, and consistency.',
  inputSchema: z.object({
    section: z.string().describe('Section name to validate'),
    content: z.string().describe('Content to validate'),
    criteria: z.array(z.string()).describe('Validation criteria')
  }),
  execute: async ({ section, content, criteria }) => {
    // Basic validation - in production this could be more sophisticated
    const wordCount = content.split(/\s+/).length;
    const hasHeadings = /^#{1,3}\s+/m.test(content);
    const hasLists = /^[\-\*]\s+/m.test(content);
    
    const issues: string[] = [];
    if (wordCount < 50) issues.push('Content seems too short');
    if (!hasHeadings) issues.push('Missing section headings');
    if (!hasLists && section !== 'overview') issues.push('Consider using lists for better readability');
    
    return {
      valid: issues.length === 0,
      issues: issues.length > 0 ? issues : undefined,
      suggestions: issues.length === 0 
        ? ['Content looks good'] 
        : ['Expand with more detail', 'Add structured formatting']
    };
  }
});

export const mergeTool = tool({
  description: 'Merge content from multiple sections into a coherent document.',
  inputSchema: z.object({
    sections: z.record(z.string(), z.string()).describe('Map of section names to content'),
    order: z.array(z.string()).optional().describe('Desired section order')
  }),
  execute: async ({ sections, order }) => {
    const sectionOrder = order || Object.keys(sections);
    const merged = sectionOrder
      .filter(key => sections[key])
      .map(key => sections[key])
      .join('\n\n---\n\n');
    
    return {
      success: true,
      merged,
      sectionCount: sectionOrder.length
    };
  }
});

/**
 * Specialized tools for specific agents
 */

export const marketResearchTools = {
  analyzeCompetitors: tool({
    description: 'Analyze competitive landscape for similar products.',
    inputSchema: z.object({
      productCategory: z.string(),
      targetAudience: z.string()
    }),
    execute: async ({ productCategory, targetAudience }) => {
      return {
        competitors: `[ANALYZE: ${productCategory} for ${targetAudience}]`,
        status: 'pending'
      };
    }
  }),
  
  definePersonas: tool({
    description: 'Create detailed user personas based on research.',
    inputSchema: z.object({
      audience: z.string(),
      painPoints: z.array(z.string()),
      goals: z.array(z.string())
    }),
    execute: async ({ audience, painPoints, goals }) => {
      return {
        personas: `[DEFINE_PERSONAS: ${audience}]`,
        painPoints,
        goals,
        status: 'pending'
      };
    }
  })
};

export const scopePlanningTools = {
  createJobStories: tool({
    description: 'Generate job stories in JTBD format.',
    inputSchema: z.object({
      persona: z.string(),
      situation: z.string(),
      motivation: z.string()
    }),
    execute: async ({ persona, situation, motivation }) => {
      const jobStory = `When ${situation}, I want to ${motivation}, so I can [outcome].`;
      return { jobStory, status: 'pending' };
    }
  }),
  
  prioritizeFeatures: tool({
    description: 'Prioritize features using RICE or MoSCoW framework.',
    inputSchema: z.object({
      features: z.array(z.string()),
      framework: z.enum(['RICE', 'MoSCoW'])
    }),
    execute: async ({ features, framework }) => {
      return {
        prioritized: features,
        framework,
        status: 'pending'
      };
    }
  })
};

export const architectureTools = {
  designRoutes: tool({
    description: 'Design Next.js route structure with rendering strategies.',
    inputSchema: z.object({
      pages: z.array(z.string()),
      renderingPreferences: z.string().optional()
    }),
    execute: async ({ pages, renderingPreferences }) => {
      return {
        routes: pages.map(page => ({
          path: page,
          rendering: renderingPreferences || 'SSR',
          runtime: 'nodejs'
        })),
        status: 'pending'
      };
    }
  }),
  
  planCaching: tool({
    description: 'Design caching and revalidation strategy.',
    inputSchema: z.object({
      routes: z.array(z.string()),
      updateFrequency: z.string()
    }),
    execute: async ({ routes, updateFrequency }) => {
      return {
        strategy: `ISR with ${updateFrequency} revalidation`,
        routes,
        status: 'pending'
      };
    }
  })
};

export const aiDesignTools = {
  defineAITools: tool({
    description: 'Define AI SDK tools and their schemas.',
    inputSchema: z.object({
      toolName: z.string(),
      purpose: z.string(),
      inputs: z.array(z.string())
    }),
    execute: async ({ toolName, purpose, inputs }) => {
      return {
        tool: {
          name: toolName,
          description: purpose,
          parameters: inputs
        },
        status: 'pending'
      };
    }
  }),
  
  designConversation: tool({
    description: 'Design conversation flow for AI interactions.',
    inputSchema: z.object({
      userGoal: z.string(),
      steps: z.array(z.string())
    }),
    execute: async ({ userGoal, steps }) => {
      return {
        flow: { goal: userGoal, steps },
        status: 'pending'
      };
    }
  })
};

export const securityTools = {
  assessThreats: tool({
    description: 'Perform threat modeling for the application.',
    inputSchema: z.object({
      features: z.array(z.string()),
      dataTypes: z.array(z.string())
    }),
    execute: async ({ features, dataTypes }) => {
      return {
        threats: `[ASSESS: ${features.join(', ')} handling ${dataTypes.join(', ')}]`,
        status: 'pending'
      };
    }
  }),
  
  designAuth: tool({
    description: 'Design authentication and authorization strategy.',
    inputSchema: z.object({
      userRoles: z.array(z.string()),
      protectedResources: z.array(z.string())
    }),
    execute: async ({ userRoles, protectedResources }) => {
      return {
        authStrategy: `RBAC for ${userRoles.join(', ')}`,
        resources: protectedResources,
        status: 'pending'
      };
    }
  })
};

export const performanceTools = {
  defineMetrics: tool({
    description: 'Define performance metrics and SLIs/SLOs.',
    inputSchema: z.object({
      pageTypes: z.array(z.string()),
      targetAudience: z.string()
    }),
    execute: async ({ pageTypes, targetAudience }) => {
      return {
        metrics: {
          LCP: '< 2.5s',
          FID: '< 100ms',
          CLS: '< 0.1'
        },
        pages: pageTypes,
        status: 'pending'
      };
    }
  }),
  
  planObservability: tool({
    description: 'Plan observability and monitoring setup.',
    inputSchema: z.object({
      criticalPaths: z.array(z.string()),
      alertThresholds: z.string().optional()
    }),
    execute: async ({ criticalPaths, alertThresholds }) => {
      return {
        monitoring: {
          paths: criticalPaths,
          alerts: alertThresholds || 'p95 > 1s',
          tools: ['Vercel Analytics', 'Sentry']
        },
        status: 'pending'
      };
    }
  })
};

export const qualityTools = {
  createTestPlan: tool({
    description: 'Create comprehensive test plan.',
    inputSchema: z.object({
      features: z.array(z.string()),
      criticalPaths: z.array(z.string())
    }),
    execute: async ({ features, criticalPaths }) => {
      return {
        tests: {
          unit: features.map(f => `Test ${f} functionality`),
          integration: criticalPaths.map(p => `Test ${p} flow`),
          e2e: criticalPaths.slice(0, 3).map(p => `E2E test for ${p}`)
        },
        status: 'pending'
      };
    }
  }),
  
  planRollout: tool({
    description: 'Plan deployment and rollout strategy.',
    inputSchema: z.object({
      environment: z.string(),
      strategy: z.enum(['blue-green', 'canary', 'rolling'])
    }),
    execute: async ({ environment, strategy }) => {
      return {
        rollout: {
          strategy,
          steps: ['Deploy to preview', 'Test', 'Gradual rollout', 'Monitor'],
          rollback: 'Automatic on error'
        },
        status: 'pending'
      };
    }
  })
};

/**
 * Export all tool collections
 */
export const agentTools = {
  common: {
    research: researchTool,
    handoff: handoffTool,
    validate: validateTool,
    merge: mergeTool
  },
  market: marketResearchTools,
  scope: scopePlanningTools,
  architecture: architectureTools,
  ai: aiDesignTools,
  security: securityTools,
  performance: performanceTools,
  quality: qualityTools
};
