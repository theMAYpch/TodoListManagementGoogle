import type { Task } from "../types";

export const generatePrompt = (tasks: Task[]): string => {
  const groupedBySprint: Record<string, Task[]> = {};
  
  tasks.forEach(t => {
      const sprint = t.sprint || "Backlog";
      if (!groupedBySprint[sprint]) groupedBySprint[sprint] = [];
      groupedBySprint[sprint].push(t);
  });

  let prompt = "Project Status Overview:\n\n";

  Object.entries(groupedBySprint).sort().forEach(([sprint, sprintTasks]) => {
      prompt += `## ${sprint}\n`;
      sprintTasks.forEach(t => {
          prompt += `- [${t.status.toUpperCase()}] ${t.title} (${t.category})\n`;
          if (t.description) prompt += `  Description: ${t.description}\n`;
          if (t.assignees.length) prompt += `  Assignees: ${t.assignees.join(", ")}\n`;
          if (t.dueDate) prompt += `  Due: ${t.dueDate}\n`;
          prompt += "\n";
      });
      prompt += "\n";
  });

  return prompt;
};
