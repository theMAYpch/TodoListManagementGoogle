import type { Task, TaskCategory } from "../types";
import { v4 as uuidv4 } from 'uuid';

export const parseImportText = (text: string): Task[] => {
  const lines = text.split('\n').filter(l => l.trim() !== '');
  const tasks: Task[] = [];
  
  let currentSprint = "";
  let currentDate = "";
  let lastTask: Task | null = null;
  
  // Regex patterns
  const sprintRegex = /^(sprint\s+\d+|sprint:\s*\d+)/i;
  const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const checkboxRegex = /^\[([ xX])\]\s*(.*)/;
  
  lines.forEach(line => {
    const trimmed = line.trim();
    
    // Check for Sprint header
    const sprintMatch = trimmed.match(sprintRegex);
    if (sprintMatch) {
      currentSprint = trimmed.replace(':', '').trim();
      return;
    }

    // Check for Date header (DD/MM/YYYY)
    const dateMatch = trimmed.match(dateRegex);
    if (dateMatch) {
      const [_, day, month, year] = dateMatch;
      currentDate = `${year}-${month}-${day}`;
      return;
    }
    
    // Check for Bullets (Main and Indented)
    const bulletMatch = line.match(/^(\s*)([-*•])\s+(.*)/);
    if (bulletMatch) {
      const [_, indent, _bullet, content] = bulletMatch;
      const isSubtask = indent.length > 0;
      
      const checkMatch = content.match(checkboxRegex);
      const isCompleted = checkMatch ? (checkMatch[1].toLowerCase() === 'x') : false;
      const title = checkMatch ? checkMatch[2] : content;

      if (isSubtask && lastTask) {
        lastTask.subtasks.push({
          id: uuidv4(),
          title: title,
          completed: isCompleted
        });
      } else {
        // Main Task
        let category: TaskCategory = "Feature";
        const lowerTitle = title.toLowerCase();
        
        if (lowerTitle.includes("bug") || lowerTitle.includes("fix")) category = "Bug";
        else if (lowerTitle.includes("doc") || lowerTitle.includes("readme")) category = "Doc";
        else if (lowerTitle.includes("meeting") || lowerTitle.includes("sync")) category = "Meeting";
        
        const newTask: Task = {
          id: uuidv4(),
          title: title,
          description: "",
          status: isCompleted ? "done" : "todo",
          category,
          sprint: currentSprint || "Backlog",
          startDate: currentDate,
          dueDate: currentDate,
          assignees: [],
          subtasks: [],
          createdAt: Date.now(),
        };
        
        tasks.push(newTask);
        lastTask = newTask;
      }
    }
  });
  
  return tasks;
};
