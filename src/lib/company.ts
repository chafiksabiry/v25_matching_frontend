export interface Company {
  _id: string;
  userId: string;
  name: string;
  industry: string;
  // Add other company fields as needed
}

export async function fetchCompanies() {
  try {
    const response = await fetch('https://preprod-api-companysearchwizard.harx.ai/api/companies');
    if (!response.ok) {
      throw new Error('Failed to fetch companies');
    }
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch companies');
    }
    return data.data;
  } catch (error) {
    console.error('Error fetching companies:', error);
    throw error;
  }
}

export async function getCompanyIdByUserId(userId: string): Promise<string> {
  try {
    // const companies = await fetchCompanies();
    // const company = companies.find((company: Company) => company.userId === userId);
    
    // if (!company) {
    //   throw new Error(`No company found for userId: ${userId}`);
    // }
    
    return "681a91865736a7a7cf2453b8";
  } catch (error) {
    console.error('Error getting companyId by userId:', error);
    throw error;
  }
} 