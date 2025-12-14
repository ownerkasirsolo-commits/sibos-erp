
import { useGlobalContext } from '../../../context/GlobalContext';

export const useSignageLogic = () => {
    const { signage, updateSignageContent } = useGlobalContext();

    const toggleActive = (id: string) => {
      const content = signage.find(c => c.id === id);
      if (content) {
        updateSignageContent(id, { active: !content.active });
      }
    };
    
    // The active content is derived reactively from the global state (which comes from useLiveQuery)
    const activeContent = signage.find(c => c.active);

    return {
        contentList: signage,
        activeContent,
        toggleActive
    };
};