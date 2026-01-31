// Utility to resolve isnad chain IDs to scholar names
export async function resolveIsnadChain(chainIds: string[]): Promise<string[]> {
  const names: string[] = [];
  
  for (const id of chainIds) {
    try {
      const response = await fetch(`/data/scholars/${id}.json`);
      if (response.ok) {
        const data = await response.json();
        // Extract just the name without the Arabic part for brevity
        const fullName = data.name || data.full_name || id;
        // Try to extract English name before parentheses
        const englishName = fullName.split('(')[0].trim();
        names.push(englishName);
      } else {
        names.push(id); // Fallback to ID if scholar not found
      }
    } catch (error) {
      names.push(id); // Fallback to ID on error
    }
  }
  
  return names;
}

// Synchronous version using search index (more efficient)
export function resolveIsnadChainSync(chainIds: string[], searchIndex: any[]): Array<{id: string, name: string, grade: string, reliability_grade: string}> {
  return chainIds.map(id => {
    const scholar = searchIndex.find((s: any) => s.id === id);
    if (scholar) {
      // Extract English name before parentheses
      const fullName = scholar.name || id;
      const englishName = fullName.split('(')[0].trim();
      return {
        id,
        name: englishName,
        grade: scholar.grade || '',
        reliability_grade: scholar.reliability_grade || ''
      };
    }
    return {
      id,
      name: id,
      grade: '',
      reliability_grade: ''
    };
  });
}
