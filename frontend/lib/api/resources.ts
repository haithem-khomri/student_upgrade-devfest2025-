// Static mock data - no API calls

export interface Resource {
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'link' | 'article';
  url: string;
  moduleId: string;
  moduleName: string;
  rating?: number; // 1-5
  userRating?: number; // User's personal rating
  description?: string;
  tags?: string[];
}

export interface ResourceRecommendationRequest {
  moduleId?: string;
  limit?: number;
}

// Mock resources data
const mockResources: Resource[] = [
  {
    id: '1',
    title: 'مقدمة في الرياضيات التطبيقية',
    type: 'pdf',
    url: '#',
    moduleId: '1',
    moduleName: 'الرياضيات',
    rating: 4.5,
    description: 'ملف PDF شامل يغطي أساسيات الرياضيات التطبيقية',
    tags: ['رياضيات', 'أساسيات'],
  },
  {
    id: '2',
    title: 'شرح الفيزياء الحديثة',
    type: 'video',
    url: '#',
    moduleId: '2',
    moduleName: 'الفيزياء',
    rating: 4.8,
    description: 'فيديو تعليمي يشرح مفاهيم الفيزياء الحديثة',
    tags: ['فيزياء', 'فيديو'],
  },
  {
    id: '3',
    title: 'أساسيات البرمجة بلغة Python',
    type: 'article',
    url: '#',
    moduleId: '3',
    moduleName: 'علوم الحاسوب',
    rating: 4.2,
    description: 'مقال تفصيلي عن أساسيات البرمجة',
    tags: ['برمجة', 'Python'],
  },
  {
    id: '4',
    title: 'ملخص التحليل الرياضي',
    type: 'pdf',
    url: '#',
    moduleId: '1',
    moduleName: 'الرياضيات',
    rating: 4.6,
    description: 'ملخص شامل لمادة التحليل الرياضي',
    tags: ['رياضيات', 'تحليل'],
  },
  {
    id: '5',
    title: 'تجارب الفيزياء العملية',
    type: 'video',
    url: '#',
    moduleId: '2',
    moduleName: 'الفيزياء',
    rating: 4.4,
    description: 'فيديو يعرض تجارب فيزيائية عملية',
    tags: ['فيزياء', 'تجارب'],
  },
  {
    id: '6',
    title: 'هياكل البيانات والخوارزميات',
    type: 'link',
    url: '#',
    moduleId: '3',
    moduleName: 'علوم الحاسوب',
    rating: 4.7,
    description: 'رابط لمصادر تعليمية عن هياكل البيانات',
    tags: ['برمجة', 'خوارزميات'],
  },
];

export const resourcesApi = {
  getRecommendations: async (
    request: ResourceRecommendationRequest = {}
  ): Promise<Resource[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let resources = [...mockResources];
    
    if (request.moduleId) {
      resources = resources.filter(r => r.moduleId === request.moduleId);
    }
    
    if (request.limit) {
      resources = resources.slice(0, request.limit);
    }
    
    return resources;
  },
  
  rateResource: async (resourceId: string, rating: number): Promise<void> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    console.log(`تم تقييم المورد ${resourceId} بـ ${rating} نجوم`);
  },
  
  getAllResources: async (moduleId?: string): Promise<Resource[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (moduleId) {
      return mockResources.filter(r => r.moduleId === moduleId);
    }
    
    return mockResources;
  },
};
