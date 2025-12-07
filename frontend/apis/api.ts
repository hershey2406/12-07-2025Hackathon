// Mock API function to fetch article summary
// Replace this with your actual API endpoint
export async function fetchArticleSummary(articleTitle: string, articleContent: string): Promise<string> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // TODO: Replace with actual API call
  // Example:
  // const response = await fetch('YOUR_API_ENDPOINT', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Authorization': 'Bearer YOUR_API_KEY'
  //   },
  //   body: JSON.stringify({
  //     articleId,
  //     title: articleTitle,
  //     content: articleContent
  //   })
  // });
  // const data = await response.json();
  // return data.summary;
  
  // Mock summaries for demonstration
  const mockSummaries: { [key: number]: string } = {
    1: 'The Federal Reserve has decided to maintain current interest rates to support economic growth while monitoring inflation.',
    2: 'Major stock indices hit all-time highs as investors show confidence in corporate earnings and economic stability.',
    3: 'The unemployment rate fell to 3.5%, the lowest level in over 50 years, as businesses continue hiring.',
    4: 'Clinical trials reveal that a new medication can slow cognitive decline in early-stage Alzheimer\'s patients.',
    5: 'Health officials urge Americans to get the new updated COVID-19 vaccine to protect against current variants.',
    6: 'Research shows that walking just 30 minutes daily can significantly reduce the risk of heart disease.',
    7: 'The Department of Defense launches a comprehensive program to strengthen national cybersecurity defenses.',
    8: 'Congress approves expanded healthcare coverage for veterans, including mental health services.',
    9: 'NATO allies agree to deploy additional forces to Eastern Europe to bolster regional security.'
  };
  
  return mockSummaries[articleId] || 'Summary not available.';
}
