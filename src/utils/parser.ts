import type { Task, TaskCategory } from "../types";
import { v4 as uuidv4 } from 'uuid';

export const parseImportText = (text: string, existingEpics: { id: string, title: string }[] = []): { tasks: Task[], newEpics: any[] } => {
  const lines = text.split('\n').filter(l => l.trim() !== '');
  const tasks: Task[] = [];
  const newEpics: any[] = [];
  
  let currentSprint = "";
  let currentDate = "";
  let currentEpicId: string | undefined = undefined;
  let lastTask: Task | null = null;
  
  // Regex patterns
  const sprintRegex = /^(sprint\s+\d+|sprint:\s*\d+)/i;
  const epicRegex = /^epic:\s*(.+)/i;
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

    // Check for Epic header
    const epicMatch = trimmed.match(epicRegex);
    if (epicMatch) {
      const epicTitle = epicMatch[1].trim();
      
      // Check if epic already exists
      const existingEpic = existingEpics.find(e => e.title.toLowerCase() === epicTitle.toLowerCase());
      if (existingEpic) {
        currentEpicId = existingEpic.id;
      } else {
        // Check if we already created a new epic for this session
        const alreadyNewEpic = newEpics.find(e => e.title.toLowerCase() === epicTitle.toLowerCase());
        if (alreadyNewEpic) {
          currentEpicId = alreadyNewEpic.id;
        } else {
          // Create new epic
          const newEpic = {
            id: uuidv4(),
            title: epicTitle,
            color: '#3b82f6',
            status: 'active'
          };
          newEpics.push(newEpic);
          currentEpicId = newEpic.id;
        }
      }
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
          epicId: currentEpicId,
          createdAt: Date.now(),
        };
        
        tasks.push(newTask);
        lastTask = newTask;
      }
    }
  });
  
  return { tasks, newEpics };
};
