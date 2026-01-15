import { Menu, Button, Modal, Dropdown } from "antd";
import { Filter, LayoutDashboard, Layers, Trash2, MoreVertical } from "lucide-react";
import { useTaskStore } from "../store/useTaskStore";
import type { MenuProps } from "antd";

// Define menu item type helper
type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
  type?: 'group',
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
    type,
  } as MenuItem;
}



export const FilterSidebar = () => {
    const { savedFilters, activeFilter, setActiveFilter, deleteSavedFilter, setSearchQuery, epics } = useTaskStore();

    // Transform store data into Menu Items
    const items: MenuItem[] = [
        getItem('All Tasks', 'all', <Filter className="w-4 h-4" />),
        
        { type: 'divider' },

        getItem('Epics', 'epics-group', <Layers className="w-4 h-4" />, 
            epics.length > 0 ? epics.map(epic => 
                getItem(
                    <div className="flex justify-between items-center group w-full pr-2">
                         <div className="flex items-center gap-2 overflow-hidden">
                             <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: epic.color }} />
                             <span className="truncate">{epic.title}</span>
                         </div>
                         <Dropdown
                            menu={{
                                items: [
                                    {
                                        key: 'delete',
                                        label: 'Delete',
                                        icon: <Trash2 className="w-3 h-3" />,
                                        danger: true,
                                        onClick: (e) => {
                                            e.domEvent.stopPropagation();
                                            Modal.confirm({
                                                title: 'Delete Epic?',
                                                content: `Delete "${epic.title}"? Tasks will be preserved but unlinked.`,
                                                okType: 'danger',
                                                onOk: () => {
                                                    // Stop propagation handled by Modal, but let's be safe
                                                    useTaskStore.getState().deleteEpic(epic.id);
                                                }
                                            });
                                        }
                                    }
                                ]
                            }}
                            trigger={['click']}
                         >
                             <Button 
                                type="text" 
                                size="small" 
                                className="opacity-0 group-hover:opacity-100 p-0 h-6 w-6 flex items-center justify-center text-muted-foreground"
                                onClick={(e) => e.stopPropagation()}
                                icon={<MoreVertical className="w-3 h-3" />}
                             />
                         </Dropdown>
                    </div>, 
                    `epic-${epic.id}`
                )
            ) : [getItem(<span className="text-muted-foreground italic text-xs">No Epics</span>, 'no-epics', null, undefined, 'group')]
        ),

        { type: 'divider' },

        getItem('Saved Filters', 'saved-group', <LayoutDashboard className="w-4 h-4" />, 
             savedFilters.length > 0 ? savedFilters.map(filter => 
                getItem(
                    <div className="flex justify-between items-center group w-full">
                        <span className="truncate">{filter.name}</span>
                        <Button 
                            type="text" 
                            size="small" 
                            className="opacity-0 group-hover:opacity-100 p-0 h-auto text-muted-foreground hover:text-red-500"
                            onClick={(e) => {
                                e.stopPropagation();
                                Modal.confirm({
                                    title: 'Delete Filter?',
                                    content: `Are you sure you want to delete "${filter.name}"?`,
                                    onOk: () => deleteSavedFilter(filter.id)
                                });
                            }}
                            icon={<Trash2 className="w-3 h-3" />}
                        />
                    </div>,
                    `filter-${filter.id}`
                )
            ) : [getItem(<span className="text-muted-foreground italic text-xs">No Saved Filters</span>, 'no-saved', null, undefined, 'group')]
        ),
    ];

    const onClick: MenuProps['onClick'] = (e) => {
        if (e.key === 'all') {
            setActiveFilter({});
        } else if (e.key.startsWith('epic-')) {
            const epicId = e.key.replace('epic-', '');
            // Multi-select logic for Epics
            const currentEpics = activeFilter.epics || [];
            const newEpics = currentEpics.includes(epicId)
                ? currentEpics.filter(id => id !== epicId)
                : [...currentEpics, epicId];
            
            setActiveFilter({
                ...activeFilter,
                epics: newEpics.length > 0 ? newEpics : undefined
            });
        } else if (e.key.startsWith('filter-')) {
            const filterId = e.key.replace('filter-', '');
            const filter = savedFilters.find(f => f.id === filterId);
            if (filter) {
                // When selecting a generic filter, preserve currently selected Epics 
                // unless the filter itself explicitly limits Epics.
                const newFilter = { ...filter.criteria };
                if (!newFilter.epics || newFilter.epics.length === 0) {
                    newFilter.epics = activeFilter.epics;
                }
                
                setActiveFilter(newFilter);
                setSearchQuery(filter.criteria.search || "");
            }
        }
    };

    // Determine selected keys based on active state
    const getSelectedKeys = () => {
        const keys: string[] = [];
        if (Object.keys(activeFilter).length === 0) keys.push('all');
        
        if (activeFilter.epics) {
            activeFilter.epics.forEach(id => keys.push(`epic-${id}`));
        }
        
        const activeSaved = savedFilters.find(f => JSON.stringify(f.criteria) === JSON.stringify(activeFilter));
        if (activeSaved) keys.push(`filter-${activeSaved.id}`);

        return keys;
    };

    return (
        <Menu
            mode="inline"
            selectedKeys={getSelectedKeys()}
            defaultOpenKeys={['epics-group', 'saved-group']}
            style={{ height: '100%', borderRight: 0, background: 'transparent' }}
            items={items}
            onClick={onClick}
        />
    );
};
