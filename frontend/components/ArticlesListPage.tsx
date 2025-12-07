import { useState, useEffect } from 'react';
import { Settings, Article } from '../App';
import { Newspaper, TrendingUp, Heart, Shield, ChevronRight, Loader2 } from 'lucide-react';
import { fetchArticleSummary } from '../apis/api';

interface ArticlesListPageProps {
  settings: Settings;
  navigateTo: (screen: 'article', category?: string, article?: Article) => void;
}

// Base articles data without summaries (summaries will be fetched from API)
const articlesData = {
  Economic: [
    {
      id: 1,
      title: 'Federal Reserve Announces New Interest Rate Decision',
      category: 'Economic',
      summary: '',
      date: '2025-12-07',
      content: 'The Federal Reserve announced today that it will maintain the current federal funds rate at 5.25-5.50%. This decision comes as policymakers balance the need to control inflation while supporting continued economic growth. Fed Chair Jerome Powell stated that the central bank remains data-dependent and will adjust policy as needed. The decision was widely expected by financial markets, with most economists predicting a pause in rate adjustments. Consumer spending has remained resilient, and the labor market continues to show strength with unemployment near historic lows. However, inflation remains above the Fed\'s 2% target, prompting continued vigilance from policymakers.',
      simpleContent: 'The Federal Reserve is the central bank of the United States. They have decided to keep interest rates the same for now. Interest rates affect how much it costs to borrow money. When rates are higher, loans for things like houses and cars cost more. The Fed wants to make sure prices don\'t go up too fast (that\'s called inflation), but they also want people to keep their jobs and the economy to stay healthy. Right now, they think keeping rates where they are is the best choice.',
      verySimpleContent: 'The people in charge of our country\'s money decided to keep things the same for now. This affects how much it costs when people borrow money from banks.',
      meaningForYou: 'If you have a savings account, the interest rates will likely stay the same. If you\'re planning to get a loan or mortgage, the rates probably won\'t change much in the near future.',
      terms: [
        { term: 'Federal Reserve', definition: 'The central bank of the United States that manages the country\'s money and economy' },
        { term: 'Interest Rate', definition: 'The cost of borrowing money, shown as a percentage' },
        { term: 'Inflation', definition: 'When prices for goods and services go up over time' }
      ]
    },
    {
      id: 2,
      title: 'Stock Market Reaches New Record High',
      category: 'Economic',
      summary: '',
      date: '2025-12-06',
      content: 'The S&P 500 and Dow Jones Industrial Average both closed at record highs today, driven by strong corporate earnings reports and optimism about the economic outlook. Technology stocks led the rally, with major companies reporting better-than-expected quarterly results. Investors are showing increased confidence despite ongoing concerns about inflation and geopolitical tensions. Market analysts point to resilient consumer spending and robust job growth as key factors supporting the rally. The broad-based gains suggest investors believe the economy can continue growing without triggering a recession.',
      simpleContent: 'The stock market is where people buy and sell small pieces of companies. Today, the stock market reached its highest point ever. This happened because many companies are doing well and making good profits. When companies do well, investors (people who own stocks) feel confident and happy. This is generally good news because it means businesses are healthy and the economy is doing okay.',
      verySimpleContent: 'The stock market went up to its highest level ever. This is usually good news and means companies are doing well.',
      meaningForYou: 'If you have retirement savings or investments in the stock market, they may have increased in value. This is generally positive for your long-term financial health.',
      terms: [
        { term: 'Stock Market', definition: 'A place where people buy and sell shares of companies' },
        { term: 'S&P 500', definition: 'An index that tracks 500 of the largest U.S. companies' },
        { term: 'Investor', definition: 'A person who puts money into stocks, bonds, or other assets to try to make a profit' }
      ]
    },
    {
      id: 3,
      title: 'Unemployment Rate Drops to Historic Low',
      category: 'Economic',
      summary: '',
      date: '2025-12-05',
      content: 'The U.S. unemployment rate dropped to 3.5% in November, matching the lowest level seen in more than five decades. Employers added 250,000 jobs last month, exceeding economists\' expectations. The strong job market reflects continued business confidence and consumer demand. Sectors showing the strongest growth include healthcare, professional services, and hospitality. Wage growth also accelerated, with average hourly earnings increasing 4.2% year-over-year. However, some economists warn that the tight labor market could put upward pressure on inflation as employers compete for workers by raising wages.',
      simpleContent: 'Unemployment means people who want to work but can\'t find a job. The unemployment rate is now very low at 3.5%, which means most people who want jobs have them. This is the lowest it\'s been in over 50 years! Businesses hired 250,000 new people last month. This is good news because it means the economy is strong and companies need workers. When people have jobs, they can support their families and spend money, which keeps the economy healthy.',
      verySimpleContent: 'Almost everyone who wants a job has one now. This is very good news and hasn\'t happened in a long time.',
      meaningForYou: 'This strong job market means if you or someone you know is looking for work, there are many opportunities available. It also means businesses are doing well.',
      terms: [
        { term: 'Unemployment Rate', definition: 'The percentage of people who want to work but don\'t have a job' },
        { term: 'Job Market', definition: 'The availability of jobs in the economy' },
        { term: 'Wage Growth', definition: 'How much pay increases over time' }
      ]
    }
  ],
  Health: [
    {
      id: 4,
      title: 'New Alzheimer\'s Treatment Shows Promising Results',
      category: 'Health',
      summary: '',
      date: '2025-12-07',
      content: 'A groundbreaking new treatment for Alzheimer\'s disease has shown significant promise in late-stage clinical trials. The medication, which targets amyloid plaques in the brain, was found to slow cognitive decline by 27% in patients with early-stage Alzheimer\'s. Researchers studied more than 1,800 participants over 18 months, comparing those who received the treatment to those who received a placebo. While the drug doesn\'t cure Alzheimer\'s, it represents a major step forward in managing the disease. The FDA is expected to review the treatment for approval in the coming months. Medical experts emphasize that early detection and treatment are crucial for the best outcomes.',
      simpleContent: 'Alzheimer\'s is a disease that affects memory and thinking, usually in older adults. Scientists have been testing a new medicine that might help slow down this disease. In their studies, people who took the medicine stayed healthier longer compared to those who didn\'t. The medicine works by cleaning up harmful proteins in the brain. While it can\'t cure Alzheimer\'s completely, it can help people keep their memory and thinking skills for a longer time. This is very exciting news for families dealing with Alzheimer\'s.',
      verySimpleContent: 'Doctors found a new medicine that can help people with memory problems stay healthier longer. This is very good news.',
      meaningForYou: 'If you or a loved one has been diagnosed with early Alzheimer\'s, this new treatment may become an option soon. Talk to your doctor about it.',
      terms: [
        { term: 'Alzheimer\'s Disease', definition: 'A brain disease that causes memory loss and confusion, usually in older people' },
        { term: 'Clinical Trial', definition: 'A research study where scientists test new treatments on people' },
        { term: 'Cognitive Decline', definition: 'Gradual loss of thinking and memory abilities' }
      ]
    },
    {
      id: 5,
      title: 'CDC Recommends Updated COVID-19 Vaccines for Fall',
      category: 'Health',
      summary: '',
      date: '2025-12-06',
      content: 'The Centers for Disease Control and Prevention (CDC) has officially recommended that all Americans aged 6 months and older receive the updated COVID-19 vaccine this fall. The new vaccine formulation has been designed to better protect against currently circulating variants of the virus. CDC Director Dr. Mandy Cohen emphasized that vaccination remains the best defense against severe illness and hospitalization. The recommendation comes as respiratory virus season approaches, and health officials want to prevent a surge in cases. The updated vaccines are available at pharmacies, clinics, and doctor\'s offices nationwide, often at no cost to patients.',
      simpleContent: 'COVID-19 is the virus that caused the pandemic a few years ago. The virus has changed over time, so scientists made a new vaccine that works better against the current version. The CDC (the government health experts) says everyone should get this new vaccine. It\'s especially important for older adults because they can get very sick from COVID-19. The vaccine is free and available at most pharmacies and doctors\' offices. Getting vaccinated helps protect you and the people around you.',
      verySimpleContent: 'There\'s a new vaccine shot for COVID-19. Health experts say you should get it to stay healthy.',
      meaningForYou: 'Getting the updated COVID-19 vaccine can protect you from getting seriously ill. It\'s free and available at your local pharmacy or doctor\'s office.',
      terms: [
        { term: 'CDC', definition: 'Centers for Disease Control and Prevention - the U.S. government health agency' },
        { term: 'Vaccine', definition: 'A medicine that helps your body fight off diseases' },
        { term: 'Variant', definition: 'A slightly different version of a virus' }
      ]
    },
    {
      id: 6,
      title: 'Study Links Daily Walking to Lower Heart Disease Risk',
      category: 'Health',
      summary: '',
      date: '2025-12-05',
      content: 'A comprehensive new study published in the Journal of the American Medical Association found that walking for just 30 minutes a day can reduce the risk of heart disease by up to 35%. Researchers followed 15,000 adults over a 10-year period, tracking their physical activity and cardiovascular health. The study found that the benefits of walking were consistent across all age groups, but were particularly pronounced in adults over 60. Even moderate-paced walking showed significant health benefits. The researchers emphasized that walking is a low-impact, accessible form of exercise that most people can incorporate into their daily routines without special equipment or gym memberships.',
      simpleContent: 'Scientists studied thousands of people for 10 years to see how exercise affects the heart. They found that people who walk for 30 minutes every day are much less likely to have heart problems. The good news is you don\'t have to walk fast or run - even a normal, comfortable walking pace helps. Walking is great because almost anyone can do it, you don\'t need special equipment, and it\'s free. It\'s especially helpful for older adults in keeping their hearts healthy.',
      verySimpleContent: 'Walking every day for 30 minutes is very good for your heart. It can help you stay healthy.',
      meaningForYou: 'Taking a daily 30-minute walk can significantly improve your heart health. This could be walking around your neighborhood, at a park, or even at a mall.',
      terms: [
        { term: 'Heart Disease', definition: 'Health problems affecting the heart and blood vessels' },
        { term: 'Cardiovascular Health', definition: 'The health of your heart and blood circulation system' },
        { term: 'Low-Impact Exercise', definition: 'Physical activity that is easy on your joints and body' }
      ]
    }
  ],
  Defense: [
    {
      id: 7,
      title: 'Pentagon Announces New Cybersecurity Initiative',
      category: 'Defense',
      summary: '',
      date: '2025-12-07',
      content: 'The Department of Defense unveiled a major new cybersecurity initiative aimed at protecting critical infrastructure from digital threats. The program will invest $5 billion over the next three years to enhance cyber defenses across military and civilian networks. Secretary of Defense Lloyd Austin emphasized the growing importance of cybersecurity in national defense, noting that adversaries are increasingly using digital attacks to target government systems, power grids, and financial institutions. The initiative includes partnerships with private technology companies and increased training for military cyber personnel. Officials say the program will create thousands of new jobs in cybersecurity fields.',
      simpleContent: 'Cybersecurity means protecting computers and networks from hackers and digital attacks. The military is starting a big new program to make our country\'s computer systems safer. They will spend $5 billion to build better defenses against hackers. This is important because bad actors from other countries sometimes try to break into government computers or even things like power plants. The program will also create many new jobs for people who know how to protect computer systems. This helps keep our country and its important systems safe.',
      verySimpleContent: 'The military is spending money to protect our country\'s computers from hackers. This will help keep us safe.',
      meaningForYou: 'This initiative aims to protect systems that affect your daily life, like power grids and financial institutions, from cyberattacks.',
      terms: [
        { term: 'Cybersecurity', definition: 'Protecting computers and networks from digital attacks and hackers' },
        { term: 'Critical Infrastructure', definition: 'Important systems like power plants, water supply, and communication networks' },
        { term: 'Department of Defense', definition: 'The part of the U.S. government responsible for military and national security' }
      ]
    },
    {
      id: 8,
      title: 'Military Veterans to Receive Enhanced Healthcare Benefits',
      category: 'Defense',
      summary: '',
      date: '2025-12-06',
      content: 'Congress has passed bipartisan legislation significantly expanding healthcare benefits for military veterans. The new law provides comprehensive coverage for mental health services, including therapy and counseling for PTSD and other service-related conditions. It also eliminates copays for preventive care and expands access to VA hospitals and clinics in rural areas. The legislation includes funding for 50 new VA facilities and telemedicine services to reach veterans in underserved communities. Veterans Affairs Secretary Denis McDonough called it "the most significant expansion of veteran benefits in a generation." The changes will take effect on January 1, 2026.',
      simpleContent: 'Veterans are people who served in the military. Congress just passed a new law that gives veterans better healthcare. This includes more help with mental health, like counseling for stress or trauma from military service. The law also makes it easier for veterans to see doctors, especially those who live in rural areas far from VA hospitals. Veterans won\'t have to pay copays for check-ups and preventive care anymore. This is important because many veterans face health challenges from their service, and they deserve good care.',
      verySimpleContent: 'People who served in the military will get better healthcare now, including more help with mental health.',
      meaningForYou: 'If you or someone you know is a veteran, you\'ll have better access to healthcare, especially mental health services, starting January 2026.',
      terms: [
        { term: 'Veteran', definition: 'Someone who served in the military' },
        { term: 'PTSD', definition: 'Post-Traumatic Stress Disorder - a mental health condition caused by traumatic experiences' },
        { term: 'VA', definition: 'Veterans Affairs - the government department that helps former military members' }
      ]
    },
    {
      id: 9,
      title: 'NATO Strengthens Eastern European Defenses',
      category: 'Defense',
      summary: '',
      date: '2025-12-05',
      content: 'NATO member countries have agreed to significantly strengthen military presence in Eastern Europe in response to ongoing security concerns. The alliance will deploy an additional 10,000 troops to Poland, the Baltic states, and Romania over the next six months. NATO Secretary General Jens Stoltenberg emphasized that the move is defensive in nature and aimed at reassuring allies about their collective security. The deployment includes enhanced air defense systems and rapid response forces. U.S. forces will make up approximately 40% of the additional personnel. NATO leaders stressed their commitment to Article 5, which states that an attack on one member is considered an attack on all members.',
      simpleContent: 'NATO is a group of countries that work together for safety and defense. It includes the United States and many European countries. NATO is sending more soldiers and military equipment to countries in Eastern Europe to help keep them safe. This is to show that NATO countries protect each other. About 10,000 more troops will go to countries like Poland to make sure everyone feels secure. The United States is sending many of these troops. This is about countries working together to keep peace and prevent problems.',
      verySimpleContent: 'The United States and friendly countries are sending more soldiers to Eastern Europe to help keep everyone safe.',
      meaningForYou: 'This is part of international efforts to maintain peace and security. It may affect news coverage and discussions about international relations.',
      terms: [
        { term: 'NATO', definition: 'North Atlantic Treaty Organization - a group of countries that promise to defend each other' },
        { term: 'Deployment', definition: 'Sending military forces to a specific location' },
        { term: 'Article 5', definition: 'NATO\'s rule that says if one member is attacked, all members will help defend them' }
      ]
    }
  ]
};

