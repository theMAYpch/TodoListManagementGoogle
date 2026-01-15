
import { describe, it, expect } from 'vitest';
import { parseImportText } from './parser';

describe('Epic Parsing Logic', () => {
    it('should create new epic from header', () => {
        const input = `Epic: Frontend Redesign
- Design new header`;
        const { tasks, newEpics } = parseImportText(input);
        
        expect(newEpics).toHaveLength(1);
        expect(newEpics[0].title).toBe('Frontend Redesign');
        expect(tasks).toHaveLength(1);
        expect(tasks[0].epicId).toBe(newEpics[0].id);
    });

    it('should match existing epic', () => {
        const existingEpics = [{ id: 'epic-123', title: 'Backend' }];
        const input = `Epic: Backend
- Optimize API`;
        const { tasks, newEpics } = parseImportText(input, existingEpics);
        
        expect(newEpics).toHaveLength(0);
        expect(tasks).toHaveLength(1);
        expect(tasks[0].epicId).toBe('epic-123');
    });

    it('should handle multiple epics', () => {
        const input = `Epic: Alpha
- Task A

Epic: Beta
- Task B`;
        const { tasks, newEpics } = parseImportText(input);
        
        expect(newEpics).toHaveLength(2);
        expect(newEpics[0].title).toBe('Alpha');
        expect(newEpics[1].title).toBe('Beta');
        
        expect(tasks[0].title).toBe('Task A');
        expect(tasks[0].epicId).toBe(newEpics[0].id);
        
        expect(tasks[1].title).toBe('Task B');
        expect(tasks[1].epicId).toBe(newEpics[1].id);
    });
});
