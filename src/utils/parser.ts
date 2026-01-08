import type { Task, TaskCategory } from "../types";
import { v4 as uuidv4 } from 'uuid';

export const parseImportText = (text: string): Task[] => {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const tasks: Task[] = [];
  
  let currentSprint = "";
  
  // Regex patterns
  const sprintRegex = /^(sprint\s+\d+|sprint:\s*\d+)/i;
  const bulletRegex = /^[-*•]\s+(.+)/;
  
  lines.forEach(line => {
    // Check for Sprint header
    const sprintMatch = line.match(sprintRegex);
    if (sprintMatch) {
      currentSprint = line.replace(':', '').trim(); // Normalize "Sprint 66:" -> "Sprint 66"
      return;
    }
    
    // Check for Task item
    const taskMatch = line.match(bulletRegex);
    if (taskMatch) {
      const content = taskMatch[1];
      
      // Simple heuristic for categorization based on keywords
      let category: TaskCategory = "Feature"; // Default
      const lowerContent = content.toLowerCase();
      
      if (lowerContent.includes("bug") || lowerContent.includes("fix")) category = "Bug";
      else if (lowerContent.includes("doc") || lowerContent.includes("readme")) category = "Doc";
      else if (lowerContent.includes("meeting") || lowerContent.includes("sync")) category = "Meeting";
      
      const newTask: Task = {
        id: uuidv4(),
        title: content,
        description: "", // Description could be expanded if we parse sub-bullets
        status: "todo",
        category,
        sprint: currentSprint || "Backlog",
        dueDate: "",
        assignees: [], // Could parse @mentions
        subtasks: [],
        createdAt: Date.now(),
      };
      
      tasks.push(newTask);
    }
  });
  
  return tasks;
};