export function ArticlesListPage({ settings, navigateTo }: ArticlesListPageProps) {
  const isDark = settings.darkMode;
  const [selectedCategory, setSelectedCategory] = useState<'Economic' | 'Health' | 'Defense'>('Economic');
  const [articlesWithSummaries, setArticlesWithSummaries] = useState<{[key: string]: Article[]}>(articlesData as any);
  const [loadingSummaries, setLoadingSummaries] = useState<{[key: number]: boolean}>({});

  const categories = [
    { name: 'Economic' as const, icon: TrendingUp, color: 'blue' },
    { name: 'Health' as const, icon: Heart, color: 'red' },
    { name: 'Defense' as const, icon: Shield, color: 'green' }
  ];

  const handleArticleClick = (article: Article) => {
    navigateTo('article', article.category, article);
  };

  useEffect(() => {
    const fetchSummaries = async () => {
      // Fetch summaries for all articles
      const allCategories = Object.keys(articlesData) as ('Economic' | 'Health' | 'Defense')[];
      
      for (const category of allCategories) {
        for (const article of articlesData[category]) {
          if (!article.summary) {
            setLoadingSummaries(prev => ({ ...prev, [article.id]: true }));
            
            try {
              const summary = await fetchArticleSummary(article.id, article.title, article.content);
              
              setArticlesWithSummaries(prev => ({
                ...prev,
                [category]: prev[category].map(a => 
                  a.id === article.id ? { ...a, summary } : a
                )
              }));
            } catch (error) {
              console.error(`Failed to fetch summary for article ${article.id}:`, error);
            } finally {
              setLoadingSummaries(prev => ({ ...prev, [article.id]: false }));
            }
          }
        }
      }
    };

    fetchSummaries();
  }, []);

  return (
    <div className={`min-h-screen flex flex-col items-center p-6 pt-20 ${isDark ? 'bg-slate-900' : 'bg-gradient-to-br from-blue-50 to-green-50'}`}>
      <div className="w-full max-w-5xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 animate-fadeIn">
          <div className="flex justify-center mb-4">
            <div className={`p-6 rounded-full ${isDark ? 'bg-blue-600' : 'bg-blue-500'} transform hover:scale-110 hover:rotate-6 transition-all`}>
              <Newspaper className="w-16 h-16 text-white" strokeWidth={2.5} />
            </div>
          </div>
          <h1 className={isDark ? 'text-white' : 'text-slate-800'} style={{ fontSize: '3em' }}>
            News Articles
          </h1>
          <p className={`${isDark ? 'text-slate-300' : 'text-slate-600'}`} style={{ fontSize: '1.5em' }}>
            Browse articles by category
          </p>
        </div>

        {/* Category Selector */}
        <div className="flex gap-4 justify-center flex-wrap animate-scaleIn">
          {categories.map((category) => {
            const Icon = category.icon;
            const isSelected = selectedCategory === category.name;
            
            return (
              <button
                key={category.name}
                onClick={() => setSelectedCategory(category.name)}
                className={`flex items-center gap-3 px-8 py-4 rounded-2xl transition-all transform hover:scale-105 ${
                  isSelected
                    ? category.color === 'blue'
                      ? isDark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                      : category.color === 'red'
                        ? isDark ? 'bg-red-600 text-white' : 'bg-red-500 text-white'
                        : isDark ? 'bg-green-600 text-white' : 'bg-green-500 text-white'
                    : isDark
                      ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      : 'bg-white text-slate-700 hover:bg-slate-100'
                } shadow-lg`}
                style={{ fontSize: '1.3em' }}
              >
                <Icon className="w-7 h-7" strokeWidth={2.5} />
                {category.name}
              </button>
            );
          })}
        </div>

        {/* Articles List */}
        <div id="articles-list" className="space-y-4 animate-fadeIn">
          {articlesWithSummaries[selectedCategory].map((article, index) => (
            <button
              key={article.id}
              id={index === 0 ? 'article-card' : undefined}
              onClick={() => handleArticleClick(article)}
              className={`w-full p-6 rounded-2xl transition-all transform hover:scale-102 hover:shadow-2xl text-left ${
                isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-white hover:bg-slate-50'
              } shadow-lg`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-4 py-1 rounded-full text-sm ${
                      selectedCategory === 'Economic'
                        ? isDark ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700'
                        : selectedCategory === 'Health'
                          ? isDark ? 'bg-red-600 text-white' : 'bg-red-100 text-red-700'
                          : isDark ? 'bg-green-600 text-white' : 'bg-green-100 text-green-700'
                    }`}>
                      {article.category}
                    </span>
                    <span className={`${isDark ? 'text-slate-400' : 'text-slate-500'}`} style={{ fontSize: '0.9em' }}>
                      {article.date}
                    </span>
                  </div>
                  <h3 className={`mb-3 ${isDark ? 'text-white' : 'text-slate-800'}`} style={{ fontSize: '1.5em', lineHeight: '1.4' }}>
                    {article.title}
                  </h3>
                  <p className={`${isDark ? 'text-slate-300' : 'text-slate-600'}`} style={{ fontSize: '1.1em', lineHeight: '1.6' }}>
                    {loadingSummaries[article.id] ? <Loader2 className="w-5 h-5 animate-spin" /> : article.summary}
                  </p>
                </div>
                <ChevronRight className={`w-8 h-8 ${isDark ? 'text-slate-400' : 'text-slate-400'} flex-shrink-0`} />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}